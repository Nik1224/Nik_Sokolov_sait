/**
 * О себе (ТЗ §5.8).
 *
 * Вступление адаптировано под ветку, но факты общие и только подтверждённые.
 */

import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { PortableBody } from '@/components/content/PortableBody';
import { Breadcrumbs, FallbackNotice } from '@/components/global/misc';
import { Picture } from '@/components/media/Picture';
import { getPage } from '@/content/queries';
import { getDictionary } from '@/lib/i18n/dictionaries';
import { localizedString, pageNeedsFallbackNotice, resolveLocalized } from '@/lib/i18n/localize';
import { resolveDirectionRoute, tryResolveDirectionRoute, sectionStaticParams } from '@/lib/guard';
import { href } from '@/lib/routing';
import { buildMetadata, seoText } from '@/lib/seo';

type Props = { params: Promise<{ locale: string; direction: string }> };

export function generateStaticParams() {
  return sectionStaticParams('about');
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const route = await tryResolveDirectionRoute(params, 'about');
  if (!route) return {};
  const { locale, direction } = route;
  const dict = getDictionary(locale);
  const page = await getPage(direction, 'about');

  const seo = seoText(
    page?.seo,
    locale,
    `${dict.nav.about} — ${dict.directions[direction]}`,
    localizedString(page?.lead, locale),
  );

  return buildMetadata({
    locale,
    path: href({ locale, direction, section: 'about' }),
    title: seo.title,
    description: seo.description,
    noIndex: seo.noIndex,
  });
}

export default async function Page({ params }: Props) {
  const { locale, direction } = await resolveDirectionRoute(params, 'about');
  const dict = getDictionary(locale);

  const page = await getPage(direction, 'about');
  if (!page) notFound();

  const body = resolveLocalized(page.body, locale);
  const hero = page.hero;
  const heroImage = hero ? (hero.type === 'image' ? hero.image : hero.poster) : null;
  const showFallbackNotice = pageNeedsFallbackNotice([page.title, page.lead, page.body], locale);

  return (
    <article className="py-16 lg:py-24">
      <div className="container-prose">
        <Breadcrumbs
          dict={dict}
          items={[{ label: dict.common.home, href: href({ locale, direction }) }, { label: dict.nav.about }]}
        />
        {showFallbackNotice ? (
          <div className="mb-8">
            <FallbackNotice dict={dict} />
          </div>
        ) : null}

        <h1 className="text-h1 m-0 text-balance">{localizedString(page.title, locale)}</h1>
        <p className="mt-6 text-lead text-bone-dim">{localizedString(page.lead, locale)}</p>
      </div>

      {heroImage ? (
        /*
         * Горизонтальный кадр идёт во всю ширину, вертикальный — колонкой.
         * Портрет во всю ширину контейнера вырастает почти на три тысячи
         * пикселей в высоту: читать после него нечего, всё уезжает за экран.
         */
        <div className="container-content mt-12">
          <Picture
            image={heroImage}
            alt={hero ? localizedString(hero.alt, locale) : ''}
            sizes={
              heroImage.height > heroImage.width
                ? '(min-width: 1024px) 28rem, 100vw'
                : '(min-width: 1024px) 78rem, 100vw'
            }
            priority
            className={heroImage.height > heroImage.width ? 'w-full max-w-md' : 'w-full'}
          />
        </div>
      ) : null}

      {body.value ? (
        <div className="container-prose mt-12">
          <PortableBody value={body.value} locale={locale} dict={dict} />
        </div>
      ) : null}
    </article>
  );
}
