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

  /**
   * На обложке текст мельче, чем на обычном hero: он должен уместиться в
   * плотную часть подложки. Крупный заголовок вылезал за неё и оказывался
   * прямо на кадре — а в кадре есть чёрные полосы между клипами, на которых
   * тёмный текст исчезает совсем.
   */
  const text = (
    <>
      {eyebrow ? <p className="label m-0 text-accent">{eyebrow}</p> : null}
      <h1 className="text-h3 mt-3 max-w-lg text-balance lg:text-h2">{title}</h1>
      {lead ? <p className="mt-3 max-w-md text-bone-dim lg:text-base">{lead}</p> : null}

      {cta || secondaryCta ? (
        <div className="mt-6 flex flex-wrap items-center gap-3">
          {cta ? (
            <Link
              href={cta.href}
              className="label bg-bone px-6 py-3.5 text-ink transition-colors hover:bg-accent"
            >
              {cta.label}
            </Link>
          ) : null}
          {secondaryCta ? (
            <Link
              href={secondaryCta.href}
              className="label border border-line-strong px-6 py-3.5 text-bone transition-colors hover:border-bone"
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

        {/* Подложка под текстом.
            Не заливка, а стекло: видео за ней видно и оно продолжает двигаться,
            но размывается и осветляется, поэтому тёмный текст светлой темы на
            нём читается. Плотность нарастает сверху вниз — у вершины купола
            почти ничего, у самого низа сплошной цвет страницы, чтобы стык со
            следующей секцией не читался. */}
        <div aria-hidden="true" className="absolute inset-0 hidden overflow-hidden lg:block">
          <div
            className="absolute bottom-0 left-[-4%] h-[56%] w-[78%]"
            style={{
              borderRadius: '50% 50% 0 0 / 100% 100% 0 0',
              // contrast поднимает тени, brightness — общую светлоту: без них
              // чёрные участки кадра остаются чёрными, сколько ни размывай.
              // Радиус размытия подобран по замеру кадров: каждый лишний
              // пиксель радиуса — работа для видеокарты на каждом кадре видео.
              backdropFilter: 'blur(12px) contrast(0.36) brightness(1.4)',
              WebkitBackdropFilter: 'blur(12px) contrast(0.36) brightness(1.4)',
              background: [
                'linear-gradient(to bottom,',
                ' color-mix(in srgb, var(--color-ink) 12%, transparent) 0%,',
                ' color-mix(in srgb, var(--color-ink) 40%, transparent) 26%,',
                ' color-mix(in srgb, var(--color-ink) 78%, transparent) 48%,',
                ' color-mix(in srgb, var(--color-ink) 94%, transparent) 70%,',
                ' var(--color-ink) 100%)',
              ].join(''),
              // Мягкий вход сверху, чтобы кромка стекла не читалась линией.
              maskImage: 'linear-gradient(to bottom, transparent 0%, black 11%, black 100%)',
              WebkitMaskImage: 'linear-gradient(to bottom, transparent 0%, black 11%, black 100%)',
            }}
          />
          {/* Полоса у самого низа сшивает обложку со следующим блоком. */}
          <div
            className="absolute inset-x-0 bottom-0 h-[12%]"
            style={{
              background: 'linear-gradient(to top, var(--color-ink) 40%, transparent 100%)',
            }}
          />
        </div>

        <div className="container-content absolute inset-x-0 bottom-0 hidden pb-10 lg:block">
          <div className="max-w-xl">{text}</div>
        </div>
      </div>

      {/* Узкий экран: обложка — полоса, текст под ней. */}
      <div className="container-content py-12 lg:hidden">{text}</div>
    </section>
  );
}
