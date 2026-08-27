'use client';

/**
 * Карточка направления на START (ТЗ §5.1, §7).
 *
 * Полупрозрачная плашка поверх шоурила: видео проступает сквозь неё, но текст
 * остаётся читаемым за счёт размытия и затемнения под ним. Hover и focus
 * только усиливают акцент — на touch-устройствах карточка работает так же,
 * как на десктопе, без зависимости от наведения.
 */

import Link from 'next/link';
import type { MediaAsset } from '@/content/types';
import { track } from '@/lib/analytics';
import { localizedString } from '@/lib/i18n/localize';
import { directionHomeHref } from '@/lib/routing';
import type { Direction, Locale } from '@/lib/site';
import { Picture } from '../media/Picture';

type Props = {
  index: number;
  direction: Direction;
  label: string;
  description: string;
  /** Своё медиа карточки. Не нужно, когда за плашками уже идёт шоурил. */
  media?: MediaAsset;
  locale: Locale;
};

export function DirectionCard({ index, direction, label, description, media, locale }: Props) {
  const image = media ? (media.type === 'image' ? media.image : media.poster) : null;

  return (
    <Link
      href={directionHomeHref(locale, direction)}
      onClick={() => track('direction_select', { direction })}
      className="group relative flex min-h-[18rem] flex-1 flex-col justify-end overflow-hidden border border-line bg-ink/50 p-6 backdrop-blur-md transition-all duration-[var(--duration-base)] hover:border-line-strong hover:bg-ink/35 focus-visible:border-line-strong lg:min-h-[26rem] lg:p-8"
    >
      {image ? (
        <>
          <Picture
            image={image}
            alt={media ? localizedString(media.alt, locale) : ''}
            sizes="(min-width: 1024px) 33vw, 100vw"
            className="absolute inset-0 -z-10 h-full w-full object-cover opacity-45 transition-all duration-[var(--duration-slow)] ease-[var(--ease-out-soft)] group-hover:scale-105 group-hover:opacity-70"
          />
          <span
            aria-hidden="true"
            className="absolute inset-0 -z-10 bg-gradient-to-t from-ink via-ink/60 to-transparent"
          />
        </>
      ) : null}

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
    </Link>
  );
}
