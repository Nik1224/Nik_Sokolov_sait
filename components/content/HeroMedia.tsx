/**
 * Hero страницы (ТЗ §7).
 *
 * Фоновое видео здесь не используется: декоративный autoplay допустим только
 * muted и отключается при prefers-reduced-motion (§10). Постер как статичное
 * изображение даёт тот же эффект без веса и без движения.
 */

import Link from 'next/link';
import type { MediaAsset } from '@/content/types';
import { localizedString } from '@/lib/i18n/localize';
import type { Locale } from '@/lib/site';
import { Picture } from '../media/Picture';

type Props = {
  locale: Locale;
  eyebrow?: string;
  title: string;
  lead?: string;
  media?: MediaAsset;
  cta?: { label: string; href: string };
  secondaryCta?: { label: string; href: string };
  /** Компактный вариант для внутренних страниц. */
  compact?: boolean;
};

export function HeroMedia({
  locale,
  eyebrow,
  title,
  lead,
  media,
  cta,
  secondaryCta,
  compact = false,
}: Props) {
  const image = media ? (media.type === 'image' ? media.image : media.poster) : null;

  return (
    <section className={`relative overflow-hidden ${compact ? 'min-h-[38vh]' : 'min-h-[72vh]'} flex items-end`}>
      {image ? (
        <>
          <Picture
            image={image}
            alt={media ? localizedString(media.alt, locale) : ''}
            sizes="100vw"
            priority
            className="absolute inset-0 h-full w-full object-cover opacity-55"
          />
          <span
            aria-hidden="true"
            className="absolute inset-0 bg-gradient-to-t from-ink via-ink/70 to-ink/20"
          />
        </>
      ) : null}

      <div className={`container-content relative ${compact ? 'py-16' : 'py-20 lg:py-28'}`}>
        {eyebrow ? <p className="label mb-5 text-accent">{eyebrow}</p> : null}
        <h1 className={`${compact ? 'text-h1' : 'text-display'} m-0 max-w-4xl text-balance`}>{title}</h1>
        {lead ? <p className="mt-6 max-w-2xl text-lead text-bone-dim">{lead}</p> : null}

        {cta || secondaryCta ? (
          <div className="mt-10 flex flex-wrap items-center gap-4">
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
      </div>
    </section>
  );
}
