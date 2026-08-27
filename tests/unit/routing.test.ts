/**
 * Маршрутизация — основа критериев приёмки §17: логотип ведёт на Home ветки,
 * RU/EN открывает эквивалент текущей страницы, чужие разделы недоступны.
 */

import { afterEach, describe, expect, it } from 'vitest';
import {
  directionHomeHref,
  equivalentPath,
  equivalentUrl,
  href,
  parseRoute,
  startHref,
} from '@/lib/routing';
import { DIRECTIONS, isSectionAvailable } from '@/lib/site';

describe('построение адресов', () => {
  it('собирает адрес по частям', () => {
    expect(href({ locale: 'ru', direction: 'business', section: 'cases', slug: 'x' })).toBe(
      '/ru/business/cases/x',
    );
    expect(href({ locale: 'en', direction: 'production' })).toBe('/en/production');
    expect(startHref('ru')).toBe('/ru');
  });

  it('логотип ведёт на Home текущей ветки с любой вложенной страницы', () => {
    const deepPages = [
      '/ru/business/cases/demo-industry-conference',
      '/ru/business/blog/demo-conference-backstage',
      '/en/production/work/demo-short-form-film',
    ];

    for (const path of deepPages) {
      const { locale, direction } = parseRoute(path);
      expect(direction).not.toBeNull();
      expect(directionHomeHref(locale, direction!)).toBe(`/${locale}/${direction}`);
    }
  });
});

describe('разбор адреса', () => {
  it('читает язык, направление, раздел и slug', () => {
    expect(parseRoute('/ru/business/cases/demo')).toEqual({
      locale: 'ru',
      direction: 'business',
      section: 'cases',
      slug: 'demo',
    });
  });

  it('на корне подставляет язык по умолчанию', () => {
    expect(parseRoute('/')).toEqual({ locale: 'ru', direction: null, section: null, slug: null });
  });

  it('не принимает чужие значения за направление и раздел', () => {
    const route = parseRoute('/ru/unknown/whatever');
    expect(route.direction).toBeNull();
    expect(route.section).toBeNull();
  });
});

describe('переключение языка', () => {
  it('открывает эквивалент страницы, а не Home', () => {
    expect(equivalentPath('/ru/business/cases/demo', 'en')).toBe('/en/business/cases/demo');
    expect(equivalentPath('/en/private/blog/note', 'ru')).toBe('/ru/private/blog/note');
  });

  it('на корне ведёт на START другого языка', () => {
    expect(equivalentPath('/', 'en')).toBe('/en');
  });

  it('сохраняет query и якорь', () => {
    expect(equivalentUrl('/ru/business/blog', 'en', 'type=backstage', 'list')).toBe(
      '/en/business/blog?type=backstage#list',
    );
  });

  it('не теряет уже оформленные query и якорь', () => {
    expect(equivalentUrl('/ru/private/portfolio', 'en', '?category=wedding', '#grid')).toBe(
      '/en/private/portfolio?category=wedding#grid',
    );
  });
});

describe('доступность разделов по веткам', () => {
  it('услуги и кейсы есть только в BUSINESS', () => {
    expect(isSectionAvailable('business', 'services')).toBe(true);
    expect(isSectionAvailable('private', 'services')).toBe(false);
    expect(isSectionAvailable('production', 'cases')).toBe(false);
  });

  it('шоурил и credits есть только в PRODUCTION', () => {
    expect(isSectionAvailable('production', 'showreel')).toBe(true);
    expect(isSectionAvailable('business', 'showreel')).toBe(false);
    expect(isSectionAvailable('private', 'experience')).toBe(false);
  });

  it('журнал, о себе и контакты есть во всех ветках', () => {
    for (const direction of DIRECTIONS) {
      expect(isSectionAvailable(direction, 'blog')).toBe(true);
      expect(isSectionAvailable(direction, 'about')).toBe(true);
      expect(isSectionAvailable(direction, 'contact')).toBe(true);
    }
  });
});

describe('канонический домен (§12)', () => {
  const saved = {
    explicit: process.env.NEXT_PUBLIC_SITE_URL,
    hosted: process.env.VERCEL_PROJECT_PRODUCTION_URL,
  };

  afterEach(async () => {
    const keys = ['NEXT_PUBLIC_SITE_URL', 'VERCEL_PROJECT_PRODUCTION_URL'] as const;
    for (const key of keys) delete process.env[key];
    if (saved.explicit) process.env.NEXT_PUBLIC_SITE_URL = saved.explicit;
    if (saved.hosted) process.env.VERCEL_PROJECT_PRODUCTION_URL = saved.hosted;
  });

  it('явная настройка важнее всего и теряет хвостовой слэш', async () => {
    process.env.NEXT_PUBLIC_SITE_URL = 'https://nikitasokolov.ru/';
    const { siteUrl } = await import('@/lib/site');
    expect(siteUrl()).toBe('https://nikitasokolov.ru');
  });

  it('без неё берётся домен хостинга, а не localhost', async () => {
    delete process.env.NEXT_PUBLIC_SITE_URL;
    process.env.VERCEL_PROJECT_PRODUCTION_URL = 'nik-sokolov-sait.vercel.app';
    const { siteUrl } = await import('@/lib/site');
    expect(siteUrl()).toBe('https://nik-sokolov-sait.vercel.app');
  });

  it('на своей машине остаётся локальный адрес', async () => {
    delete process.env.NEXT_PUBLIC_SITE_URL;
    delete process.env.VERCEL_PROJECT_PRODUCTION_URL;
    const { siteUrl } = await import('@/lib/site');
    expect(siteUrl()).toBe('http://localhost:3000');
  });

  // Переменная, заведённая на хостинге с пустым значением, роняла сборку:
  // пустая строка доходила до `new URL('')`.
  it.each(['', '   ', 'не адрес'])(
    'мусорное значение %j не ломает сборку, а игнорируется',
    async (value) => {
      process.env.NEXT_PUBLIC_SITE_URL = value;
      process.env.VERCEL_PROJECT_PRODUCTION_URL = 'nik-sokolov-sait.vercel.app';
      const { siteUrl } = await import('@/lib/site');
      expect(siteUrl()).toBe('https://nik-sokolov-sait.vercel.app');
    },
  );

  it('результат всегда пригоден для new URL() — иначе падает вся сборка', async () => {
    const { siteUrl } = await import('@/lib/site');
    for (const value of ['', ' ', 'мусор', 'https://ok.ru/', 'ok.ru', undefined]) {
      if (value === undefined) delete process.env.NEXT_PUBLIC_SITE_URL;
      else process.env.NEXT_PUBLIC_SITE_URL = value;
      delete process.env.VERCEL_PROJECT_PRODUCTION_URL;
      expect(() => new URL(siteUrl())).not.toThrow();
    }
  });

  it('домен без протокола понимается как https', async () => {
    process.env.NEXT_PUBLIC_SITE_URL = 'nikitasokolov.ru';
    const { siteUrl } = await import('@/lib/site');
    expect(siteUrl()).toBe('https://nikitasokolov.ru');
  });
});

describe('metadataBase не может уронить сборку', () => {
  const saved = process.env.NEXT_PUBLIC_SITE_URL;

  afterEach(() => {
    delete process.env.VERCEL_PROJECT_PRODUCTION_URL;
    if (saved) process.env.NEXT_PUBLIC_SITE_URL = saved;
    else delete process.env.NEXT_PUBLIC_SITE_URL;
  });

  // Падение здесь стоит не одной страницы, а всей выкладки: Next прерывает
  // сборку целиком на первой же ошибке в generateMetadata.
  it.each(['', '   ', 'мусор', 'https://', '://', 'ok.ru', 'https://ok.ru/путь'])(
    'значение %j даёт корректный URL, а не исключение',
    async (value) => {
      process.env.NEXT_PUBLIC_SITE_URL = value;
      const { siteUrlObject } = await import('@/lib/site');
      expect(() => siteUrlObject()).not.toThrow();
      expect(siteUrlObject()).toBeInstanceOf(URL);
    },
  );

  it('путь и хвостовой слэш отбрасываются: остаётся только домен', async () => {
    process.env.NEXT_PUBLIC_SITE_URL = 'https://ok.ru/lang/ru/';
    const { siteUrlObject } = await import('@/lib/site');
    expect(siteUrlObject().href).toBe('https://ok.ru/');
  });
});
