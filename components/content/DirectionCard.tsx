'use client';

/**
 * Карточка направления на START (ТЗ §5.1, §7).
 *
 *两 разных подачи одного и того же:
 *  • где есть мышь — карточка компактная, а при наведении раскрывается вверх
 *    со вспышкой, и видео заполняет её целиком;
 *  • на сенсорных экранах наведения не существует (§5.1), поэтому вертикальное
 *    видео просто стоит в правой части карточки и играет сразу.
 *
 * Видео — усиление, а не условие: текст, описание и ссылка доступны всегда.
 */

import Link from 'next/link';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useLoopMode, useLoopPreload } from '@/components/media/useLoopPreview';
import type { MediaAsset } from '@/content/types';
import { track } from '@/lib/analytics';
import { localizedString } from '@/lib/i18n/localize';
import { directionHomeHref } from '@/lib/routing';
import { DIRECTION_PAINT, motionAllowed, requestPaintTransition } from '@/lib/transition';
import type { Direction, Locale } from '@/lib/site';

type Props = {
  index: number;
  direction: Direction;
  label: string;
  description: string;
  media?: MediaAsset;
  locale: Locale;
};

export function DirectionCard({ index, direction, label, description, media, locale }: Props) {
  const cardRef = useRef<HTMLAnchorElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [active, setActive] = useState(false);
  const mode = useLoopMode();

  const loop = media?.type === 'video' ? media : null;

  /*
   * Ролик греется, как только карточка показалась на экране. Раньше загрузка
   * начиналась в момент наведения — и полтора мегабайта ехали по сети уже
   * после того, как человек навёл: видео появлялось секунд через пять, когда
   * мышь давно ушла. Карточки идут по очереди, чтобы не делить канал.
   */
  const { source, warmNow } = useLoopPreload({
    target: cardRef,
    loopSrc: loop?.loopSrc,
    mode,
    order: index - 1,
  });

  /**
   * Без наведения видео живёт по видимости карточки: играет, когда она на
   * экране, и стоит, когда нет. Простого autoplay мало — браузер не запускает
   * ролик, который в момент загрузки был за пределами экрана, и после
   * прокрутки он так и остаётся на паузе.
   */
  useEffect(() => {
    if (mode !== 'always' || !loop?.loopSrc) return;
    const card = cardRef.current;
    if (!card) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        const video = videoRef.current;
        if (entry.isIntersecting) {
          void video?.play().catch(() => {
            /* автозапуск может быть запрещён — карточка работает и без видео */
          });
        } else {
          video?.pause();
        }
      },
      { threshold: 0.25 },
    );

    observer.observe(card);
    return () => observer.disconnect();
  }, [mode, loop, source]);

  const activate = useCallback(() => {
    if (mode !== 'hover' || !loop?.loopSrc) return;
    // На случай, если навели раньше, чем очередь дошла до этой карточки.
    warmNow();
    setActive(true);
  }, [mode, loop, warmNow]);

  const deactivate = useCallback(() => {
    if (mode !== 'hover') return;
    setActive(false);
  }, [mode]);

  /*
   * Запуск живёт в эффекте, а не в обработчике наведения: при первом наведении
   * адрес только попадает в состояние, и в этот момент у элемента ещё нет
   * источника — вызванный тут же play() не находит, что играть.
   */
  useEffect(() => {
    const video = videoRef.current;
    if (!video || mode !== 'hover' || !source) return;

    if (active) {
      void video.play().catch(() => {
        /* автозапуск может быть запрещён — карточка работает и без видео */
      });
      return;
    }

    video.pause();
    // С начала: иначе при следующем наведении кадр продолжится с середины.
    video.currentTime = 0;
  }, [mode, active, source]);

  const showsVideo = Boolean(loop) && mode !== 'none';

  return (
    <Link
      ref={cardRef}
      href={directionHomeHref(locale, direction)}
      onClick={(event) => {
        track('direction_select', { direction });

        // Обычный переход оставляем как есть: средняя кнопка, Cmd/Ctrl-клик и
        // «открыть в новой вкладке» ломать нельзя. Анимация — только для
        // простого клика и только когда движение разрешено (§10).
        if (event.defaultPrevented || event.metaKey || event.ctrlKey || event.shiftKey) return;
        if (event.button !== 0 || !motionAllowed()) return;

        event.preventDefault();
        requestPaintTransition({
          href: directionHomeHref(locale, direction),
          colorVar: DIRECTION_PAINT[direction],
        });
      }}
      onMouseEnter={activate}
      onMouseLeave={deactivate}
      onFocus={activate}
      onBlur={deactivate}
      className="group relative flex flex-1 flex-col justify-end overflow-hidden border border-line bg-ink/50 p-6 backdrop-blur-md transition-[height,background-color,border-color] duration-[var(--duration-slow)] ease-[var(--ease-out-soft)] hover:border-line-strong focus-visible:border-line-strong lg:h-52 lg:p-8 lg:hover:h-[30rem] lg:focus-visible:h-[30rem]"
    >
      {showsVideo && loop ? (
        <>
          {/* На узком экране — колонка справа; на широком — вся карточка. */}
          <video
            ref={videoRef}
            src={source ?? undefined}
            poster={loop.poster.src}
            autoPlay={mode === 'always'}
            muted
            loop
            playsInline
            /* Адрес подставлен осознанно и заранее — грузим целиком. */
            preload="auto"
            aria-hidden="true"
            className="pointer-events-none absolute inset-y-0 right-0 w-[42%] object-cover opacity-100 transition-opacity duration-[var(--duration-slow)] lg:inset-0 lg:w-full lg:opacity-0 lg:group-hover:opacity-100 lg:group-focus-visible:opacity-100"
          />
          {/* Затемнение нужно только на широком экране, где текст лежит поверх
              видео. На телефоне текст стоит рядом с кадром, и накладка там
              выглядела чёрной полосой на плашке. */}
          <span
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 hidden bg-gradient-to-t from-ink via-ink/55 to-ink/10 opacity-0 transition-opacity duration-[var(--duration-slow)] lg:block lg:group-hover:opacity-100 lg:group-focus-visible:opacity-100"
          />
        </>
      ) : null}

      {/* Вспышка. Декоративная, для ассистивных технологий её не существует. */}
      <span aria-hidden="true" className="direction-card-flash pointer-events-none absolute inset-0 bg-bone" />

      <span className={`relative ${showsVideo ? 'pr-[46%] lg:pr-0' : ''}`}>
        <span className="label block text-accent">{String(index).padStart(2, '0')}</span>
        <span className="text-h2 mt-3 block text-bone">{label}</span>
        <span className="mt-3 block max-w-sm text-bone-dim">{description}</span>
        <span
          aria-hidden="true"
          className="label mt-6 inline-block text-bone transition-transform duration-[var(--duration-base)] ease-[var(--ease-out-soft)] group-hover:translate-x-1"
        >
          →
        </span>
      </span>

      {media && media.type === 'image' ? (
        <span className="sr-only">{localizedString(media.alt, locale)}</span>
      ) : null}
    </Link>
  );
}
