/**
 * Журнал (ТЗ §5.7, §14.5).
 *
 * В интерфейсе блог есть в каждой ветке, но коллекция одна: запись с двумя
 * направлениями появляется в двух листингах и доступна по двум контекстным
 * адресам. Канонический — адрес основного направления (§6).
 */

import Link from 'next/link';
import { ArticleCard } from '@/components/content/cards';
import { PortableBody } from '@/components/content/PortableBody';
import { RelatedProjectCallout } from '@/components/content/RelatedContent';
import { EmptyState, Section } from '@/components/content/Section';
import { Breadcrumbs, FallbackNotice } from '@/components/global/misc';
import { Picture } from '@/components/media/Picture';
import type { Article, ArticleType, Project } from '@/content/types';
import type { Dictionary } from '@/lib/i18n/dictionaries';
import { formatDate, localizedString, pageNeedsFallbackNotice, resolveLocalized } from '@/lib/i18n/localize';
import { href } from '@/lib/routing';
import type { Direction, Locale } from '@/lib/site';

type ListingProps = {
  locale: Locale;
  direction: Direction;
  dict: Dictionary;
  title: string;
  lead?: string;
  articles: Article[];
  types: ArticleType[];
  activeType?: string;
  projectTitles: Record<string, string>;
};

export function ArticleListing({
  locale,
  direction,
  dict,
  title,
  lead,
  articles,
  types,
  activeType,
  projectTitles,
}: ListingProps) {
  const listingHref = href({ locale, direction, section: 'blog' });

  return (
    <div className="container-content py-16 lg:py-24">
      <Breadcrumbs
        dict={dict}
        items={[{ label: dict.common.home, href: href({ locale, direction }) }, { label: dict.nav.blog }]}
      />

      <h1 className="text-h1 m-0 max-w-3xl text-balance">{title}</h1>
      {lead ? <p className="mt-6 max-w-2xl text-lead text-bone-dim">{lead}</p> : null}

      {types.length > 0 ? (
        <nav aria-label={dict.common.filterBy} className="mt-10 border-y border-line py-4">
          <ul className="m-0 flex list-none flex-wrap gap-x-6 gap-y-3 p-0">
            <li>
              <Link
                href={listingHref}
                aria-current={!activeType ? 'true' : undefined}
                className={`label transition-colors ${
                  !activeType ? 'text-accent' : 'text-bone-faint hover:text-bone'
                }`}
              >
                {dict.common.viewAll}
              </Link>
            </li>
            {types.map((type) => {
              const isActive = type.slug === activeType;
              return (
                <li key={type._id}>
                  <Link
                    href={`${listingHref}?type=${type.slug}`}
                    aria-current={isActive ? 'true' : undefined}
                    className={`label transition-colors ${
                      isActive ? 'text-accent' : 'text-bone-faint hover:text-bone'
                    }`}
                  >
                    {localizedString(type.title, locale)}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      ) : null}

      <div className="mt-12">
        {articles.length === 0 ? (
          <EmptyState title={dict.states.emptyTitle} body={dict.states.emptyBody} />
        ) : (
          <ul className="m-0 grid list-none gap-12 p-0 md:grid-cols-2 lg:grid-cols-3 lg:gap-x-8 lg:gap-y-16">
            {articles.map((article) => (
              <li key={article._id}>
                <ArticleCard
                  article={article}
                  locale={locale}
                  direction={direction}
                  dict={dict}
                  typeLabel={
                    types.find((type) => type.slug === article.typeSlug)
                      ? localizedString(types.find((type) => type.slug === article.typeSlug)!.title, locale)
                      : undefined
                  }
                  relatedProjectTitle={projectTitles[article.projectSlugs[0] ?? '']}
                />
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

type DetailProps = {
  locale: Locale;
  direction: Direction;
  dict: Dictionary;
  article: Article;
  typeLabel?: string;
  projects: Project[];
  /** Раздел, в котором лежат связанные проекты этой ветки. */
  projectSection: 'cases' | 'work' | 'portfolio';
  more: Article[];
  types: ArticleType[];
};

export function ArticleDetail({
  locale,
  direction,
  dict,
  article,
  typeLabel,
  projects,
  projectSection,
  more,
  types,
}: DetailProps) {
  const title = localizedString(article.title, locale);
  const body = resolveLocalized(article.body, locale);
  const cover = article.cover;
  const coverImage = cover.type === 'image' ? cover.image : cover.poster;

  const showFallbackNotice = pageNeedsFallbackNotice([article.title, article.body, article.excerpt], locale);

  return (
    <article>
      <div className="container-prose pt-16 lg:pt-20">
        <Breadcrumbs
          dict={dict}
          items={[
            { label: dict.common.home, href: href({ locale, direction }) },
            { label: dict.nav.blog, href: href({ locale, direction, section: 'blog' }) },
            { label: title },
          ]}
        />

        {showFallbackNotice ? (
          <div className="mb-8">
            <FallbackNotice dict={dict} />
          </div>
        ) : null}

        <p className="label flex flex-wrap items-center gap-3 text-bone-faint">
          {typeLabel ? <span className="text-accent">{typeLabel}</span> : null}
          <time dateTime={article.publishedAt}>{formatDate(article.publishedAt, locale)}</time>
        </p>

        <h1 className="text-h1 mt-5 text-balance">{title}</h1>
        <p className="mt-6 text-lead text-bone-dim">{localizedString(article.excerpt, locale)}</p>
      </div>

      <div className="container-content mt-12">
        <Picture
          image={coverImage}
          alt={localizedString(cover.alt, locale)}
          sizes="(min-width: 1024px) 78rem, 100vw"
          priority
          className="w-full"
        />
      </div>

      {body.value ? (
        <div className="container-prose mt-12">
          <PortableBody value={body.value} locale={locale} dict={dict} />
        </div>
      ) : null}

      {projects.length > 0 ? (
        <Section>
          {/* Прямая сторона связи article → project: CTA на финальный кейс (§5.7). */}
          <RelatedProjectCallout
            projects={projects}
            locale={locale}
            direction={direction}
            section={projectSection}
            title={dict.common.finalCase}
          />
        </Section>
      ) : null}

      {more.length > 0 ? (
        <Section
          title={dict.common.moreFromDirection}
          action={{ label: dict.common.viewAll, href: href({ locale, direction, section: 'blog' }) }}
        >
          <ul className="m-0 grid list-none gap-12 p-0 md:grid-cols-3">
            {more.map((item) => (
              <li key={item._id}>
                <ArticleCard
                  article={item}
                  locale={locale}
                  direction={direction}
                  dict={dict}
                  typeLabel={
                    types.find((type) => type.slug === item.typeSlug)
                      ? localizedString(types.find((type) => type.slug === item.typeSlug)!.title, locale)
                      : undefined
                  }
                />
              </li>
            ))}
          </ul>
        </Section>
      ) : null}

      <Section>
        <Link
          href={href({ locale, direction, section: 'contact' })}
          className="label inline-block bg-bone px-7 py-4 text-ink transition-colors hover:bg-accent"
        >
          {dict.form.heading}
        </Link>
      </Section>
    </article>
  );
}
