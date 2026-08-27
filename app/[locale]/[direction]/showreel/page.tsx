/** Showreel PRODUCTION (ТЗ §5.6): главный элемент ветки. */

import type { Metadata } from 'next';
import { Section } from '@/components/content/Section';
import { EmptyState } from '@/components/content/Section';
import { Breadcrumbs, JsonLd } from '@/components/global/misc';
import { VideoFacade } from '@/components/media/VideoFacade';
import { getDirection, getProjects } from '@/content/queries';
import type { MediaAsset } from '@/content/types';
import { getDictionary } from '@/lib/i18n/dictionaries';
import { localizedString } from '@/lib/i18n/localize';
import { resolveDirectionRoute, tryResolveDirectionRoute, sectionStaticParams } from '@/lib/guard';
import { href } from '@/lib/routing';
import { imageSrc, isoDuration } from '@/lib/media';
import { buildMetadata, videoJsonLd } from '@/lib/seo';

type Props = { params: Promise<{ locale: string; direction: string }> };

export function generateStaticParams() {
  return sectionStaticParams('showreel');
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const route = await tryResolveDirectionRoute(params, 'showreel');
  if (!route) return {};
  const { locale, direction } = route;
  const dict = getDictionary(locale);
  const doc = await getDirection(direction);

  return buildMetadata({
    locale,
    path: href({ locale, direction, section: 'showreel' }),
    title: `${dict.nav.showreel} — ${dict.directions[direction]}`,
    description: localizedString(doc?.lead, locale),
  });
}

export default async function Page({ params }: Props) {
  const { locale, direction } = await resolveDirectionRoute(params, 'showreel');
  const dict = getDictionary(locale);

  const [doc, projects] = await Promise.all([getDirection(direction), getProjects({ direction })]);

  // Шоурил собирается из видео опубликованных работ: отдельной коллекции нет,
  // поэтому новое видео появляется здесь автоматически (§8).
  const videos = projects.flatMap((project) =>
    project.media
      .filter((media): media is Extract<MediaAsset, { type: 'video' }> => media.type === 'video')
      .map((media) => ({ media, projectTitle: localizedString(project.title, locale), year: project.year })),
  );

  return (
    <div className="container-content py-16 lg:py-24">
      <Breadcrumbs
        dict={dict}
        items={[{ label: dict.common.home, href: href({ locale, direction }) }, { label: dict.nav.showreel }]}
      />

      <h1 className="text-h1 m-0 max-w-3xl text-balance">{dict.nav.showreel}</h1>
      <p className="mt-6 max-w-2xl text-lead text-bone-dim">{localizedString(doc?.lead, locale)}</p>

      {videos.length === 0 ? (
        <div className="mt-14">
          <EmptyState title={dict.states.emptyTitle} body={dict.states.emptyBody} />
        </div>
      ) : (
        <>
          <div className="mt-12">
            <JsonLd
              data={videoJsonLd({
                name: videos[0].projectTitle,
                description: localizedString(videos[0].media.alt, locale),
                thumbnailUrl: imageSrc(videos[0].media.poster, 1200),
                duration: isoDuration(videos[0].media.durationSeconds),
              })}
            />
            <VideoFacade
              media={videos[0].media}
              locale={locale}
              dict={dict}
              sizes="(min-width: 1024px) 78rem, 100vw"
              priority
            />
          </div>

          {videos.length > 1 ? (
            <Section title={dict.nav.work} className="px-0">
              <ul className="m-0 grid list-none gap-10 p-0 md:grid-cols-2">
                {videos.slice(1).map((entry) => (
                  <li key={entry.media._key}>
                    <VideoFacade
                      media={entry.media}
                      locale={locale}
                      dict={dict}
                      sizes="(min-width: 768px) 39rem, 100vw"
                    />
                    <p className="label mt-3 text-bone-faint">
                      {entry.projectTitle} · {entry.year}
                    </p>
                  </li>
                ))}
              </ul>
            </Section>
          ) : null}
        </>
      )}
    </div>
  );
}
