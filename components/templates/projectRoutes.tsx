/**
 * Общие обработчики маршрутов работ (ТЗ §15.2).
 *
 * Cases (BUSINESS), Work (PRODUCTION) и Portfolio (PRIVATE) — это один и тот же
 * контентный тип в разных ветках, поэтому маршруты собираются из общих функций,
 * а файлы страниц остаются тонкими.
 */

import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { ProjectDetail } from '@/components/templates/ProjectDetail';
import { ProjectListing } from '@/components/templates/ProjectListing';
import {
  getAlbums,
  getArticlesForProject,
  getCategories,
  getDirection,
  getProject,
  getProjects,
  getRelatedProjects,
  getServicesForProject,
  resolveFormats,
} from '@/content/queries';
import { getDictionary } from '@/lib/i18n/dictionaries';
import { localizedString } from '@/lib/i18n/localize';
import { resolveDirectionRoute, tryResolveDirectionRoute } from '@/lib/guard';
import { href } from '@/lib/routing';
import { buildMetadata, seoText } from '@/lib/seo';
import { DIRECTIONS, LOCALES, isSectionAvailable, type Direction, type Section } from '@/lib/site';

export type WorkSection = 'cases' | 'work' | 'portfolio';

type RouteParams = Promise<{ locale: string; direction: string }>;
type SlugParams = Promise<{ locale: string; direction: string; slug: string }>;
type Query = Promise<Record<string, string | string[] | undefined>>;

/* --- Листинг -------------------------------------------------------------- */

export async function projectListingMetadata(
  params: RouteParams,
  section: WorkSection,
): Promise<Metadata> {
  const route = await tryResolveDirectionRoute(params, section as Section);
  if (!route) return {};
  const { locale, direction } = route;
  const dict = getDictionary(locale);
  const doc = await getDirection(direction);

  return buildMetadata({
    locale,
    path: href({ locale, direction, section: section as Section }),
    title: `${dict.nav[section]} — ${dict.directions[direction]}`,
    description: localizedString(doc?.lead, locale),
  });
}

export async function ProjectListingRoute({
  params,
  searchParams,
  section,
}: {
  params: RouteParams;
  searchParams: Query;
  section: WorkSection;
}) {
  const { locale, direction } = await resolveDirectionRoute(params, section as Section);
  const dict = getDictionary(locale);

  const query = await searchParams;
  const rawCategory = typeof query.category === 'string' ? query.category : undefined;

  const [doc, categories] = await Promise.all([getDirection(direction), getCategories(direction)]);

  // Неизвестная категория не должна показывать пустую страницу без объяснения:
  // фильтр просто игнорируется.
  const activeCategory = categories.some((item) => item.slug === rawCategory) ? rawCategory : undefined;
  const projects = await getProjects({ direction, categorySlug: activeCategory });

  // Без фильтра показываем портфолио всех категорий ветки подряд.
  const gallery = categories
    .filter((item) => !activeCategory || item.slug === activeCategory)
    .flatMap((item) => item.gallery ?? []);

  /*
   * Ветка, которая публикует галереи, говорит кадрами, а не карточками работ.
   * Показать рядом с настоящей съёмкой карточку-заготовку хуже, чем честно
   * сказать, что в этой категории пока пусто.
   */
  const publishesGalleries = categories.some((item) => (item.gallery?.length ?? 0) > 0);

  /*
   * «Смотреть все» показывается, только когда наполнена не одна категория.
   * Пока снята одна свадьба, эта ссылка ведёт ровно туда же, куда «Свадьбы», —
   * выбор без разницы.
   */
  const everything = await getProjects({ direction });
  const filled = categories.filter((item) =>
    publishesGalleries
      ? (item.gallery?.length ?? 0) > 0
      : everything.some((project) => project.categorySlugs.includes(item.slug)),
  );

  // Полные серии показываем только там, где они есть: пустой переход хуже,
  // чем его отсутствие.
  /*
   * Переход к альбомам показывается там, где полная выдача одной съёмки вообще
   * бывает: у портрета и семьи её не существует, и предлагать её бессмысленно.
   * Без фильтра — показываем, раз в ветке такие категории есть.
   */
  const fullSeriesHere = activeCategory
    ? (categories.find((item) => item.slug === activeCategory)?.fullSeries ?? false)
    : categories.some((item) => item.fullSeries);

  const albums =
    fullSeriesHere && isSectionAvailable(direction, 'albums') ? await getAlbums(direction) : [];

  return (
    <ProjectListing
      locale={locale}
      direction={direction}
      section={section}
      dict={dict}
      title={dict.nav[section]}
      lead={localizedString(doc?.lead, locale)}
      projects={publishesGalleries ? [] : projects}
      categories={categories}
      activeCategory={activeCategory}
      gallery={gallery}
      showAll={filled.length > 1}
      promo={
        albums.length > 0
          ? {
              label: dict.albums.promoLabel,
              title: dict.albums.promoTitle,
              body: dict.albums.promoBody,
              action: dict.albums.promoAction,
              href: href({ locale, direction, section: 'albums' }),
            }
          : undefined
      }
    />
  );
}

/* --- Страница работы ------------------------------------------------------ */

/** Статические пути для всех опубликованных работ ветки. */
export async function projectStaticParams(direction: Direction) {
  const projects = await getProjects({ direction });
  return LOCALES.flatMap((locale) =>
    projects.map((project) => ({ locale, direction, slug: project.slug })),
  );
}

export async function projectDetailMetadata(
  params: SlugParams,
  section: WorkSection,
): Promise<Metadata> {
  const { locale: rawLocale, direction: rawDirection, slug } = await params;
  const route = await tryResolveDirectionRoute(
    Promise.resolve({ locale: rawLocale, direction: rawDirection }),
    section as Section,
  );
  if (!route) return {};
  const { locale, direction } = route;

  const project = await getProject(slug);
  if (!project || !project.directions.includes(direction)) return {};

  const title = localizedString(project.title, locale);
  const seo = seoText(project.seo, locale, title, localizedString(project.lead, locale));
  const cover = project.cover;

  return buildMetadata({
    locale,
    path: href({ locale, direction, section: section as Section, slug }),
    title: seo.title,
    description: seo.description,
    image: cover.type === 'image' ? cover.image : cover.poster,
    noIndex: seo.noIndex,
    type: 'article',
  });
}

export async function ProjectDetailRoute({
  params,
  section,
}: {
  params: SlugParams;
  section: WorkSection;
}) {
  const { locale: rawLocale, direction: rawDirection, slug } = await params;
  const { locale, direction } = await resolveDirectionRoute(
    Promise.resolve({ locale: rawLocale, direction: rawDirection }),
    section as Section,
  );
  const dict = getDictionary(locale);

  const project = await getProject(slug);
  // Работа, не относящаяся к этой ветке, по её адресу недоступна: иначе один
  // проект расползётся по чужим направлениям.
  if (!project || !project.directions.includes(direction)) notFound();

  const [categories, formats, services, articles, related] = await Promise.all([
    getCategories(direction),
    resolveFormats(project.formatSlugs),
    getServicesForProject(project),
    getArticlesForProject(project.slug, direction),
    getRelatedProjects(project, direction),
  ]);

  return (
    <ProjectDetail
      locale={locale}
      direction={direction}
      section={section}
      dict={dict}
      project={project}
      categories={categories}
      formats={formats}
      services={services}
      articles={articles}
      related={related}
    />
  );
}

export const ALL_DIRECTIONS = DIRECTIONS;
