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
    expect(settings.featureFlags.contactFormEnabled).toBe(true);
  });

  it('юридические ссылки заданы абсолютными адресами', async () => {
    const { getGlobalSettings } = await import('@/content/queries');
    const settings = await getGlobalSettings();

    expect(settings.legalLinks.length).toBeGreaterThan(0);
    for (const link of settings.legalLinks) expect(link.href).toMatch(/^https:\/\//);
  });
});
