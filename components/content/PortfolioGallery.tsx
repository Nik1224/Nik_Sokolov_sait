'use client';

/**
 * Портфолио категории: кадры, ролики и вертикальные видео (ТЗ §5.2).
 *
 * Вкладки появляются сами, когда снято больше одного вида материала. Смешивать
 * их в одну ленту нельзя: человек приходит либо смотреть фотографии, либо
 * смотреть видео, и перебирать одно ради другого он не станет.
 */

import { useState } from 'react';
import type { MediaAsset } from '@/content/types';
import { MediaGallery } from '@/components/media/MediaGallery';
import type { Dictionary } from '@/lib/i18n/dictionaries';
import type { Locale } from '@/lib/site';

export type PortfolioSections = {
  photos: MediaAsset[];
  videos: MediaAsset[];
  reels: MediaAsset[];
};

type Props = {
  sections: PortfolioSections;
  locale: Locale;
  dict: Dictionary;
};

type SectionKey = keyof PortfolioSections;

/** Порядок вкладок: сначала то, за чем приходят чаще. */
const ORDER: SectionKey[] = ['photos', 'videos', 'reels'];

export function PortfolioGallery({ sections, locale, dict }: Props) {
  const available = ORDER.filter((key) => sections[key].length > 0);
  const [active, setActive] = useState<SectionKey>(available[0] ?? 'photos');

  if (available.length === 0) return null;

  const current = available.includes(active) ? active : available[0];
  const items = sections[current];

  return (
    <div>
      {available.length > 1 ? (
        <fieldset className="m-0 mb-10 border-0 p-0 lg:mb-12">
          <legend className="sr-only">{dict.media.sectionLegend}</legend>
          {/* По центру и крупнее фильтра категорий: это главный выбор на
              странице, а не уточнение к нему. */}
          <div className="flex flex-wrap justify-center gap-3 sm:gap-4">
            {available.map((key) => (
              <label
                key={key}
                className={`label cursor-pointer border px-8 py-4 text-[0.8125rem] transition-colors ${
                  key === current
                    ? 'border-bone bg-bone text-ink'
                    : 'border-line text-bone-dim hover:border-line-strong hover:text-bone'
                }`}
              >
                <input
                  type="radio"
                  name="portfolio-section"
                  className="sr-only"
                  checked={key === current}
                  onChange={() => setActive(key)}
                />
                {dict.media[key]}
              </label>
            ))}
          </div>
        </fieldset>
      ) : null}

      {/*
        key — чтобы при смене вкладки счётчик «показано» начинался заново.

        Горизонтальный фильм в узкой колонке теряется, поэтому ролики идут во
        всю ширину. Кадры и вертикальные видео, наоборот, живут в колонках.
      */}
      <MediaGallery
        key={current}
        items={items}
        locale={locale}
        dict={dict}
        layout={current === 'videos' ? 'feature' : 'masonry'}
        initialCount={current === 'photos' ? 36 : undefined}
      />
    </div>
  );
}
