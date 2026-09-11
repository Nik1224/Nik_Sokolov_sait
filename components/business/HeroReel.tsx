'use client';

/**
 * Шоурил в первом экране ветки BUSINESS.
 *
 * Петля без звука играет фоном, полная версия открывается по кнопке рядом с
 * заголовком. Так первый экран показывает работу с первой секунды, но не
 * начинает говорить с человеком голосом, которого он не просил.
 *
 * Постер стоит всегда и первым слоем: пока петля качается, на его месте не
 * должно быть ни пустоты, ни серого прямоугольника. Видео проявляется поверх
 * него, когда действительно пошло, — до этого момента разницы не видно.
 *
 * Петля не подставляется вовсе, если человек попросил не двигать интерфейс
 * или включил экономию трафика: два с половиной мегабайта ради украшения на
 * мобильном тарифе — не та цена, которую вправе назначать сайт.
 */

import { useEffect, useRef, useState } from 'react';
import type { ImageRef } from '@/content/types';
import { Picture } from '@/components/media/Picture';

type Props = {
  poster: ImageRef;
  loopSrc: string;
  alt: string;
};

export function HeroReel({ poster, loopSrc, alt }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [source, setSource] = useState<string | null>(null);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const connection = (navigator as { connection?: { saveData?: boolean } }).connection;

    const decide = () => {
      if (motion.matches || connection?.saveData) {
        setSource(null);
        setPlaying(false);
        return;
      }
      setSource(loopSrc);
    };

    decide();
    motion.addEventListener('change', decide);
    return () => motion.removeEventListener('change', decide);
  }, [loopSrc]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !source) return;
    void video.play().catch(() => {
      /* автозапуск может быть запрещён — остаётся постер, и это рабочий вид */
    });
  }, [source]);

  return (
    <>
      <Picture
        image={poster}
        alt={alt}
        sizes="(min-width: 1024px) 50vw, 100vw"
        priority
        className="absolute inset-0 h-full w-full object-cover"
      />
      {source ? (
        <video
          ref={videoRef}
          src={source}
          poster={poster.src}
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          aria-hidden="true"
          onPlaying={() => setPlaying(true)}
          className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-[var(--duration-reveal)] ease-[var(--ease-out-soft)] ${
            playing ? 'opacity-100' : 'opacity-0'
          }`}
        />
      ) : null}
    </>
  );
}
