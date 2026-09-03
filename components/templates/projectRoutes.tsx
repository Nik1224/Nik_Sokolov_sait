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
  resolveFormats,
} from '@/content/queries';
import { getDictionary } from '@/lib/i18n/dictionaries';
import { localizedString } from '@/lib/i18n/localize';
import { resolveDirectionRoute, tryResolveDirectionRoute } from '@/lib/guard';
import { href } from '@/lib/routing';
import { buildMetadata, seoText } from '@/lib/seo';
import { DIRECTIONS, LOCALES, isSectionAvailable, type Direction, type Section } from '@/lib/site';

export type WorkSection = 'cases' | 'work' | 'portfolio';

/**
 * Где у ветки живут страницы отдельных работ.
 *
 * BUSINESS с этого момента показывает и портфолио, и кейсы: портфолио — кадры
 * и ролики по категориям, кейсы — разбор задачи текстом. Страница работы при
 * этом одна: без этой таблицы один и тот же кейс открывался бы по двум
 * адресам — /business/cases/… и /business/portfolio/… — и конкурировал бы сам
 * с собой в поиске.
 */
const DETAIL_SECTION: Record<Direction, WorkSection> = {
  private: 'portfolio',
  business: 'cases',
  production: 'work',
};

/**
 * Что показывает список: кадры категорий или карточки работ.
 *
 * Решает раздел, а не наполнение. Раньше это выводилось из данных — «есть ли
 * у категорий медиа» — и при таком правиле портфолио и кейсы BUSINESS
 * показывали бы одно и то же.
 */
function showsGallery(section: WorkSection): boolean {
  return section === 'portfolio';
}

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
  const gallery = showsGallery(section);
  const projects = gallery ? [] : await getProjects({ direction, categorySlug: activeCategory });

  // Без фильтра показываем портфолио всех категорий ветки подряд.
  const shownCategories = categories.filter(
    (item) => !activeCategory || item.slug === activeCategory,
  );
  /*
   * Альбомы категории. У love story отдельных кадров нет: человек нажимает на
   * альбом и уходит в галерею целиком, а не листает выборку.
   */
  const categoryAlbums = activeCategory ? await getAlbums(direction, activeCategory) : [];

  /*
   * Бэкстейдж показываем только при выбранной категории: без фильтра страница
   * и так собирает кадры всех категорий подряд, и добавлять туда ещё и процесс
   * значит превратить её в свалку.
   */
  const backstage = activeCategory
    ? (categories.find((item) => item.slug === activeCategory)?.backstage ?? [])
    : [];

  const sections = {
    photos: shownCategories.flatMap((item) => item.gallery ?? []),
    videos: shownCategories.flatMap((item) => item.videos ?? []),
    reels: shownCategories.flatMap((item) => item.reels ?? []),
  };
  const hasMedia = sections.photos.length + sections.videos.length + sections.reels.length > 0;

  /*
   * «Смотреть все» есть у списка работ и нет у галереи. Список работ так и
   * листают — подряд; а вперемешку свадьбы, портреты и семейные кадры не
   * складываются ни во что: человек выбирает, что ему снимать, а не смотрит
   * ленту. Вернуться ко всем кадрам можно пунктом «Портфолио» в меню.
   *
   * У списка работ ссылка тоже появляется, только когда наполнена не одна
   * категория: иначе она ведёт ровно туда же, куда единственная категория.
   */
  const everything = gallery ? [] : await getProjects({ direction });
  const filledCategories = categories.filter((item) =>
    everything.some((project) => project.categorySlugs.includes(item.slug)),
  ).length;
  const showAll = !gallery && filledCategories > 1;

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
      projects={projects}
      categories={categories}
      activeCategory={activeCategory}
      gallery={gallery && hasMedia ? sections : undefined}
      categoryAlbums={categoryAlbums}
      backstage={backstage}
      showAll={showAll}
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

  if (DETAIL_SECTION[direction] !== section) return {};

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

  // Своя страница работы у ветки одна. У BUSINESS это кейсы: портфолио там
  // показывает кадры, а не карточки, и вести из него на страницу работы некуда.
  if (DETAIL_SECTION[direction] !== section) notFound();

  const project = await getProject(slug);
  // Работа, не относящаяся к этой ветке, по её адресу недоступна: иначе один
  // проект расползётся по чужим направлениям.
  if (!project || !project.directions.includes(direction)) notFound();

  const [categories, formats, articles, related] = await Promise.all([
    getCategories(direction),
    resolveFormats(project.formatSlugs),
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
      articles={articles}
      related={related}
    />
  );
}

export const ALL_DIRECTIONS = DIRECTIONS;
