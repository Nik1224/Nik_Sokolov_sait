'use client';

/**
 * Фон стартовой страницы: шоурил на всю площадь экрана (ТЗ §5.1, §10).
 *
 * Правила безопасного фонового видео:
 *  • постер виден сразу и остаётся, если видео не загрузилось;
 *  • воспроизведение только muted + playsinline — иначе браузер его запретит;
 *  • при prefers-reduced-motion движения нет вовсе (§10);
 *  • при включённой в системе экономии трафика видео не грузится;
 *  • поверх лежит затемнение — без него текст на светлых кадрах теряется.
 */

import { useEffect, useState } from 'react';
import type { ImageRef } from '@/content/types';
import { imageSrc, objectPosition } from '@/lib/media';

type Props = {
  poster: ImageRef;
  /** Облегчённая петля. Пока её нет, фон остаётся статичным постером. */
  loopSrc?: string;
  /** Фон декоративный: содержание страницы от него не зависит (§11). */
  alt?: string;
};

export function StartBackdrop({ poster, loopSrc, alt = '' }: Props) {
  const [playVideo, setPlayVideo] = useState(false);

  useEffect(() => {
    if (!loopSrc) return;

    const motion = window.matchMedia('(prefers-reduced-motion: reduce)');

    const decide = () => {
      // Экономия трафика — осознанный выбор человека, и он важнее украшений.
      const connection = (navigator as { connection?: { saveData?: boolean } }).connection;
      setPlayVideo(!motion.matches && !connection?.saveData);
    };
    decide();

    motion.addEventListener('change', decide);
    return () => motion.removeEventListener('change', decide);
  }, [loopSrc]);

  // z-0, а не отрицательный индекс: слой с z-index < 0 уходит под фон body и
  // становится невидимым. Содержимое страницы поднято на z-10.
  return (
    <div aria-hidden={alt ? undefined : 'true'} className="fixed inset-0 z-0 overflow-hidden bg-ink">
      <img
        src={imageSrc(poster, 1920)}
        alt={alt}
        width={poster.width}
        height={poster.height}
        className="absolute inset-0 h-full w-full object-cover"
        style={{ objectPosition: objectPosition(poster) }}
      />

      {playVideo && loopSrc ? (
        <video
          data-backdrop="showreel"
          src={loopSrc}
          poster={poster.src}
          autoPlay
          muted
          loop
          playsInline
          preload="none"
          // Постер остаётся под видео: если файл не доедет, фон не почернеет.
          onError={() => setPlayVideo(false)}
          className="absolute inset-0 h-full w-full object-cover"
        />
      ) : null}

      {/* Кривая затемнения описана в styles/globals.css: плотно под текстом,
          прозрачно за карточками. Лёгкая общая подложка страхует от кадров,
          которые окажутся ярче постера. */}
      <div className="absolute inset-0 bg-ink/22" />
      <div className="start-scrim absolute inset-0" />
    </div>
  );
}
