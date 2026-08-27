'use client';

/**
 * Карточка направления на START (ТЗ §5.1, §7).
 *
 * В покое — компактная полупрозрачная плашка ровно под текст. При наведении
 * или фокусе карточка раскрывается вверх, проходит короткая вспышка и внутри
 * начинает играть видео направления.
 *
 * Всё это — усиление, а не условие: текст, ссылка и описание доступны всегда.
 * На touch-устройствах наведения нет, при prefers-reduced-motion нет движения
 * и видео — карточка остаётся рабочей ссылкой (§5.1, §10, §11).
 */

import Link from 'next/link';
import { useCallback, useEffect, useRef, useState } from 'react';
import type { MediaAsset } from '@/content/types';
import { track } from '@/lib/analytics';
import { localizedString } from '@/lib/i18n/localize';
import { directionHomeHref } from '@/lib/routing';
import type { Direction, Locale } from '@/lib/site';

type Props = {
  index: number;
  direction: Direction;
  label: string;
  description: string;
  /** Видео направления. Показывается только в раскрытом состоянии. */
  media?: MediaAsset;
  locale: Locale;
};

export function DirectionCard({ index, direction, label, description, media, locale }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  // Файл подключается при первом наведении: три ролика разом на старте
  // страницы стоили бы посетителю мегабайт ни за что.
  const [source, setSource] = useState<string | null>(null);
  /**
   * Видео в карточке имеет смысл только там, где есть наведение и разрешено
   * движение. На touch-устройствах и при prefers-reduced-motion элемента нет
   * вовсе — не скрытый, а не созданный.
   */
  const [videoUseful, setVideoUseful] = useState(false);

  const loop = media?.type === 'video' ? media : null;

  useEffect(() => {
    const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const hover = window.matchMedia('(hover: hover)');
    const update = () => setVideoUseful(!motion.matches && hover.matches);
    update();
    motion.addEventListener('change', update);
    hover.addEventListener('change', update);
    return () => {
      motion.removeEventListener('change', update);
      hover.removeEventListener('change', update);
    };
  }, []);

  const activate = useCallback(() => {
    if (!loop?.loopSrc || !videoUseful) return;
    setSource((current) => current ?? loop.loopSrc ?? null);
    void videoRef.current?.play().catch(() => {
      /* автозапуск может быть запрещён — карточка работает и без видео */
    });
  }, [loop, videoUseful]);

  const deactivate = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;
    video.pause();
    video.currentTime = 0;
  }, []);

  return (
    <Link
      href={directionHomeHref(locale, direction)}
      onClick={() => track('direction_select', { direction })}
      onMouseEnter={activate}
      onMouseLeave={deactivate}
      onFocus={activate}
      onBlur={deactivate}
      className="group relative flex flex-1 flex-col justify-end overflow-hidden border border-line bg-ink/50 p-6 backdrop-blur-md transition-[height,background-color,border-color] duration-[var(--duration-slow)] ease-[var(--ease-out-soft)] hover:border-line-strong focus-visible:border-line-strong lg:h-52 lg:p-8 lg:hover:h-[30rem] lg:focus-visible:h-[30rem]"
    >
      {loop && videoUseful ? (
        <>
          <video
            ref={videoRef}
            src={source ?? undefined}
            poster={loop.poster.src}
            muted
            loop
            playsInline
            preload="none"
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 h-full w-full object-cover opacity-0 transition-opacity duration-[var(--duration-slow)] group-hover:opacity-100 group-focus-visible:opacity-100"
          />
          {/* Затемнение под текстом: без него подпись тонет в светлых кадрах. */}
          <span
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 bg-gradient-to-t from-ink via-ink/55 to-ink/10 opacity-0 transition-opacity duration-[var(--duration-slow)] group-hover:opacity-100 group-focus-visible:opacity-100"
          />
        </>
      ) : null}

      {/* Вспышка. Декоративная, для ассистивных технологий её не существует. */}
      <span aria-hidden="true" className="direction-card-flash pointer-events-none absolute inset-0 bg-bone" />

      <span className="relative">
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
