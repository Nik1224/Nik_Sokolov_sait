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

  /*
   * Вертикальный кадр уходит на поля справа, горизонтальный ложится полосой
   * над текстом.
   *
   * Раньше портрет стоял в контейнере шириной 78rem, а текст — в колонке
   * 42rem по центру страницы: кадр не был выровнен с текстом ни по левому
   * краю, ни по центру и просто висел слева от него. Теперь оба живут в одной
   * сетке, и правый край кадра стоит на том же модуле, что и колонка текста.
   */
  const portrait = Boolean(heroImage && heroImage.height > heroImage.width);

  const heroPicture = heroImage ? (
    <Picture
      image={heroImage}
      alt={hero ? localizedString(hero.alt, locale) : ''}
      sizes={portrait ? '(min-width: 1024px) 17rem, 100vw' : '(min-width: 1024px) 78rem, 100vw'}
      priority
      className="w-full"
    />
  ) : null;

  return (
    <article className="container-content py-16 lg:py-24">
      <Breadcrumbs
        dict={dict}
        items={[{ label: dict.common.home, href: href({ locale, direction }) }, { label: dict.nav.about }]}
      />

      {!portrait && heroPicture ? <div className="mb-12">{heroPicture}</div> : null}

      {/*
        Порядок в разметке — тот, в котором текст читается на узком экране:
        заголовок, кадр, рассказ. На широком кадр встаёт во вторую колонку и
        занимает оба ряда, поэтому в потоке он между ними и не мешает.
      */}
      <div className="lg:grid lg:grid-cols-[minmax(0,42rem)_minmax(0,1fr)] lg:gap-14">
        <div className="lg:col-start-1 lg:row-start-1">
          {showFallbackNotice ? (
            <div className="mb-8">
              <FallbackNotice dict={dict} />
            </div>
          ) : null}

          <h1 className="text-h1 m-0 text-balance">{localizedString(page.title, locale)}</h1>
          <p className="mt-6 text-lead text-bone-dim">{localizedString(page.lead, locale)}</p>
        </div>

        {portrait && heroPicture ? (
          <div className="mt-10 max-w-xs lg:col-start-2 lg:row-span-2 lg:row-start-1 lg:mt-2 lg:ml-auto lg:w-[17rem] lg:self-start">
            {heroPicture}
          </div>
        ) : null}

        {body.value ? (
          <div className="mt-12 lg:col-start-1 lg:row-start-2">
            <PortableBody value={body.value} locale={locale} dict={dict} className="lede" />
          </div>
        ) : null}
      </div>
    </article>
  );
}
