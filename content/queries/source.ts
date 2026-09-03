/**
 * Источник контента (ТЗ §15.2: presentation, data access и content schemas
 * разделены). Страницы и компоненты НИКОГДА не обращаются к Sanity напрямую —
 * только к content/queries.
 *
 * Источник отдаёт коллекции целиком, а фильтрация и связи живут одним слоем
 * выше. Так логика связей не дублируется между Sanity и фикстурами. Для
 * портфолио-сайта объём коллекций это позволяет; при росте фильтры опускаются
 * в GROQ без изменения вызывающего кода.
 */

import { cache } from 'react';
import type {
  Album,
  Article,
  ArticleType,
  Category,
  DirectionDoc,
  GlobalSettings,
  Page,
  PricingEntry,
  Project,
  Redirect,
  Testimonial,
  WorkFormat,
} from '../types';

export type ContentSource = {
  readonly name: 'sanity' | 'fixtures';
  globalSettings(): Promise<GlobalSettings>;
  directions(): Promise<DirectionDoc[]>;
  categories(): Promise<Category[]>;
  albums(): Promise<Album[]>;
  articleTypes(): Promise<ArticleType[]>;
  workFormats(): Promise<WorkFormat[]>;
  projects(): Promise<Project[]>;
  articles(): Promise<Article[]>;
  pricing(): Promise<PricingEntry[]>;
  testimonials(): Promise<Testimonial[]>;
  pages(): Promise<Page[]>;
  redirects(): Promise<Redirect[]>;
};

/** Sanity подключён, только когда задан projectId. Иначе работают фикстуры. */
export function isSanityConfigured(): boolean {
  return Boolean(process.env.NEXT_PUBLIC_SANITY_PROJECT_ID);
}

/**
 * Выбор источника — единственное место переключения. `cache()` гарантирует,
 * что за один запрос каждая коллекция читается один раз.
 */
export const getSource = cache(async (): Promise<ContentSource> => {
  if (isSanityConfigured()) {
    const { sanitySource } = await import('./sanity-source');
    return sanitySource;
  }
  const { fixtureSource } = await import('./fixture-source');
  return fixtureSource;
});
