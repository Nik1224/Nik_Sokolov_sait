/**
 * Публичный API контента. Страницы и компоненты используют только эти функции.
 *
 * Здесь же живут все связи между сущностями (ТЗ §5.5, §5.7, §15.1):
 * project ↔ article, project ↔ service, related projects. Связь хранится
 * с одной стороны (`article.projectSlugs`), обратная строится запросом —
 * редактор заполняет её один раз и рассинхрона не бывает.
 */

import { cache } from 'react';
import type { Direction } from '@/lib/site';
import type {
  Article,
  ArticleType,
  Category,
  ContentStatus,
  DirectionDoc,
  GlobalSettings,
  Page,
  PricingEntry,
  Project,
  Redirect,
  Service,
  Testimonial,
  WorkFormat,
} from '../types';
import { getSource } from './source';

export { isSanityConfigured } from './source';

/** Публично видно только опубликованное (§8.1). */
function published<T extends { status: ContentStatus }>(items: T[]): T[] {
  return items.filter((item) => item.status === 'published');
}

function byOrder<T extends { order?: number }>(items: T[]): T[] {
  return [...items].sort((a, b) => (a.order ?? 9999) - (b.order ?? 9999));
}

/* --- Настройки и направления -------------------------------------------- */

export const getGlobalSettings = cache(async (): Promise<GlobalSettings> => {
  return (await getSource()).globalSettings();
});

export const getDirections = cache(async (): Promise<DirectionDoc[]> => {
  const items = await (await getSource()).directions();
  return byOrder(items);
});

export const getDirection = cache(async (key: Direction): Promise<DirectionDoc | null> => {
  const items = await getDirections();
  return items.find((item) => item.key === key) ?? null;
});

/* --- Справочники --------------------------------------------------------- */

export const getCategories = cache(async (direction?: Direction): Promise<Category[]> => {
  const items = byOrder(await (await getSource()).categories());
  return direction ? items.filter((item) => item.directions.includes(direction)) : items;
});

export const getCategory = cache(async (slug: string): Promise<Category | null> => {
  return (await getCategories()).find((item) => item.slug === slug) ?? null;
});

export const getArticleTypes = cache(async (): Promise<ArticleType[]> => {
  return byOrder(await (await getSource()).articleTypes());
});

export const getWorkFormats = cache(async (): Promise<WorkFormat[]> => {
  return byOrder(await (await getSource()).workFormats());
});

/** Разворачивает slug'и форматов в записи справочника, сохраняя его порядок. */
export async function resolveFormats(slugs: string[]): Promise<WorkFormat[]> {
  const all = await getWorkFormats();
  return all.filter((format) => slugs.includes(format.slug));
}

/* --- Услуги -------------------------------------------------------------- */

export const getServices = cache(async (): Promise<Service[]> => {
  return byOrder(published(await (await getSource()).services()));
});

export const getService = cache(async (slug: string): Promise<Service | null> => {
  return (await getServices()).find((item) => item.slug === slug) ?? null;
});

/* --- Проекты ------------------------------------------------------------- */

type ProjectFilter = {
  direction?: Direction;
  categorySlug?: string;
  serviceSlug?: string;
  featuredOnly?: boolean;
  limit?: number;
  excludeSlug?: string;
};

export const getProjects = cache(async (filter: ProjectFilter = {}): Promise<Project[]> => {
  let items = published(await (await getSource()).projects());

  if (filter.direction) items = items.filter((p) => p.directions.includes(filter.direction!));
  if (filter.categorySlug) items = items.filter((p) => p.categorySlugs.includes(filter.categorySlug!));
  if (filter.serviceSlug) items = items.filter((p) => p.serviceSlugs.includes(filter.serviceSlug!));
  if (filter.featuredOnly) items = items.filter((p) => p.featured);
  if (filter.excludeSlug) items = items.filter((p) => p.slug !== filter.excludeSlug);

  items = byOrder(items).sort((a, b) => {
    const orderDelta = (a.order ?? 9999) - (b.order ?? 9999);
    return orderDelta !== 0 ? orderDelta : b.year - a.year;
  });

  return filter.limit ? items.slice(0, filter.limit) : items;
});

export const getProject = cache(async (slug: string): Promise<Project | null> => {
  const items = published(await (await getSource()).projects());
  return items.find((item) => item.slug === slug) ?? null;
});

/**
 * Похожие проекты: та же ветка, пересечение по категории или услуге,
 * текущий исключён (§7, RelatedContent — «исключает текущую запись и дубли»).
 */
export async function getRelatedProjects(
  project: Project,
  direction: Direction,
  limit = 3,
): Promise<Project[]> {
  const pool = await getProjects({ direction, excludeSlug: project.slug });

  const scored = pool.map((candidate) => {
    const sharedCategories = candidate.categorySlugs.filter((c) => project.categorySlugs.includes(c)).length;
    const sharedServices = candidate.serviceSlugs.filter((s) => project.serviceSlugs.includes(s)).length;
    return { candidate, score: sharedCategories * 2 + sharedServices };
  });

  return scored
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((entry) => entry.candidate);
}

/* --- Журнал -------------------------------------------------------------- */

type ArticleFilter = {
  direction?: Direction;
  typeSlug?: string;
  limit?: number;
  excludeSlug?: string;
};

export const getArticles = cache(async (filter: ArticleFilter = {}): Promise<Article[]> => {
  let items = published(await (await getSource()).articles());

  if (filter.direction) items = items.filter((a) => a.directions.includes(filter.direction!));
  if (filter.typeSlug) items = items.filter((a) => a.typeSlug === filter.typeSlug);
  if (filter.excludeSlug) items = items.filter((a) => a.slug !== filter.excludeSlug);

  items = [...items].sort((a, b) => b.publishedAt.localeCompare(a.publishedAt));
  return filter.limit ? items.slice(0, filter.limit) : items;
});

export const getArticle = cache(async (slug: string): Promise<Article | null> => {
  const items = published(await (await getSource()).articles());
  return items.find((item) => item.slug === slug) ?? null;
});

/** Типы записей, реально встречающиеся в ветке — пустые фильтры не показываем. */
export async function getArticleTypesInDirection(direction: Direction): Promise<ArticleType[]> {
  const [types, articles] = await Promise.all([getArticleTypes(), getArticles({ direction })]);
  const used = new Set(articles.map((a) => a.typeSlug));
  return types.filter((type) => used.has(type.slug));
}

/* --- Связи --------------------------------------------------------------- */

/** Обратная связь project → articles: на проекте показываются заметки (§5.7). */
export async function getArticlesForProject(
  projectSlug: string,
  direction?: Direction,
): Promise<Article[]> {
  const items = await getArticles(direction ? { direction } : {});
  return items.filter((article) => article.projectSlugs.includes(projectSlug));
}

/** Прямая связь article → projects: в заметке CTA на финальный кейс (§5.7). */
export async function getProjectsForArticle(article: Article): Promise<Project[]> {
  if (article.projectSlugs.length === 0) return [];
  const items = await getProjects();
  return items.filter((project) => article.projectSlugs.includes(project.slug));
}

export async function getServicesForProject(project: Project): Promise<Service[]> {
  if (project.serviceSlugs.length === 0) return [];
  const items = await getServices();
  return items.filter((service) => project.serviceSlugs.includes(service.slug));
}

/* --- Стоимость, страницы, редиректы -------------------------------------- */

export const getPricing = cache(async (direction: Direction): Promise<PricingEntry[]> => {
  const items = await (await getSource()).pricing();
  return byOrder(items.filter((item) => item.active && item.direction === direction));
});

export const getPricingEntry = cache(async (slug: string): Promise<PricingEntry | null> => {
  const items = await (await getSource()).pricing();
  return items.find((item) => item.slug === slug && item.active) ?? null;
});

/** Отзывы направления. Публикуются только подтверждённые (§5.2). */
export const getTestimonials = cache(
  async (direction: Direction, limit?: number): Promise<Testimonial[]> => {
    const items = await (await getSource()).testimonials();
    const filtered = byOrder(items.filter((item) => item.directions.includes(direction)));
    return limit ? filtered.slice(0, limit) : filtered;
  },
);

export const getPage = cache(
  async (direction: Direction, pageType: Page['pageType']): Promise<Page | null> => {
    const items = published(await (await getSource()).pages());
    return items.find((item) => item.direction === direction && item.pageType === pageType) ?? null;
  },
);

export const getRedirects = cache(async (): Promise<Redirect[]> => {
  return (await getSource()).redirects();
});

/** Есть ли в данных demo-записи — используется предупреждающей полосой. */
export async function hasDemoContent(): Promise<boolean> {
  const source = await getSource();
  const [projects, articles, services] = await Promise.all([
    source.projects(),
    source.articles(),
    source.services(),
  ]);
  return [...projects, ...articles, ...services].some((item) => item.isDemo);
}
