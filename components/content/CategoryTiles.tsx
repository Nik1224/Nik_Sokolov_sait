'use client';

/**
 * Плитки категорий портфолио на Home ветки PRIVATE (ТЗ §5.2, §7).
 *
 * Плитка — это кадр, а не строка. Постер стоит всегда, название лежит поверх
 * на вуали, а петля со съёмки — усиление сверху.
 *
 * Две подачи одного и того же:
 *  • где есть мышь — при наведении кадр медленно наезжает и подхватывается
 *    петля со съёмки этой категории;
 *  • на сенсорных экранах наведения не существует, поэтому петля играет сама,
 *    пока плитка на экране.
 *
 * Без петли плитка выглядит ровно так же: движение — не условие.
 */

import Link from 'next/link';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Picture } from '@/components/media/Picture';
import { useLoopMode, useLoopPreload, type LoopMode } from '@/components/media/useLoopPreview';
import type { Category, ImageRef, MediaAsset } from '@/content/types';
import type { Dictionary } from '@/lib/i18n/dictionaries';
import { localizedString } from '@/lib/i18n/localize';
import { href } from '@/lib/routing';
import type { Direction, Locale } from '@/lib/site';

type Props = {
  categories: Category[];
  locale: Locale;
  direction: Direction;
  dict: Dictionary;
};

/** Кадр для плитки: превью, а если его нет — первое, что есть у категории. */
function coverOf(category: Category): ImageRef | null {
  const candidates: MediaAsset[] = [
    ...(category.preview ? [category.preview] : []),
    ...(category.gallery ?? []),
    ...(category.backstage ?? []),
  ];

  for (const media of candidates) {
    const image = media.type === 'image' ? media.image : media.poster;
    if (image) return image;
  }
  return null;
}

/**
 * Пропорции плиток. Берутся из самих кадров, а не назначаются на глаз.
 *
 * Раньше плитки были 3:4, а первая — 3:2 во всю ширину двух колонок. Съёмки же
 * сняты вертикально, 9:16: широкая рамка показывала от такого кадра меньше
 * трети по высоте и резала лица, а обычная теряла четверть. Кадр — это то,
 * ради чего сюда пришли, и обрезать его рамкой, выбранной вёрсткой, нельзя.
 *
 * Одно число на всю сетку, а не своё у каждой плитки: ряд должен стоять ровно.
 * Медиана, а не среднее — один нетипичный кадр не должен перекашивать всех.
 */
function gridRatio(categories: Category[]): number {
  const ratios = categories
    .map((category) => coverOf(category))
    .filter((image): image is ImageRef => Boolean(image?.width && image?.height))
    .map((image) => image.width / image.height)
    .sort((a, b) => a - b);

  if (ratios.length === 0) return 3 / 4;
  return ratios[Math.floor(ratios.length / 2)];
}

export function CategoryTiles({ categories, locale, direction, dict }: Props) {
  const mode = useLoopMode();
  const ratio = gridRatio(categories);

  /*
   * Недобранный ряд остаётся воздухом. Сетка не держит хайрлайны фоном,
   * поэтому пустое место выглядит полем, а не дырой, — и подпирать его пустой
   * ячейкой, как было раньше, не нужно.
   */
  return (
    <ul data-reveal-stagger className="m-0 grid list-none gap-2 p-0 sm:grid-cols-2 lg:grid-cols-3 lg:gap-3">
      {categories.map((category, index) => (
        <li key={category._id}>
          <Tile
            category={category}
            locale={locale}
            direction={direction}
            dict={dict}
            mode={mode}
            ratio={ratio}
            order={index}
          />
        </li>
      ))}
    </ul>
  );
}

function Tile({
  category,
  locale,
  direction,
  dict,
  mode,
  ratio,
  order,
}: {
  category: Category;
  locale: Locale;
  direction: Direction;
  dict: Dictionary;
  mode: LoopMode;
  ratio: number;
  order: number;
}) {
  const linkRef = useRef<HTMLAnchorElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [active, setActive] = useState(false);

  const cover = coverOf(category);
  const loop = category.preview?.type === 'video' ? category.preview : null;
  const standing = Boolean(loop?.loopSrc) && mode === 'always';

  /*
   * Ролик греется, как только плитка показалась на экране, — к наведению он
   * уже в кэше. Раньше загрузка начиналась в момент наведения, и петля
   * появлялась через пять-десять секунд, когда мышь давно ушла.
   */
  const { source, ready, warmNow, markReady } = useLoopPreload({
    target: linkRef,
    loopSrc: loop?.loopSrc,
    mode,
    order,
  });

  const activate = useCallback(() => {
    // На случай, если навели раньше, чем очередь дошла сюда.
    warmNow();
    setActive(true);
  }, [warmNow]);
  const deactivate = useCallback(() => setActive(false), []);

  /*
   * Играет — когда навели (или всегда, если наведения на этом экране не
   * бывает). Запуск живёт в эффекте, а не в обработчике: в момент наведения
   * состояние ещё не доехало до разметки, и вызванный тут же play() не нашёл
   * бы, что играть.
   */
  const playing = standing || active;

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !source) return;

    if (playing) {
      void video.play().catch(() => {
        /* автозапуск может быть запрещён — плитка работает и без видео */
      });
      return;
    }

    video.pause();
    // С начала: иначе при следующем наведении кадр продолжится с середины.
    video.currentTime = 0;
  }, [playing, source]);

  const title = localizedString(category.title, locale);
  const description = localizedString(category.description, locale);

  return (
    <Link
      href={`${href({ locale, direction, section: 'portfolio' })}?category=${category.slug}`}
      onMouseEnter={activate}
      onMouseLeave={deactivate}
      onFocus={activate}
      onBlur={deactivate}
      ref={linkRef}
      // Пропорции — от кадра, поэтому object-cover ничего не срезает.
      style={{ aspectRatio: ratio }}
      className="group on-media relative block overflow-hidden bg-ink-sunken"
    >
      {cover ? (
        <Picture
          image={cover}
          alt=""
          sizes="(min-width: 1024px) 26rem, (min-width: 640px) 50vw, 100vw"
          className="absolute inset-0 h-full w-full object-cover transition-transform duration-[1100ms] ease-[var(--ease-out-soft)] group-hover:scale-[1.06] group-focus-visible:scale-[1.06]"
        />
      ) : null}

      {source && loop ? (
        /*
         * Показывается только когда действительно может играть: недогруженный
         * ролик выводит чёрный кадр поверх постера, и вместо кино получается
         * дыра. `preload="auto"` — потому что адрес уже подставлен осознанно,
         * ровно для того, чтобы к наведению всё было готово.
         */
        <video
          ref={videoRef}
          src={source}
          poster={loop.poster.src}
          autoPlay={standing}
          muted
          loop
          playsInline
          preload="auto"
          aria-hidden="true"
          onCanPlay={markReady}
          className={`pointer-events-none absolute inset-0 h-full w-full object-cover transition-opacity duration-[var(--duration-slow)] ease-[var(--ease-out-soft)] ${
            ready && playing ? 'opacity-100' : 'opacity-0'
          }`}
        />
      ) : null}

      <span aria-hidden="true" className="media-scrim pointer-events-none absolute inset-0" />

      <span className="absolute inset-x-0 bottom-0 flex flex-col p-5 lg:p-7">
        <span className="text-h3 text-balance text-bone">{title}</span>
        {description ? (
          <span className="mt-1 line-clamp-2 max-w-prose text-sm text-bone-dim">{description}</span>
        ) : null}
        {/*
         * Строка появляется по наведению: указывать «смотреть» на каждой из
         * пяти плиток разом — значит не указывать никуда. На сенсорном экране
         * наведения нет, поэтому там она стоит всегда.
         */}
        <span
          className={`label mt-3 text-bone-faint transition-[opacity,transform] duration-[var(--duration-base)] ease-[var(--ease-out-soft)] group-hover:translate-y-0 group-hover:opacity-100 group-focus-visible:translate-y-0 group-focus-visible:opacity-100 ${
            mode === 'always' ? '' : 'translate-y-1 opacity-0'
          }`}
        >
          {dict.common.view} →
        </span>
      </span>
    </Link>
  );
}
