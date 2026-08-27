/**
 * START / Gateway (ТЗ §5.1, §14.1).
 *
 * Корневой URL — это выбор направления, а не контентная Home. Три направления
 * равнозначны, каждое ведёт на собственную Home (§3.1, §17).
 */

import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { DirectionCard } from '@/components/content/DirectionCard';
import { VideoFacade } from '@/components/media/VideoFacade';
import { Footer } from '@/components/global/Footer';
import { JsonLd } from '@/components/global/misc';
import { LocaleSwitcher } from '@/components/global/LocaleSwitcher';
import { getDirections, getGlobalSettings } from '@/content/queries';
import { getDictionary } from '@/lib/i18n/dictionaries';
import { localizedString } from '@/lib/i18n/localize';
import { buildMetadata, personJsonLd } from '@/lib/seo';
import { absoluteUrl, startHref } from '@/lib/routing';
import { isLocale, siteUrl } from '@/lib/site';

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale: raw } = await params;
  if (!isLocale(raw)) return {};
  const settings = await getGlobalSettings();

  return buildMetadata({
    locale: raw,
    path: startHref(raw),
    title: localizedString(settings.defaultSeo.title, raw, settings.siteName),
    description: localizedString(settings.defaultSeo.description, raw),
  });
}

export default async function StartPage({ params }: Props) {
  const { locale: raw } = await params;
  if (!isLocale(raw)) notFound();
  const locale = raw;

  const dict = getDictionary(locale);
  const [settings, directions] = await Promise.all([getGlobalSettings(), getDirections()]);
  const origin = siteUrl();

  return (
    <>
      <JsonLd
        data={personJsonLd(
          settings.siteName,
          localizedString(settings.defaultSeo.description, locale),
          absoluteUrl(startHref(locale), origin),
        )}
      />

      <div className="flex min-h-dvh flex-col">
        <header className="container-content flex items-center justify-between py-6">
          {/* На START логотип остаётся на месте: уходить отсюда некуда (§4). */}
          <p className="label m-0 text-bone">{settings.siteName}</p>
          <LocaleSwitcher locale={locale} dict={dict} />
        </header>

        <main id="main" className="container-content flex min-h-[calc(100dvh-9rem)] flex-1 flex-col justify-center py-8 lg:py-12">
          <p className="label text-accent">{localizedString(settings.descriptor, locale)}</p>
          <h1 className="text-h1 mt-5 max-w-3xl text-balance">
            {locale === 'ru'
              ? 'Три разных способа работать вместе. Выберите свой.'
              : 'Three different ways of working together. Choose yours.'}
          </h1>

          <div className="mt-10 flex flex-col gap-4 lg:mt-14 lg:flex-row lg:gap-6">
            {directions.map((direction, index) => (
              <DirectionCard
                key={direction._id}
                index={index + 1}
                direction={direction.key}
                label={dict.directions[direction.key]}
                description={localizedString(direction.gatewayDescription, locale)}
                media={direction.gatewayMedia}
                locale={locale}
              />
            ))}
          </div>
        </main>

        {settings.showreel?.type === 'video' ? (
          <section aria-labelledby="showreel-heading" className="container-content pb-[var(--spacing-section)] pt-8">
            <div className="mb-8 flex flex-col gap-4 border-t border-line pt-6 md:flex-row md:items-end md:justify-between">
              <h2 id="showreel-heading" className="text-h2 m-0">
                {dict.nav.showreel}
              </h2>
              <p className="label m-0 text-bone-faint">
                {localizedString(settings.descriptor, locale)}
              </p>
            </div>
            <VideoFacade
              media={settings.showreel}
              locale={locale}
              dict={dict}
              sizes="(min-width: 1024px) 78rem, 100vw"
            />
          </section>
        ) : null}

        <Footer locale={locale} settings={settings} dict={dict} showStartLink={false} />
      </div>
    </>
  );
}
