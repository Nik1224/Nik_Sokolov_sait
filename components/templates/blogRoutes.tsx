/**
 * Общие обработчики журнала (ТЗ §5.7, §6).
 *
 * Блог есть в каждой ветке, но коллекция одна. Запись, отмеченная двумя
 * направлениями, доступна по двум контекстным адресам; canonical указывает на
 * адрес основного направления, чтобы дубли не конкурировали в выдаче.
 */

import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { ArticleDetail, ArticleListing } from '@/components/templates/ArticleTemplates';
import { JsonLd } from '@/components/global/misc';
import {
  getArticle,
  getArticleTypes,
  getArticleTypesInDirection,
  getArticles,
  getDirection,
  getProjects,
  getProjectsForArticle,
} from '@/content/queries';
import { getDictionary } from '@/lib/i18n/dictionaries';
import { localizedString } from '@/lib/i18n/localize';
import { resolveDirectionRoute, tryResolveDirectionRoute } from '@/lib/guard';
import { absoluteUrl, href } from '@/lib/routing';
import { articleJsonLd, breadcrumbJsonLd, buildMetadata, seoText } from '@/lib/seo';
import { LOCALES, siteUrl, type Direction } from '@/lib/site';
import type { WorkSection } from './projectRoutes';

type RouteParams = Promise<{ locale: string; direction: string }>;
type SlugParams = Promise<{ locale: string; direction: string; slug: string }>;
type Query = Promise<Record<string, string | string[] | undefined>>;

function projectSectionFor(direction: Direction): WorkSection {
  if (direction === 'business') return 'cases';
  if (direction === 'production') return 'work';
  return 'portfolio';
}

export async function blogListingMetadata(params: RouteParams): Promise<Metadata> {
  const route = await tryResolveDirectionRoute(params, 'blog');
  if (!route) return {};
  const { locale, direction } = route;
  const dict = getDictionary(locale);
  const doc = await getDirection(direction);

  return buildMetadata({
    locale,
    path: href({ locale, direction, section: 'blog' }),
    title: `${dict.nav.blog} — ${dict.directions[direction]}`,
    description: localizedString(doc?.lead, locale),
  });
}

export async function BlogListingRoute({
  params,
  searchParams,
}: {
  params: RouteParams;
  searchParams: Query;
}) {
  const { locale, direction } = await resolveDirectionRoute(params, 'blog');
  const dict = getDictionary(locale);

  const query = await searchParams;
  const rawType = typeof query.type === 'string' ? query.type : undefined;

  const [doc, types] = await Promise.all([
    getDirection(direction),
    getArticleTypesInDirection(direction),
  ]);

  const activeType = types.some((type) => type.slug === rawType) ? rawType : undefined;
  const articles = await getArticles({ direction, typeSlug: activeType });

  // Названия связанных проектов для подписи «финальный кейс» на карточке.
  const projects = await getProjects({ direction });
  const projectTitles = Object.fromEntries(
    projects.map((project) => [project.slug, localizedString(project.title, locale)]),
  );

  return (
    <ArticleListing
      locale={locale}
      direction={direction}
      dict={dict}
      title={dict.nav.blog}
      lead={localizedString(doc?.lead, locale)}
      articles={articles}
      types={types}
      activeType={activeType}
      projectTitles={projectTitles}
    />
  );
}

export async function blogStaticParams(direction: Direction) {
  const articles = await getArticles({ direction });
  return LOCALES.flatMap((locale) =>
    articles.map((article) => ({ locale, direction, slug: article.slug })),
  );
}

export async function blogDetailMetadata(params: SlugParams): Promise<Metadata> {
  const { locale: rawLocale, direction: rawDirection, slug } = await params;
  const route = await tryResolveDirectionRoute(
    Promise.resolve({ locale: rawLocale, direction: rawDirection }),
    'blog',
  );
  if (!route) return {};
  const { locale, direction } = route;

  const article = await getArticle(slug);
  if (!article || !article.directions.includes(direction)) return {};

  const title = localizedString(article.title, locale);
  const seo = seoText(article.seo, locale, title, localizedString(article.excerpt, locale));
  const cover = article.cover;

  return buildMetadata({
    locale,
    path: href({ locale, direction, section: 'blog', slug }),
    // Канонический адрес — в основном направлении записи (§6).
    canonicalPath: href({ locale, direction: article.primaryDirection, section: 'blog', slug }),
    title: seo.title,
    description: seo.description,
    image: cover.type === 'image' ? cover.image : cover.poster,
    noIndex: seo.noIndex,
    type: 'article',
    publishedTime: article.publishedAt,
  });
}

export async function BlogDetailRoute({ params }: { params: SlugParams }) {
  const { locale: rawLocale, direction: rawDirection, slug } = await params;
  const { locale, direction } = await resolveDirectionRoute(
    Promise.resolve({ locale: rawLocale, direction: rawDirection }),
    'blog',
  );
  const dict = getDictionary(locale);

  const article = await getArticle(slug);
  if (!article || !article.directions.includes(direction)) notFound();

  const [types, projects, more] = await Promise.all([
    getArticleTypes(),
    getProjectsForArticle(article),
    getArticles({ direction, limit: 3, excludeSlug: article.slug }),
  ]);

  const type = types.find((item) => item.slug === article.typeSlug);
  const origin = siteUrl();
  const path = href({ locale, direction, section: 'blog', slug });

  return (
    <>
      <JsonLd
        data={[
          articleJsonLd({
            headline: localizedString(article.title, locale),
            description: localizedString(article.excerpt, locale),
            url: absoluteUrl(path, origin),
            datePublished: article.publishedAt,
            author: article.author ?? 'Nikita Sokolov',
          }),
          breadcrumbJsonLd([
            { name: dict.common.home, url: absoluteUrl(href({ locale, direction }), origin) },
            {
              name: dict.nav.blog,
              url: absoluteUrl(href({ locale, direction, section: 'blog' }), origin),
            },
            { name: localizedString(article.title, locale), url: absoluteUrl(path, origin) },
          ]),
        ]}
      />
      <ArticleDetail
        locale={locale}
        direction={direction}
        dict={dict}
        article={article}
        typeLabel={type ? localizedString(type.title, locale) : undefined}
        projects={projects}
        projectSection={projectSectionFor(direction)}
        more={more}
        types={types}
      />
    </>
  );
}
