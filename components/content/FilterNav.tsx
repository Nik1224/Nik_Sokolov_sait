'use client';

/**
 * Ряд фильтров листинга: категории портфолио, типы записей журнала.
 *
 * Раньше это была полоса мелкого моноширинного капса между двумя линиями, а
 * следом за ней шёл второй ряд — крупные кнопки с чёрной заливкой. Два ряда
 * управления подряд заставляли выбирать дважды, ещё не увидев ни одного кадра,
 * а самым тяжёлым элементом бумажной страницы оказывался фильтр, а не работы.
 *
 * Теперь это навигация раздела: названия набраны заголовочной гарнитурой, а
 * под выбранным стоит линия, которая переезжает при переключении. Переход
 * между категориями идёт без перезагрузки, поэтому линия действительно едет,
 * а не перерисовывается.
 */

import Link from 'next/link';
import { useSlidingUnderline } from './useSlidingUnderline';

export type FilterItem = { key: string; label: string; href: string };

type Props = {
  /** Доступное имя ряда: по нему его находят и озвучка, и тесты. */
  label: string;
  items: FilterItem[];
  /** Ключ выбранного пункта. Пусто — выбран пункт «все». */
  active?: string;
  className?: string;
};

export function FilterNav({ label, items, active, className = '' }: Props) {
  const { containerRef, barRef, setItem, placed } = useSlidingUnderline(active);

  if (items.length === 0) return null;

  return (
    <nav aria-label={label} className={className}>
      {/*
        Линия лежит рядом со списком, а не внутри: `span` среди `li` — это
        сломанная разметка списка. Точкой отсчёта для обоих служит эта обёртка.
      */}
      <div ref={containerRef} className="relative border-b border-line">
        <ul className="m-0 flex list-none flex-wrap gap-x-8 gap-y-1 p-0">
          {items.map((item) => {
            const isActive = item.key === active;
            return (
              <li key={item.key} className="m-0">
                <Link
                  ref={setItem(item.key)}
                  href={item.href}
                  aria-current={isActive ? 'true' : undefined}
                  className={`text-h3 block pb-4 transition-colors ${
                    isActive ? 'text-bone' : 'text-bone-dim hover:text-bone'
                  }`}
                >
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>

        {/*
          Пока линию не измерили, ширина нулевая — увидеть нечего, и выбранный
          пункт всё равно отличается цветом.
        */}
        <span
          ref={barRef}
          aria-hidden="true"
          className={`pointer-events-none absolute left-0 top-0 h-px w-0 bg-accent ${
            placed
              ? 'transition-[transform,width] duration-[var(--duration-base)] ease-[var(--ease-out-soft)]'
              : ''
          }`}
        />
      </div>
    </nav>
  );
}
