'use client';

/**
 * Плитки категорий портфолио на Home ветки PRIVATE (ТЗ §5.2, §7).
 *
 * Плитка — это кадр, а не строка. Раньше здесь стояли названия со стрелкой, а
 * фотография показывалась только при наведении: на телефоне, откуда приходит
 * большинство, её не видел никто. Теперь постер стоит всегда, название лежит
 * поверх на вуали, а петля — усиление сверху.
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

type Mode = 'none' | 'hover' | 'always';

/** Кадр для плитки: превью, а если его нет — первое, что есть у категории. */
function coverOf(category: Category): { image: ImageRef; alt?: MediaAsset['alt'] } | null {
  const candidates: MediaAsset[] = [
    ...(category.preview ? [category.preview] : []),
    ...(category.gallery ?? []),
    ...(category.backstage ?? []),
  ];

  for (const media of candidates) {
    const image = media.type === 'image' ? media.image : media.poster;
    if (image) return { image, alt: media.alt };
  }
  return null;
}

export function CategoryTiles({ categories, locale, direction, dict }: Props) {
  /*
   * Как показывать петли. Решается один раз на весь список: условия одинаковые
   * для всех плиток, и пять одинаковых подписок на media query ничего не
   * добавляют.
   */
  const [mode, setMode] = useState<Mode>('none');

  useEffect(() => {
    const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const hover = window.matchMedia('(hover: hover)');

    const update = () => {
      // Экономия трафика — осознанный выбор человека, и он важнее украшений.
      const connection = (navigator as { connection?: { saveData?: boolean } }).connection;
      if (motion.matches || connection?.saveData) {
        setMode('none');
        return;
      }
      setMode(hover.matches ? 'hover' : 'always');
    };

    update();
    motion.addEventListener('change', update);
    hover.addEventListener('change', update);
    return () => {
      motion.removeEventListener('change', update);
      hover.removeEventListener('change', update);
    };
  }, []);

  /*
   * Первая плитка занимает две колонки, когда это ровно достраивает сетку до
   * целых рядов: пять категорий — это 2 + 3, без дыры в углу. Раньше дыру
   * закрывала пустая ячейка, и на светлой теме она читалась сплошным серым
   * прямоугольником — заметной поломкой рядом с последней плиткой.
   *
   * Когда арифметика не сходится, все плитки одинаковые, а недобранный ряд
   * остаётся воздухом: сетка больше не держит хайрлайны фоном, и пустое место
   * выглядит полем, а не дырой.
   *
   * Считается только для трёх колонок: на двух и на одной первая плитка всегда
   * обычная — там широкий кадр занял бы весь экран.
   */
  const featured = categories.length % 3 === 2;

  return (
    <ul data-reveal-stagger className="m-0 grid list-none gap-2 p-0 sm:grid-cols-2 lg:grid-cols-3 lg:gap-3">
      {categories.map((category, index) => (
        <li
          key={category._id}
          className={featured && index === 0 ? 'lg:col-span-2' : undefined}
        >
          <Tile
            category={category}
            locale={locale}
            direction={direction}
            dict={dict}
            mode={mode}
            wide={featured && index === 0}
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
  wide,
}: {
  category: Category;
  locale: Locale;
  direction: Direction;
  dict: Dictionary;
  mode: Mode;
  wide: boolean;
}) {
  const linkRef = useRef<HTMLAnchorElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [active, setActive] = useState(false);
  /*
   * Адрес подставляется только при первом наведении. Иначе пять роликов
   * поехали бы за человеком по сети ещё до того, как он на них посмотрел.
   */
  const [source, setSource] = useState<string | null>(null);

  const cover = coverOf(category);
  const loop = category.preview?.type === 'video' ? category.preview : null;
  const shows = Boolean(loop?.loopSrc) && mode !== 'none';
  const standing = shows && mode === 'always';

  const activate = useCallback(() => {
    if (mode !== 'hover' || !loop?.loopSrc) return;
    setSource((current) => current ?? loop.loopSrc ?? null);
    setActive(true);
  }, [mode, loop]);

  const deactivate = useCallback(() => setActive(false), []);

  /*
   * Запуск живёт в эффекте, а не в обработчике наведения. При первом
   * наведении адрес только попадает в состояние, и в этот момент у элемента
   * ещё нет источника: вызванный тут же play() не находит, что играть, и
   * ролик молча остаётся на нулевой секунде.
   */
  useEffect(() => {
    const video = videoRef.current;
    if (!video || standing) return;

    if (active && source) {
      void video.play().catch(() => {
        /* автозапуск может быть запрещён — плитка работает и без видео */
      });
      return;
    }

    video.pause();
    // С начала: иначе при следующем наведении кадр продолжится с середины.
    video.currentTime = 0;
  }, [standing, active, source]);

  /*
   * Без наведения кадр живёт по видимости плитки: играет, пока она на экране,
   * и стоит, когда ушла. Простого autoplay мало — браузер не запускает ролик,
   * который в момент загрузки был за пределами экрана, и после прокрутки он
   * так и остаётся на паузе.
   */
  useEffect(() => {
    const el = linkRef.current;
    if (!el || !standing || !loop?.loopSrc) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        const video = videoRef.current;
        if (entry.isIntersecting) {
          setSource((current) => current ?? loop.loopSrc ?? null);
          void video?.play().catch(() => {
            /* автозапуск может быть запрещён — плитка работает и без видео */
          });
        } else {
          video?.pause();
        }
      },
      { threshold: 0.25 },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [standing, loop]);

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
      /*
       * Пропорции задаются плиткой, а не содержимым: широкая в две колонки
       * получается той же высоты, что обычная рядом, и ряд стоит ровно.
       * На узком экране широкой плитки не бывает — там все вертикальные.
       */
      className={`group on-media relative block overflow-hidden bg-ink-sunken ${
        wide ? 'aspect-[3/4] sm:aspect-[3/2]' : 'aspect-[3/4]'
      }`}
    >
      {cover ? (
        <Picture
          image={cover.image}
          alt=""
          sizes={
            wide
              ? '(min-width: 1024px) 52rem, (min-width: 640px) 50vw, 100vw'
              : '(min-width: 1024px) 26rem, (min-width: 640px) 50vw, 100vw'
          }
          className="absolute inset-0 h-full w-full object-cover transition-transform duration-[1100ms] ease-[var(--ease-out-soft)] group-hover:scale-[1.06] group-focus-visible:scale-[1.06]"
        />
      ) : null}

      {shows && loop ? (
        <video
          ref={videoRef}
          src={source ?? undefined}
          poster={loop.poster.src}
          autoPlay={standing}
          muted
          loop
          playsInline
          preload={standing ? 'metadata' : 'none'}
          aria-hidden="true"
          className={`pointer-events-none absolute inset-0 h-full w-full object-cover transition-opacity duration-[var(--duration-slow)] ease-[var(--ease-out-soft)] ${
            standing
              ? 'opacity-100'
              : 'opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100'
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
