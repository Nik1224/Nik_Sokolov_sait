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
import { useSlidingUnderline } from './useSlidingUnderline';
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
  const current = available.includes(active) ? active : (available[0] ?? 'photos');
  // Хук стоит до раннего выхода: порядок хуков не должен зависеть от данных.
  const { containerRef, barRef, setItem, placed } = useSlidingUnderline(current);

  if (available.length === 0) return null;
  const items = sections[current];

  return (
    <div>
      {available.length > 1 ? (
        /*
         * Уточнение к выбранной категории, а не второй такой же выбор. Раньше
         * здесь стояли крупные кнопки, и выбранная была залита чёрным: на
         * бумажной теме это оказывался самый тяжёлый элемент страницы — у
         * фильтра, а не у работ.
         */
        <fieldset className="m-0 mb-10 border-0 p-0 lg:mb-12">
          <legend className="sr-only">{dict.media.sectionLegend}</legend>
          <div ref={containerRef} className="relative inline-block">
            <div className="flex flex-wrap gap-x-7 gap-y-2">
              {available.map((key) => (
                <label
                  key={key}
                  ref={setItem(key)}
                  className={`label cursor-pointer pb-2 transition-colors has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-4 has-[:focus-visible]:outline-accent ${
                    key === current ? 'text-bone' : 'text-bone-faint hover:text-bone'
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
            {/*
              Линия чернилами, а не акцентом: красный уже стоит под выбранной
              категорией выше, и два красных подчёркивания на экране спорили бы
              за то, какой из выборов главный.
            */}
            <span
              ref={barRef}
              aria-hidden="true"
              className={`pointer-events-none absolute left-0 top-0 h-px w-0 bg-bone ${
                placed
                  ? 'transition-[transform,width] duration-[var(--duration-base)] ease-[var(--ease-out-soft)]'
                  : ''
              }`}
            />
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
