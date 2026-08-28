'use client';

/**
 * Обложка направления: видео во всю ширину, показанное целиком.
 *
 * Кадр 1,85:1 шире почти любого экрана, поэтому «во весь экран» и «не
 * обрезать» одновременно невозможны: заполнение по высоте съело бы края.
 * Выбрано второе — блок занимает всю ширину, а высоту берёт из пропорций
 * ролика. Ничего не отрезается.
 *
 * Текст лежит поверх только там, где под него хватает места. На узком экране
 * обложка превращается в полосу высотой в пятую часть ширины — там подпись
 * уходит под видео, иначе её просто негде разместить.
 */

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import type { MediaAsset } from '@/content/types';
import { localizedString } from '@/lib/i18n/localize';
import type { Locale } from '@/lib/site';

type Props = {
  locale: Locale;
  eyebrow?: string;
  title: string;
  lead?: string;
  media: Extract<MediaAsset, { type: 'video' }>;
  cta?: { label: string; href: string };
  secondaryCta?: { label: string; href: string };
};

export function CoverHero({ locale, eyebrow, title, lead, media, cta, secondaryCta }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [source, setSource] = useState<string | null>(null);

  useEffect(() => {
    if (!media.loopSrc) return;

    const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const decide = () => {
      // Экономия трафика — осознанный выбор человека, и он важнее украшений.
      const connection = (navigator as { connection?: { saveData?: boolean } }).connection;
      setSource(motion.matches || connection?.saveData ? null : (media.loopSrc ?? null));
    };
    decide();

    motion.addEventListener('change', decide);
    return () => motion.removeEventListener('change', decide);
  }, [media.loopSrc]);

  const ratio = media.poster.width / media.poster.height;
  const alt = localizedString(media.alt, locale);

  const text = (
    <>
      {eyebrow ? <p className="label m-0 text-accent">{eyebrow}</p> : null}
      <h1 className="text-h1 mt-5 max-w-2xl text-balance">{title}</h1>
      {lead ? <p className="mt-5 max-w-xl text-lead text-bone-dim">{lead}</p> : null}

      {cta || secondaryCta ? (
        <div className="mt-8 flex flex-wrap items-center gap-4">
          {cta ? (
            <Link
              href={cta.href}
              className="label bg-bone px-7 py-4 text-ink transition-colors hover:bg-accent"
            >
              {cta.label}
            </Link>
          ) : null}
          {secondaryCta ? (
            <Link
              href={secondaryCta.href}
              className="label border border-line-strong px-7 py-4 text-bone transition-colors hover:border-bone"
            >
              {secondaryCta.label}
            </Link>
          ) : null}
        </div>
      ) : null}
    </>
  );

  return (
    <section>
      <div className="relative w-full overflow-hidden bg-ink-raised" style={{ aspectRatio: ratio }}>
        <img
          src={media.poster.src}
          alt={source ? '' : alt}
          width={media.poster.width}
          height={media.poster.height}
          className="absolute inset-0 h-full w-full object-cover"
        />

        {source ? (
          <video
            ref={videoRef}
            src={source}
            poster={media.poster.src}
            autoPlay
            muted
            loop
            playsInline
            preload="metadata"
            aria-hidden="true"
            className="absolute inset-0 h-full w-full object-cover"
          />
        ) : null}

        {/* Подложка под текстом. Кадр здесь тёмный и пёстрый, а тема светлая:
            без плотной подложки тёмный текст на нём не читается. Справа она
            сходит на нет, чтобы обложка осталась видна. */}
        <div
          aria-hidden="true"
          className="absolute inset-y-0 left-0 hidden w-[68%] lg:block"
          style={{
            background:
              'linear-gradient(to right, var(--color-ink) 0%, var(--color-ink) 38%, color-mix(in srgb, var(--color-ink) 82%, transparent) 62%, transparent 100%)',
          }}
        />

        <div className="container-content absolute inset-0 hidden flex-col justify-center lg:flex">
          <div className="max-w-xl">{text}</div>
        </div>
      </div>

      {/* Узкий экран: обложка — полоса, текст под ней. */}
      <div className="container-content py-12 lg:hidden">{text}</div>
    </section>
  );
}
