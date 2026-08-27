/**
 * Страница проекта / кейса (ТЗ §5.5, §14.4).
 *
 * Порядок блоков: hero → задача → решение → результат → медиа → credits →
 * backstage ↔ проект → похожие работы. Один шаблон обслуживает BUSINESS Cases,
 * PRODUCTION Work и PRIVATE Portfolio.
 */

import Link from 'next/link';
import { PortableBody } from '@/components/content/PortableBody';
import { ProjectCard } from '@/components/content/cards';
import { RelatedArticleLinks } from '@/components/content/RelatedContent';
import { Section } from '@/components/content/Section';
import { Breadcrumbs, FallbackNotice, UnconfirmedTag } from '@/components/global/misc';
import { MediaGallery } from '@/components/media/MediaGallery';
import { Picture } from '@/components/media/Picture';
import type { Article, Category, Project, Service, WorkFormat } from '@/content/types';
import type { Dictionary } from '@/lib/i18n/dictionaries';
import { localizedString, pageNeedsFallbackNotice, resolveLocalized } from '@/lib/i18n/localize';
import { href } from '@/lib/routing';
import type { Direction, Locale } from '@/lib/site';

type Props = {
  locale: Locale;
  direction: Direction;
  section: 'cases' | 'work' | 'portfolio';
  dict: Dictionary;
  project: Project;
  categories: Category[];
  formats: WorkFormat[];
  services: Service[];
  articles: Article[];
  related: Project[];
};

function Fact({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="border-t border-line pt-4">
      <dt className="label text-bone-faint">{label}</dt>
      <dd className="m-0 mt-2 text-bone">{children}</dd>
    </div>
  );
}

export function ProjectDetail({
  locale,
  direction,
  section,
  dict,
  project,
  categories,
  formats,
  services,
  articles,
  related,
}: Props) {
  const title = localizedString(project.title, locale);
  const cover = project.cover;
  const coverImage = cover.type === 'image' ? cover.image : cover.poster;

  const challenge = resolveLocalized(project.challenge, locale);
  const solution = resolveLocalized(project.solution, locale);
  const result = resolveLocalized(project.result, locale);
  const role = localizedString(project.role, locale);
  const lead = localizedString(project.lead, locale);

  const showFallbackNotice = pageNeedsFallbackNotice(
    [project.title, project.lead, project.challenge, project.solution],
    locale,
  );

  // Роль ещё не подтверждена владельцем — помечаем, а не выдумываем (§15.1).
  const roleUnconfirmed = role.toUpperCase().includes('ПОДТВЕРЖДЕНИЮ') || role.toUpperCase().includes('CONFIRMED');

  return (
    <article>
      <div className="container-content pt-16 lg:pt-20">
        <Breadcrumbs
          dict={dict}
          items={[
            { label: dict.common.home, href: href({ locale, direction }) },
            { label: dict.nav[section], href: href({ locale, direction, section }) },
            { label: title },
          ]}
        />

        {showFallbackNotice ? (
          <div className="mb-8 max-w-2xl">
            <FallbackNotice dict={dict} />
          </div>
        ) : null}

        <h1 className="text-h1 m-0 max-w-4xl text-balance">{title}</h1>
        {lead ? <p className="mt-6 max-w-2xl text-lead text-bone-dim">{lead}</p> : null}

        <dl className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <Fact label={dict.common.year}>{project.year}</Fact>
          {project.client ? <Fact label={dict.common.client}>{project.client}</Fact> : null}
          {role ? (
            <Fact label={dict.common.role}>
              {roleUnconfirmed ? <UnconfirmedTag dict={dict} /> : role}
            </Fact>
          ) : null}
          {formats.length > 0 ? (
            <Fact label={dict.common.formats}>
              {formats.map((format) => localizedString(format.title, locale)).join(' · ')}
            </Fact>
          ) : null}
        </dl>
      </div>

      <div className="container-content mt-12 lg:mt-16">
        <Picture
          image={coverImage}
          alt={localizedString(cover.alt, locale)}
          sizes="(min-width: 1024px) 78rem, 100vw"
          priority
          className="w-full"
        />
      </div>

      {challenge.value || solution.value || result.value ? (
        <Section>
          <div className="grid gap-12 lg:grid-cols-3 lg:gap-10">
            {challenge.value ? (
              <div>
                <h2 className="label m-0 text-accent">{dict.common.challenge}</h2>
                <PortableBody value={challenge.value} locale={locale} dict={dict} />
              </div>
            ) : null}
            {solution.value ? (
              <div>
                <h2 className="label m-0 text-accent">{dict.common.solution}</h2>
                <PortableBody value={solution.value} locale={locale} dict={dict} />
              </div>
            ) : null}
            {result.value ? (
              <div>
                <h2 className="label m-0 text-accent">{dict.common.result}</h2>
                <PortableBody value={result.value} locale={locale} dict={dict} />
              </div>
            ) : null}
          </div>
        </Section>
      ) : null}

      {project.media.length > 0 ? (
        <Section>
          <MediaGallery items={project.media} locale={locale} dict={dict} />
        </Section>
      ) : null}

      {project.credits.length > 0 || services.length > 0 || articles.length > 0 ? (
        <Section>
          <div className="grid gap-12 lg:grid-cols-2">
            <div className="space-y-12">
              {project.credits.length > 0 ? (
                <div className="border-t border-line pt-6">
                  <p className="label mb-6 text-accent">{dict.common.credits}</p>
                  <ul className="m-0 list-none space-y-3 p-0">
                    {project.credits.map((entry) => (
                      <li key={entry.person._id} className="flex flex-wrap justify-between gap-4">
                        <span className="text-bone">{entry.person.displayName}</span>
                        <span className="label text-bone-faint">
                          {localizedString(entry.role ?? entry.person.role, locale)}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}

              {services.length > 0 ? (
                <div className="border-t border-line pt-6">
                  <p className="label mb-6 text-accent">{dict.common.relatedServices}</p>
                  <ul className="m-0 list-none space-y-3 p-0">
                    {services.map((service) => (
                      <li key={service._id}>
                        <Link
                          href={href({ locale, direction, section: 'services', slug: service.slug })}
                          className="text-bone underline decoration-line-strong underline-offset-4 transition-colors hover:decoration-accent"
                        >
                          {localizedString(service.title, locale)}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}
            </div>

            {/* Обратная сторона связи project ↔ article (§5.7, §17). */}
            <RelatedArticleLinks
              articles={articles}
              locale={locale}
              direction={direction}
              title={dict.common.backstageNotes}
            />
          </div>
        </Section>
      ) : null}

      {related.length > 0 ? (
        <Section title={dict.common.relatedProjects}>
          <ul className="m-0 grid list-none gap-10 p-0 sm:grid-cols-2 lg:grid-cols-3">
            {related.map((item) => (
              <li key={item._id}>
                <ProjectCard
                  project={item}
                  locale={locale}
                  direction={direction}
                  dict={dict}
                  categories={categories}
                  section={section}
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
