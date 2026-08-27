/**
 * Маршрутизация — основа критериев приёмки §17: логотип ведёт на Home ветки,
 * RU/EN открывает эквивалент текущей страницы, чужие разделы недоступны.
 */

import { describe, expect, it } from 'vitest';
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
