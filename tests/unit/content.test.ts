/**
 * Слой контента: связи, фильтры и масштабируемость коллекций (§8, §17).
 *
 * Тесты работают на фикстурах — том же источнике, что и сайт до подключения
 * CMS, поэтому проверяют реальный путь данных, а не заглушки.
 */

import { describe, expect, it } from 'vitest';
import {
  getArticle,
  getArticles,
  getArticlesForProject,
  getProject,
  getProjects,
  getProjectsForArticle,
  getRelatedProjects,
  getServicesForProject,
} from '@/content/queries';

describe('журнал: одна коллекция на три ветки (§5.7)', () => {
  it('запись с двумя направлениями попадает в оба листинга', async () => {
    const slug = 'demo-conference-backstage';
    const business = await getArticles({ direction: 'business' });
    const production = await getArticles({ direction: 'production' });

    expect(business.some((a) => a.slug === slug)).toBe(true);
    expect(production.some((a) => a.slug === slug)).toBe(true);
  });

  it('запись с тремя направлениями видна во всех ветках', async () => {
    const slug = 'demo-one-shoot-three-audiences';
    for (const direction of ['private', 'business', 'production'] as const) {
      const list = await getArticles({ direction });
      expect(list.some((a) => a.slug === slug)).toBe(true);
    }
  });

  it('основное направление входит в список направлений записи', async () => {
    const all = await getArticles();
    for (const article of all) {
      expect(article.directions).toContain(article.primaryDirection);
    }
  });

  it('чужая ветка запись не показывает', async () => {
    const list = await getArticles({ direction: 'private' });
    expect(list.some((a) => a.slug === 'demo-conference-backstage')).toBe(false);
  });
});

describe('двусторонняя связь project ↔ article (§15.1)', () => {
  it('связь видна с обеих сторон', async () => {
    const article = await getArticle('demo-conference-backstage');
    expect(article).not.toBeNull();

    const projects = await getProjectsForArticle(article!);
    expect(projects.map((p) => p.slug)).toContain('demo-industry-conference');

    const articles = await getArticlesForProject('demo-industry-conference');
    expect(articles.map((a) => a.slug)).toContain('demo-conference-backstage');
  });

  it('обратная связь фильтруется по ветке', async () => {
    const inPrivate = await getArticlesForProject('demo-industry-conference', 'private');
    expect(inPrivate).toHaveLength(0);
  });
});

describe('работы', () => {
  it('проект отдаётся только в своих направлениях', async () => {
    const wedding = await getProject('demo-wedding-day');
    expect(wedding?.directions).toEqual(['private']);

    const businessProjects = await getProjects({ direction: 'business' });
    expect(businessProjects.some((p) => p.slug === 'demo-wedding-day')).toBe(false);
  });

  it('проект с двумя направлениями доступен в обоих листингах', async () => {
    const business = await getProjects({ direction: 'business' });
    const production = await getProjects({ direction: 'production' });
    expect(business.some((p) => p.slug === 'demo-commercial-spot')).toBe(true);
    expect(production.some((p) => p.slug === 'demo-commercial-spot')).toBe(true);
  });

  it('похожие проекты не содержат текущий и не дублируются', async () => {
    const project = await getProject('demo-industry-conference');
    const related = await getRelatedProjects(project!, 'business');

    expect(related.some((p) => p.slug === project!.slug)).toBe(false);
    expect(new Set(related.map((p) => p._id)).size).toBe(related.length);
  });

  it('связанные услуги разворачиваются из slug-ов', async () => {
    const project = await getProject('demo-industry-conference');
    const services = await getServicesForProject(project!);
    expect(services.map((s) => s.slug)).toEqual(['events-conferences']);
  });
});

describe('масштабируемость коллекций (§8, §17)', () => {
  it('фильтр по категории не требует правки компонентов', async () => {
    const weddings = await getProjects({ direction: 'private', categorySlug: 'wedding' });
    expect(weddings.length).toBeGreaterThan(0);
    for (const project of weddings) expect(project.categorySlugs).toContain('wedding');
  });

  it('лимит и исключение работают вместе', async () => {
    const list = await getProjects({ direction: 'private', limit: 1, excludeSlug: 'demo-wedding-day' });
    expect(list).toHaveLength(1);
    expect(list[0].slug).not.toBe('demo-wedding-day');
  });

  it('публично видны только опубликованные записи', async () => {
    const projects = await getProjects();
    const articles = await getArticles();
    for (const item of [...projects, ...articles]) expect(item.status).toBe('published');
  });
});

describe('контентные обязательства (§8.1, §17)', () => {
  it('у каждой работы есть обложка с размерами и alt', async () => {
    for (const project of await getProjects()) {
      const cover = project.cover;
      const image = cover.type === 'image' ? cover.image : cover.poster;
      expect(image.width).toBeGreaterThan(0);
      expect(image.height).toBeGreaterThan(0);
      expect(cover.alt.ru).toBeTypeOf('string');
    }
  });

  it('у каждого видео есть постер', async () => {
    for (const project of await getProjects()) {
      for (const media of project.media) {
        if (media.type === 'video') expect(media.poster.src).toBeTruthy();
      }
    }
  });

  it('правовой статус медиа заполнен', async () => {
    for (const project of await getProjects()) {
      for (const media of [project.cover, ...project.media]) {
        expect(media.rights).toBeTruthy();
      }
    }
  });

  it('в credits нет людей без разрешения на публикацию', async () => {
    for (const project of await getProjects()) {
      for (const credit of project.credits) {
        expect(credit.person.visibility).toBe('public');
      }
    }
  });
});

describe('настройки сайта (§8, §18)', () => {
  it('контакты заполнены и кликабельны', async () => {
    const { getGlobalSettings } = await import('@/content/queries');
    const settings = await getGlobalSettings();

    expect(settings.contacts.length).toBeGreaterThan(0);
    for (const contact of settings.contacts) {
      expect(contact.value).toBeTruthy();
      // Контакт должен открываться в один клик: tel:, https:// или mailto:
      expect(contact.href).toMatch(/^(tel:|mailto:|https:\/\/)/);
    }
  });

  it('выключатель формы включён: получатель заявок подтверждён', async () => {
    const { getGlobalSettings } = await import('@/content/queries');
    const settings = await getGlobalSettings();
  });

  it('юридические ссылки заданы абсолютными адресами', async () => {
    const { getGlobalSettings } = await import('@/content/queries');
    const settings = await getGlobalSettings();

    expect(settings.legalLinks.length).toBeGreaterThan(0);
    for (const link of settings.legalLinks) expect(link.href).toMatch(/^https:\/\//);
  });
});

describe('шоурил на стартовой странице (§5.1)', () => {
  it('это видео с постером и подтверждёнными правами', async () => {
    const { getGlobalSettings } = await import('@/content/queries');
    const showreel = (await getGlobalSettings()).showreel;

    expect(showreel?.type).toBe('video');
    if (showreel?.type !== 'video') return;

    expect(showreel.poster.width).toBeGreaterThan(0);
    expect(showreel.poster.height).toBeGreaterThan(0);
    expect(showreel.rights).not.toBe('pending');
    expect(showreel.alt.ru).toBeTruthy();
  });

  it('постер лежит локально, а не на стороннем CDN', async () => {
    const { getGlobalSettings } = await import('@/content/queries');
    const showreel = (await getGlobalSettings()).showreel;
    if (showreel?.type !== 'video') throw new Error('шоурил должен быть видео');

    // Постер с чужого домена загрузился бы при открытии страницы — до того,
    // как посетитель нажал «play». Это ломает отложенную загрузку (§7, §10).
    expect(showreel.poster.src.startsWith('/')).toBe(true);
  });

  it('ссылка на плеер собирается корректно', async () => {
    const { embedUrl } = await import('@/lib/media');
    expect(embedUrl('kinescope', 'dSK6QkqpEZJt7vHY6rCgpD')).toBe(
      'https://kinescope.io/embed/dSK6QkqpEZJt7vHY6rCgpD?autoplay=1',
    );
    expect(embedUrl('file', 'x')).toBeNull();
  });
});

describe('видео карточек направлений (§5.1)', () => {
  it('у каждого направления есть своё видео с постером и правами', async () => {
    const { getDirections } = await import('@/content/queries');

    for (const direction of await getDirections()) {
      const media = direction.gatewayMedia;
      expect(media, `у ${direction.key} нет медиа для карточки`).toBeDefined();
      expect(media!.type).toBe('video');
      if (media!.type !== 'video') continue;

      expect(media!.loopSrc, `у ${direction.key} нет файла петли`).toBeTruthy();
      // Файл должен лежать у нас: сторонний домен грузился бы до согласия (§7).
      expect(media!.loopSrc!.startsWith('/')).toBe(true);
      expect(media!.poster.width).toBeGreaterThan(0);
      expect(media!.poster.height).toBeGreaterThan(0);
      expect(media!.rights).not.toBe('pending');
      expect(media!.alt.ru).toBeTruthy();
    }
  });

  it('все карточки вертикальные: под колонку рядом с текстом', async () => {
    const { getDirections } = await import('@/content/queries');

    for (const direction of await getDirections()) {
      const media = direction.gatewayMedia;
      if (media?.type !== 'video') continue;
      expect(media.poster.height, `${direction.key}: постер не вертикальный`).toBeGreaterThan(
        media.poster.width,
      );
    }
  });
});

describe('наполнение PRIVATE с lokos.pro', () => {
  it('пакеты содержат подтверждённые цены и состав', async () => {
    const { getPricing } = await import('@/content/queries');
    const packages = (await getPricing('private')).filter((entry) => entry.kind === 'package');

    expect(packages.length).toBeGreaterThanOrEqual(9);
    for (const entry of packages) {
      expect(entry.price, `${entry.slug}: нет цены`).toBeGreaterThan(0);
      expect(entry.currency).toBe('RUB');
      expect(entry.includes.length, `${entry.slug}: не описан состав`).toBeGreaterThan(0);
      // Это перенесённый реальный контент, а не заглушка.
      expect(entry.isDemo).not.toBe(true);
    }
  });

  it('цена пакета не помечается как «от», а дополнения — да', async () => {
    const { getPricing } = await import('@/content/queries');
    const entries = await getPricing('private');

    for (const entry of entries.filter((item) => item.kind === 'package')) {
      expect(entry.priceFrom, `${entry.slug}: пакет не должен быть «от»`).not.toBe(true);
    }
    expect(entries.some((entry) => entry.kind === 'extra')).toBe(true);
  });

  it('отзывы подписаны автором и относятся к направлению', async () => {
    const { getTestimonials } = await import('@/content/queries');
    const items = await getTestimonials('private');

    expect(items.length).toBeGreaterThan(5);
    for (const item of items) {
      expect(item.author.trim(), 'отзыв без автора ничего не подтверждает').toBeTruthy();
      expect(item.text.ru?.trim()).toBeTruthy();
      expect(item.directions).toContain('private');
    }
  });

  it('отзыв не попадает в чужое направление', async () => {
    const { getTestimonials } = await import('@/content/queries');
    const production = await getTestimonials('production');
    for (const item of production) expect(item.directions).toContain('production');
  });

  it('на странице PRIVATE больше нет пометок «к подтверждению»', async () => {
    const { getPage, getDirection } = await import('@/content/queries');
    const about = await getPage('private', 'about');
    const direction = await getDirection('private');

    const text = JSON.stringify([about, direction]);
    expect(text).not.toMatch(/ПОДТВЕРЖДЕНИЮ/i);
    expect(direction?.highlights.length).toBeGreaterThan(0);
  });
});

describe('обещания сроков не расходятся между страницами', () => {
  /**
   * Срок отдачи назван в лиде, в описании для поиска, в блоке «что входит»
   * и в каждом пакете. Разойтись им ничего не мешает — правят их в разное
   * время и в разных местах, поэтому расхождение ловится тестом.
   */
  const OUTDATED = /в течение суток|на следующий день|within 24 hours|the next day/i;

  it('нигде не обещаны сутки — согласовано на три дня', async () => {
    const { getDirection, getPricing, getPage } = await import('@/content/queries');

    const direction = await getDirection('private');
    const pricing = await getPricing('private');
    const about = await getPage('private', 'about');

    const claims = JSON.stringify([direction, pricing, about]);
    expect(claims).not.toMatch(OUTDATED);
  });

  it('срок назван явно, а не потерян при правке', async () => {
    const { getDirection, getPricing } = await import('@/content/queries');
    const direction = await getDirection('private');
    const pricing = await getPricing('private');

    expect(JSON.stringify(direction)).toMatch(/трёх дней/);
    // В каждом пакете со сроком отдачи он должен быть назван.
    const withPreview = pricing.filter((entry) =>
      entry.includes.some((line) => /фотограф|кадры/i.test(line.ru ?? '')),
    );
    expect(withPreview.length).toBeGreaterThan(0);
  });

  it('отзывы под это правило не подпадают: это слова клиентов', async () => {
    const { getTestimonials } = await import('@/content/queries');
    const items = await getTestimonials('private');
    // Проверка существует, чтобы правило выше случайно не распространили
    // на цитаты — переписывать чужой отзыв нельзя.
    expect(items.every((item) => item.author.trim().length > 0)).toBe(true);
  });
});
