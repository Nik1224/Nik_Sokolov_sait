/**
 * Листинг работ: Cases (BUSINESS), Work (PRODUCTION), Portfolio (PRIVATE).
 *
 * Один шаблон на три ветки (ТЗ §15.2: не дублировать три почти одинаковых
 * приложения). Сетка не зависит от количества записей (§8).
 */

import Link from 'next/link';
import { ProjectCard } from '@/components/content/cards';
import { EmptyState } from '@/components/content/Section';
import { Breadcrumbs } from '@/components/global/misc';
import { AlbumGrid } from '@/components/content/AlbumGrid';
import { PortfolioGallery, type PortfolioSections } from '@/components/content/PortfolioGallery';
import type { Album, Category, Project } from '@/content/types';
import type { Dictionary } from '@/lib/i18n/dictionaries';
import { localizedString } from '@/lib/i18n/localize';
import { href } from '@/lib/routing';
import type { Direction, Locale } from '@/lib/site';

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
   * Заметный переход в соседний раздел. Стоит сразу под лидом: человек,
   * пришедший за полной съёмкой, не должен сначала пролистать сотню кадров.
   */
  promo?: { label: string; title: string; body: string; action: string; href: string };
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
  promo,
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
        <Link
          href={promo.href}
          className="group mt-12 flex flex-col gap-6 border border-line p-7 transition-colors hover:border-line-strong hover:bg-ink-raised md:flex-row md:items-end md:justify-between md:gap-10 lg:p-9"
        >
          <span className="max-w-xl">
            <span className="label block text-accent">{promo.label}</span>
            <span className="text-h3 mt-3 block text-bone transition-colors group-hover:text-accent">
              {promo.title}
            </span>
            <span className="mt-3 block text-bone-dim">{promo.body}</span>
          </span>
          <span className="label shrink-0 text-bone transition-colors group-hover:text-accent">
            {promo.action} →
          </span>
        </Link>
      ) : null}

      {categories.length > 0 ? (
        <nav aria-label={dict.common.filterBy} className="mt-10 border-y border-line py-4">
          <ul className="m-0 flex list-none flex-wrap gap-x-6 gap-y-3 p-0">
            {showAll ? (
              <li>
                <Link
                  href={listingHref}
                  aria-current={!activeCategory ? 'true' : undefined}
                  className={`label transition-colors ${
                    !activeCategory ? 'text-accent' : 'text-bone-faint hover:text-bone'
                  }`}
                >
                  {dict.common.viewAll}
                </Link>
              </li>
            ) : null}
            {categories.map((category) => {
              const isActive = category.slug === activeCategory;
              return (
                <li key={category._id}>
                  <Link
                    // Фильтр живёт в query: slug проекта остаётся уникальным адресом.
                    href={`${listingHref}?category=${category.slug}`}
                    aria-current={isActive ? 'true' : undefined}
                    className={`label transition-colors ${
                      isActive ? 'text-accent' : 'text-bone-faint hover:text-bone'
                    }`}
                  >
                    {localizedString(category.title, locale)}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      ) : null}

      <div className="mt-12">
        {categoryAlbums.length > 0 ? (
          <div className={gallery ? 'mb-16' : ''}>
            <AlbumGrid albums={categoryAlbums} locale={locale} dict={dict} />
          </div>
        ) : null}

        {gallery ? (
          <PortfolioGallery sections={gallery} locale={locale} dict={dict} />
        ) : categoryAlbums.length > 0 ? null : projects.length === 0 ? (
          <EmptyState title={dict.states.emptyTitle} body={dict.states.emptyBody} />
        ) : (
          <ul className="m-0 grid list-none gap-10 p-0 sm:grid-cols-2 lg:grid-cols-3 lg:gap-x-8 lg:gap-y-16">
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
    </div>
  );
}
