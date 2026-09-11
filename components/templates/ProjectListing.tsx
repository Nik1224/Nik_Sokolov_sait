/**
 * Листинг работ: Cases (BUSINESS), Work (PRODUCTION), Portfolio (PRIVATE).
 *
 * Один шаблон на три ветки (ТЗ §15.2: не дублировать три почти одинаковых
 * приложения). Сетка не зависит от количества записей (§8).
 */

import Link from 'next/link';
import { ProjectCard } from '@/components/content/cards';
import { FilterNav } from '@/components/content/FilterNav';
import { EmptyState } from '@/components/content/Section';
import { Breadcrumbs } from '@/components/global/misc';
import { AlbumGrid } from '@/components/content/AlbumGrid';
import { PortfolioGallery, type PortfolioSections } from '@/components/content/PortfolioGallery';
import { MediaGallery } from '@/components/media/MediaGallery';
import { Picture } from '@/components/media/Picture';
import type { Album, Category, ImageRef, MediaAsset, Project } from '@/content/types';
import type { Dictionary } from '@/lib/i18n/dictionaries';
import { localizedString } from '@/lib/i18n/localize';
import { href } from '@/lib/routing';
import type { Direction, Locale } from '@/lib/site';

/** Ключ пункта «смотреть все»: у него нет slug, а линии нужен адрес пункта. */
const ALL = 'all';

type Props = {
  locale: Locale;
  direction: Direction;
  section: 'cases' | 'work' | 'portfolio';
  dict: Dictionary;
  title: string;
  lead?: string;
  projects: Project[];
  categories: Category[];
  activeCategory?: string;
  /**
   * Портфолио выбранных категорий. Когда кадры есть, страница становится
   * галереей: человек пришёл смотреть работы, а не читать карточки проектов.
   */
  gallery?: PortfolioSections;
  /** Альбомы этой категории: карточка ведёт прямо в онлайн-галерею. */
  categoryAlbums?: Album[];
  /**
   * Бэкстейдж выбранной категории. Идёт в самом низу: человек пришёл смотреть
   * кадры, и процесс — то, чем он интересуется уже после результата.
   */
  backstage?: MediaAsset[];
  /**
   * Заметный переход в соседний раздел. Стоит сразу под лидом: человек,
   * пришедший за полной съёмкой, не должен сначала пролистать сотню кадров.
   *
   * С обложкой это приглашение, без неё — строка. Кадр берётся из того же
   * раздела, куда блок ведёт: обещание видно до перехода.
   */
  promo?: {
    label: string;
    title: string;
    body: string;
    action: string;
    href: string;
    cover?: ImageRef;
  };
  /**
   * Куда вести из пустого раздела. У BUSINESS портфолио наполняется позже
   * кейсов, и «здесь пока пусто» без продолжения врёт: работа по этой
   * категории есть, просто разобрана текстом в соседнем разделе.
   */
  emptyAction?: { label: string; href: string };
  /**
   * «Смотреть все» имеет смысл, только когда наполнена не одна категория.
   * Иначе это второе имя для той же самой подборки.
   */
  showAll?: boolean;
};

export function ProjectListing({
  locale,
  direction,
  section,
  dict,
  title,
  lead,
  projects,
  categories,
  activeCategory,
  gallery,
  categoryAlbums = [],
  backstage = [],
  promo,
  emptyAction,
  showAll = true,
}: Props) {
  const listingHref = href({ locale, direction, section });

  return (
    <div className="container-content py-16 lg:py-24">
      <Breadcrumbs
        dict={dict}
        items={[
          { label: dict.common.home, href: href({ locale, direction }) },
          { label: dict.nav[section] },
        ]}
      />

      <h1 className="text-h1 m-0 max-w-3xl text-balance">{title}</h1>
      {lead ? <p className="mt-6 max-w-2xl text-lead text-bone-dim">{lead}</p> : null}

      {promo ? (
        /*
         * Приглашение, а не уведомление. Раньше это был прямоугольник с
         * рамкой — с виду системное сообщение, — и звал он при этом в самое
         * ценное, что есть в ветке: целую съёмку от начала до конца.
         */
        <Link
          href={promo.href}
          className="group mt-12 grid overflow-hidden md:grid-cols-[minmax(0,0.85fr)_minmax(0,1fr)]"
        >
          {promo.cover ? (
            <span className="relative block min-h-[12rem] overflow-hidden bg-ink-raised">
              <Picture
                image={promo.cover}
                alt=""
                sizes="(min-width: 768px) 26rem, 100vw"
                className="absolute inset-0 h-full w-full object-cover transition-transform duration-[var(--duration-slow)] ease-[var(--ease-out-soft)] group-hover:scale-[1.04]"
              />
            </span>
          ) : null}

          <span className="flex flex-col justify-center py-7 md:pl-9 lg:py-9 lg:pl-12">
            <span className="label block text-eyebrow">{promo.label}</span>
            <span className="text-h3 mt-3 block max-w-md text-balance text-bone transition-colors group-hover:text-accent">
              {promo.title}
            </span>
            <span className="mt-3 block max-w-md text-bone-dim">{promo.body}</span>
            <span className="label mt-6 text-accent transition-transform group-hover:translate-x-1">
              {promo.action} →
            </span>
          </span>
        </Link>
      ) : null}

      {categories.length > 0 ? (
        <FilterNav
          className="mt-12"
          label={dict.common.filterBy}
          active={activeCategory ?? (showAll ? ALL : undefined)}
          items={[
            ...(showAll ? [{ key: ALL, label: dict.common.viewAll, href: listingHref }] : []),
            ...categories.map((category) => ({
              key: category.slug,
              label: localizedString(category.title, locale),
              // Фильтр живёт в query: slug проекта остаётся уникальным адресом.
              href: `${listingHref}?category=${category.slug}`,
            })),
          ]}
        />
      ) : null}

      {/* Признак для тестов: «кадры галереи» — это то, что внутри, а не любой
          figure на странице; ниже есть ещё бэкстейдж. */}
      <div data-gallery className="mt-12">
        {categoryAlbums.length > 0 ? (
          <div className={gallery ? 'mb-16' : ''}>
            <AlbumGrid albums={categoryAlbums} locale={locale} dict={dict} />
          </div>
        ) : null}

        {gallery ? (
          <PortfolioGallery sections={gallery} locale={locale} dict={dict} />
        ) : categoryAlbums.length > 0 ? null : projects.length === 0 ? (
          <EmptyState
            title={dict.states.emptyTitle}
            body={emptyAction ? dict.states.emptyCasesBody : dict.states.emptyBody}
            action={emptyAction}
          />
        ) : (
          <ul data-reveal-stagger className="m-0 grid list-none gap-10 p-0 sm:grid-cols-2 lg:grid-cols-3 lg:gap-x-8 lg:gap-y-16">
            {projects.map((project, index) => (
              <li key={project._id}>
                <ProjectCard
                  project={project}
                  locale={locale}
                  direction={direction}
                  dict={dict}
                  categories={categories}
                  section={section}
                  priority={index < 3}
                />
              </li>
            ))}
          </ul>
        )}
      </div>

      {backstage.length > 0 ? (
        <section className="mt-20 border-t border-line pt-6">
          <h2 className="text-h2 m-0 text-balance">{dict.card.backstageTitle}</h2>
          <p className="mt-4 max-w-2xl text-bone-dim">{dict.card.backstageBody}</p>
          <div className="mt-10">
            <MediaGallery items={backstage} locale={locale} dict={dict} layout="masonry" />
          </div>
        </section>
      ) : null}
    </div>
  );
}
