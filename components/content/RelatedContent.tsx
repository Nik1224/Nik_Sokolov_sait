/**
 * Двусторонняя связь проектов и заметок (ТЗ §5.5, §5.7, §7).
 *
 * На проекте показываются связанные заметки, в заметке — CTA на финальный
 * кейс. Текущая запись из подборки исключается на уровне запросов.
 */

import Link from 'next/link';
import type { Article, Project } from '@/content/types';
import { formatDate, localizedString } from '@/lib/i18n/localize';
import { href } from '@/lib/routing';
import type { Direction, Locale } from '@/lib/site';
import { PictureFrame } from '../media/Picture';

type ArticleLinksProps = {
  articles: Article[];
  locale: Locale;
  direction: Direction;
  title: string;
};

/** Список заметок на странице проекта — компактный, без обложек. */
export function RelatedArticleLinks({ articles, locale, direction, title }: ArticleLinksProps) {
  if (articles.length === 0) return null;

  return (
    <div className="border-t border-line pt-6">
      <p className="label mb-6 text-accent">{title}</p>
      <ul className="m-0 list-none space-y-px p-0">
        {articles.map((article) => (
          <li key={article._id}>
            <Link
              href={href({ locale, direction, section: 'blog', slug: article.slug })}
              className="group flex flex-wrap items-baseline justify-between gap-4 border-b border-line py-5"
            >
              <span className="text-h3 text-bone transition-colors group-hover:text-accent">
                {localizedString(article.title, locale)}
              </span>
              <span className="label text-bone-faint">{formatDate(article.publishedAt, locale)}</span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

type ProjectLinksProps = {
  projects: Project[];
  locale: Locale;
  direction: Direction;
  section: 'cases' | 'work' | 'portfolio';
  title: string;
};

/** Крупная карточка-ссылка на финальный кейс из статьи. */
export function RelatedProjectCallout({ projects, locale, direction, section, title }: ProjectLinksProps) {
  if (projects.length === 0) return null;

  return (
    <div className="border-t border-line pt-6">
      <p className="label mb-6 text-accent">{title}</p>
      <ul className="m-0 grid list-none gap-8 p-0 sm:grid-cols-2">
        {projects.map((project) => {
          const cover = project.cover;
          const image = cover.type === 'image' ? cover.image : cover.poster;
          return (
            <li key={project._id}>
              <Link
                href={href({ locale, direction, section, slug: project.slug })}
                className="group block"
              >
                <PictureFrame
                  image={image}
                  alt=""
                  ratio={16 / 9}
                  sizes="(min-width: 640px) 20rem, 100vw"
                  className="transition-transform duration-[var(--duration-slow)] ease-[var(--ease-out-soft)] group-hover:scale-[1.03]"
                />
                <p className="text-h3 mt-4 text-bone transition-colors group-hover:text-accent">
                  {localizedString(project.title, locale)}
                </p>
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
