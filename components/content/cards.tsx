/**
 * Карточки контента (ТЗ §7).
 *
 * Все карточки строятся из данных и не зависят от количества записей —
 * добавление проекта или статьи не требует правки компонентов (§8, §17).
 */

import Link from 'next/link';
import type { Article, Category, Project } from '@/content/types';
import type { Dictionary } from '@/lib/i18n/dictionaries';
import { formatDate, hasTranslation, localizedString } from '@/lib/i18n/localize';
import { href } from '@/lib/routing';
import type { Direction, Locale } from '@/lib/site';
import { PictureFrame } from '../media/Picture';

/** Общая метка-подпись у карточек: тип, год, категория. */
function Meta({ items }: { items: (string | undefined)[] }) {
  const visible = items.filter(Boolean);
  if (visible.length === 0) return null;
  return (
    <p className="label m-0 flex flex-wrap items-center gap-x-3 gap-y-1 text-bone-faint">
      {visible.map((item, index) => (
        <span key={`${item}-${index}`} className="flex items-center gap-3">
          {index > 0 ? (
            <span aria-hidden="true" className="text-line-strong">
              ·
            </span>
          ) : null}
          {item}
        </span>
      ))}
    </p>
  );
}

/** Метка «только на русском» для карточки в английском листинге (§4.1). */
function RuOnlyTag({ dict }: { dict: Dictionary }) {
  return (
    <span lang="en" className="label border border-line px-2 py-0.5 text-bone-faint">
      {dict.fallback.short}
    </span>
  );
}

type ProjectCardProps = {
  project: Project;
  locale: Locale;
  direction: Direction;
  dict: Dictionary;
  categories: Category[];
  /** В какой раздел ведёт карточка: кейсы, работы или портфолио. */
  section: 'cases' | 'work' | 'portfolio';
  ratio?: number;
  sizes?: string;
  priority?: boolean;
};

export function ProjectCard({
  project,
  locale,
  direction,
  dict,
  categories,
  section,
  ratio = 3 / 2,
  sizes = '(min-width: 1024px) 26rem, (min-width: 640px) 50vw, 100vw',
  priority = false,
}: ProjectCardProps) {
  const title = localizedString(project.title, locale);
  const cover = project.cover;
  const categoryTitles = categories
    .filter((category) => project.categorySlugs.includes(category.slug))
    .map((category) => localizedString(category.title, locale));

  const image = cover.type === 'image' ? cover.image : cover.poster;
  const isFallback = !hasTranslation(project.title, locale);

  return (
    <article className="group">
      <Link href={href({ locale, direction, section, slug: project.slug })} className="block">
        <PictureFrame
          image={image}
          alt=""
          ratio={ratio}
          sizes={sizes}
          priority={priority}
          className="transition-transform duration-[var(--duration-slow)] ease-[var(--ease-out-soft)] group-hover:scale-[1.03]"
        />
        <div className="mt-5">
          <Meta items={[String(project.year), ...categoryTitles]} />
          <h3 className="text-h3 mt-2 text-balance text-bone transition-colors group-hover:text-accent">
            {title}
          </h3>
        </div>
      </Link>
      {isFallback ? (
        <p className="mt-2">
          <RuOnlyTag dict={dict} />
        </p>
      ) : null}
    </article>
  );
}

type ArticleCardProps = {
  article: Article;
  locale: Locale;
  direction: Direction;
  dict: Dictionary;
  typeLabel?: string;
  relatedProjectTitle?: string;
  showCover?: boolean;
};

export function ArticleCard({
  article,
  locale,
  direction,
  dict,
  typeLabel,
  relatedProjectTitle,
  showCover = true,
}: ArticleCardProps) {
  const cover = article.cover;
  const image = cover.type === 'image' ? cover.image : cover.poster;
  const isFallback = !hasTranslation(article.title, locale);

  return (
    <article className="group">
      <Link href={href({ locale, direction, section: 'blog', slug: article.slug })} className="block">
        {showCover ? (
          <PictureFrame
            image={image}
            alt=""
            ratio={16 / 9}
            sizes="(min-width: 1024px) 24rem, (min-width: 640px) 50vw, 100vw"
            className="transition-transform duration-[var(--duration-slow)] ease-[var(--ease-out-soft)] group-hover:scale-[1.03]"
          />
        ) : null}
        <div className={showCover ? 'mt-5' : ''}>
          <Meta items={[typeLabel, formatDate(article.publishedAt, locale)]} />
          <h3 className="text-h3 mt-2 text-balance text-bone transition-colors group-hover:text-accent">
            {localizedString(article.title, locale)}
          </h3>
          <p className="mt-3 text-bone-dim">{localizedString(article.excerpt, locale)}</p>
        </div>
      </Link>
      <p className="mt-3 flex flex-wrap items-center gap-3">
        {relatedProjectTitle ? (
          <span className="label text-bone-faint">
            {dict.common.finalCase}: {relatedProjectTitle}
          </span>
        ) : null}
        {isFallback ? <RuOnlyTag dict={dict} /> : null}
      </p>
    </article>
  );
}
