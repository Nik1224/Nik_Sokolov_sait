'use client';

/**
 * Обложка направления для вертикального ролика.
 *
 * `CoverHero` построен под кадр 1,85:1 и растягивает блок во всю ширину, беря
 * высоту из пропорций. Для вертикальной петли 9:16 это дало бы экран высотой в
 * полторы страницы, поэтому у неё своя раскладка: текст колонкой слева, кадр
 * стоит справа во весь рост и уходит в правый край.
 *
 * Ролик показан целиком и в полную силу, а не фоном под вуалью: вертикальный
 * кадр и так занимает меньше половины ширины, затемнять его незачем — текст с
 * ним не пересекается.
 */

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import type { MediaAsset } from '@/content/types';
import { localizedString } from '@/lib/i18n/localize';
import type { Locale } from '@/lib/site';
import { Picture } from '../media/Picture';
import { localSrc } from '@/lib/media';

type Props = {
  locale: Locale;
  title: string;
  lead?: string;
  media: Extract<MediaAsset, { type: 'video' }>;
  cta?: { label: string; href: string };
  secondaryCta?: { label: string; href: string };
};

export function PortraitHero({ locale, title, lead, media, cta, secondaryCta }: Props) {
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

  const alt = localizedString(media.alt, locale);

  return (
    <section className="relative overflow-hidden">
      <div className="container-content grid grid-cols-12 items-center gap-x-[var(--spacing-gutter)] py-16 lg:py-24">
        <div className="col-span-12 lg:col-span-6" data-reveal>
          <h1 className="text-display m-0 text-balance">{title}</h1>
          {lead ? <p className="mt-7 max-w-[32ch] text-lead text-bone-dim">{lead}</p> : null}

          {cta || secondaryCta ? (
            <div className="mt-10 flex flex-wrap items-center gap-4">
              {cta ? (
                <Link
                  href={cta.href}
                  className="label bg-bone px-7 py-4 text-ink transition-colors hover:bg-accent hover:text-on-accent"
                >
                  {cta.label}
                </Link>
              ) : null}
              {secondaryCta ? (
                <Link
                  href={secondaryCta.href}
                  className="label px-7 py-4 text-bone transition-colors hover:text-accent"
                >
                  {secondaryCta.label}
                </Link>
              ) : null}
            </div>
          ) : null}
        </div>

        {/*
          Кадр занимает свою колонку целиком и остаётся в поле страницы. Вылет
          в правый край пробовался и отброшен: поля перестают сходиться, а
          односторонний вылет читается как съехавшая вёрстка, а не как приём.
        */}
        <figure className="col-span-12 mt-12 lg:col-span-6 lg:mt-0" data-reveal>
          <div className="relative aspect-[9/16] max-h-[76vh] overflow-hidden lg:ml-auto">
            <Picture
              image={media.poster}
              alt={source ? '' : alt}
              sizes="(min-width: 1024px) 42vw, 100vw"
              priority
              className="absolute inset-0 h-full w-full object-cover"
            />
            {source ? (
              <video
                ref={videoRef}
                className="absolute inset-0 h-full w-full object-cover"
                src={source}
                poster={localSrc(media.poster.src)}
                autoPlay
                muted
                loop
                playsInline
                aria-label={alt}
              />
            ) : null}
          </div>
        </figure>
      </div>
    </section>
  );
}
