/**
 * Визитка: страница, которую организатор пересылает паре.
 *
 * Живёт рядом с ветками, а не внутри, и поэтому приходит без шапки и подвала —
 * их добавляет только макет ветки. Это осознанно: человек открывает ссылку из
 * переписки, ничего про сайт не зная, и меню из шести разделов уводит его
 * листать вместо того, чтобы прочитать одну страницу до конца.
 *
 * Из поиска закрыта. Это не потеря: страница дублирует то, что уже сказано на
 * сайте, и без навигации проигрывает ему по всем признакам, зато конкурировала
 * бы с ним за те же запросы.
 */

import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { AlbumGrid } from '@/components/content/AlbumGrid';
import { PortfolioGallery } from '@/components/content/PortfolioGallery';
import { MediaGallery } from '@/components/media/MediaGallery';
import { Picture } from '@/components/media/Picture';
import { getAlbums, getCategories, getDirection } from '@/content/queries';
import type { ImageRef } from '@/content/types';
import { getDictionary } from '@/lib/i18n/dictionaries';
import { localizedString } from '@/lib/i18n/localize';
import { cardHref } from '@/lib/routing';
import { buildMetadata } from '@/lib/seo';
import { LOCALES, type Locale } from '@/lib/site';

type Props = { params: Promise<{ locale: string }> };

export function generateStaticParams() {
  return LOCALES.map((locale) => ({ locale }));
}

const PORTRAIT: ImageRef = {
  src: "/media/about/nikita-1800.jpg",
  width: 1800,
  height: 2700,
  sources: [600, 1200, 1800].map((width) => ({
    width,
    src: `/media/about/nikita-${width}.jpg`,
  })),
};

function resolveLocale(raw: string): Locale | null {
  return (LOCALES as readonly string[]).includes(raw) ? (raw as Locale) : null;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const locale = resolveLocale((await params).locale);
  if (!locale) return {};
  const dict = getDictionary(locale);

  return buildMetadata({
    locale,
    path: cardHref(locale),
    title: dict.card.metaTitle,
    description: dict.card.lead,
    // Портрет уходит в превью ссылки: её вставляют в переписку, и первым
    // человек видит именно карточку, а не страницу.
    image: PORTRAIT,
    noIndex: true,
  });
}

export default async function Page({ params }: Props) {
  const locale = resolveLocale((await params).locale);
  if (!locale) notFound();

  const dict = getDictionary(locale);
  const t = dict.card;
  const [doc, categories, albums] = await Promise.all([
    getDirection('private'),
    getCategories('private'),
    getAlbums('private'),
  ]);

  /*
   * Только свадьбы. Страницу пересылает организатор паре, которая выбирает
   * свадебного фотографа: портрет и семейная съёмка здесь не помогают, а
   * размывают ответ на единственный вопрос, ради которого её открыли.
   *
   * Кадры, ролики и рилсы разложены по вкладкам ровно так же, как в портфолио:
   * человек приходит либо смотреть фотографии, либо смотреть видео.
   */
  const wedding = categories.find((category) => category.slug === "wedding");
  const sections = {
    photos: wedding?.gallery ?? [],
    videos: wedding?.videos ?? [],
    reels: wedding?.reels ?? [],
  };
  const backstage = wedding?.backstage ?? [];
  const hasMedia =
    sections.photos.length + sections.videos.length + sections.reels.length > 0;

  return (
    /*
     * Тему задаёт макет ветки, а сюда он не достаёт: без этого страница
     * открывалась бы в тёмной теме, хотя PRIVATE — светлая. Пара, которой
     * прислали ссылку, должна увидеть тот же сайт, что и по любой другой.
     */
    <div data-theme="private" className="min-h-dvh bg-ink text-bone">
      <main className="container-content py-14 lg:py-20">
        {/* Имя вместо шапки: человек должен понимать, чью страницу открыл. */}
        <p className="label text-bone-faint">{dict.brand.name}</p>

        <section className="mt-10 grid gap-10 lg:grid-cols-[minmax(0,20rem)_minmax(0,1fr)] lg:items-start lg:gap-16">
          <Picture
            image={PORTRAIT}
            alt={t.portraitAlt}
            sizes="(min-width: 1024px) 20rem, 70vw"
            priority
            className="w-full max-w-sm"
          />
          <div>
            <h1 className="text-h1 m-0 text-balance">{t.title}</h1>
            <p className="mt-6 max-w-2xl text-lead text-bone-dim">{t.lead}</p>
            <div className="mt-8 space-y-4 text-bone-dim">
              {t.about.map((line) => (
                <p key={line}>{line}</p>
              ))}
            </div>
          </div>
        </section>

        {doc && doc.highlights.length > 0 ? (
          <section className="mt-20">
            <h2 className="text-h2 m-0 border-t border-line pt-6 text-balance">
              {t.includedTitle}
            </h2>
            <ul className="m-0 mt-10 grid list-none gap-px bg-line p-0 sm:grid-cols-2 lg:grid-cols-3">
              {doc.highlights.map((item, index) => (
                <li key={index} className="bg-ink p-6 lg:p-8">
                  <h3 className="text-h3 m-0 text-bone">
                    {localizedString(item.title, locale)}
                  </h3>
                  {item.body ? (
                    <p className="mt-3 text-bone-dim">
                      {localizedString(item.body, locale)}
                    </p>
                  ) : null}
                </li>
              ))}
            </ul>
          </section>
        ) : null}

        {hasMedia ? (
          <section className="mt-20">
            <h2 className="text-h2 m-0 border-t border-line pt-6 text-balance">
              {t.framesTitle}
            </h2>
            <p className="mt-4 max-w-2xl text-bone-dim">{t.framesBody}</p>
            <div className="mt-10">
              <PortfolioGallery
                sections={sections}
                locale={locale}
                dict={dict}
              />
            </div>
          </section>
        ) : null}

        {/*
          Бэкстейдж. В портфолио — результат, здесь — процесс: пара выбирает не
          только кадры, но и человека, с которым проведёт весь день.
        */}
        {backstage.length > 0 ? (
          <section className="mt-20">
            <h2 className="text-h2 m-0 border-t border-line pt-6 text-balance">
              {t.backstageTitle}
            </h2>
            <p className="mt-4 max-w-2xl text-bone-dim">{t.backstageBody}</p>
            <div className="mt-10">
              <MediaGallery items={backstage} locale={locale} dict={dict} layout="masonry" />
            </div>
          </section>
        ) : null}

        {/*
          Полные серии. Отдельные кадры показывают уровень, целая свадьба —
          ровность: как снято утро, как справился с тёмным залом, не развалился
          ли цвет к вечеру. Пара, выбирающая фотографа, спрашивает именно это.
        */}
        {albums.length > 0 ? (
          <section className="mt-20">
            <h2 className="text-h2 m-0 border-t border-line pt-6 text-balance">
              {t.albumsTitle}
            </h2>
            <p className="mt-4 max-w-2xl text-bone-dim">{t.albumsBody}</p>
            <div className="mt-10">
              <AlbumGrid albums={albums} locale={locale} dict={dict} />
            </div>
          </section>
        ) : null}

        <section className="mt-20 max-w-2xl border-t border-line pt-6">
          <h2 className="text-h2 m-0 text-balance">{t.contactTitle}</h2>
          <p className="mt-6 text-bone-dim">{t.contactBody}</p>
        </section>
      </main>
    </div>
  );
}
