'use client';

/**
 * Основное меню текущего направления (ТЗ §4).
 * Активный пункт обозначен визуально и через `aria-current`.
 *
 * Под активным пунктом стоит линия, которая переезжает при переходе (M5).
 * Мгновенная перекраска текста в акцент не говорит, откуда и куда перешли, —
 * линия говорит. Она усиление: пункт отличается ещё и цветом, и пока линию не
 * измерили, у неё нулевая ширина.
 */

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSlidingUnderline } from '@/components/content/useSlidingUnderline';
import type { Dictionary } from '@/lib/i18n/dictionaries';
import { href, parseRoute } from '@/lib/routing';
import type { Direction, Locale, Section } from '@/lib/site';

type Props = {
  locale: Locale;
  direction: Direction;
  sections: Section[];
  dict: Dictionary;
};

export function ContextNav({ locale, direction, sections, dict }: Props) {
  const pathname = usePathname();
  const active = parseRoute(pathname).section;
  // На Home ветки ни один пункт не выбран — линии там нет.
  const { containerRef, barRef, setItem, placed } = useSlidingUnderline(active ?? undefined);

  return (
    <nav aria-label={dict.common.mainNavigation} className="hidden lg:block">
      <div ref={containerRef} className="relative">
        <ul className="m-0 flex list-none items-center gap-5 p-0 xl:gap-8">
          {sections.map((section) => {
            const isActive = section === active;
            return (
              <li key={section}>
                <Link
                  ref={setItem(section)}
                  href={href({ locale, direction, section })}
                  aria-current={isActive ? 'page' : undefined}
                  className={`label block transition-colors ${
                    isActive ? 'text-bone' : 'text-bone-dim hover:text-bone'
                  }`}
                >
                  {dict.nav[section]}
                </Link>
              </li>
            );
          })}
        </ul>

        <span
          ref={barRef}
          aria-hidden="true"
          className={`pointer-events-none absolute left-0 top-0 mt-1.5 h-px w-0 bg-accent ${
            placed
              ? 'transition-[transform,width] duration-[var(--duration-base)] ease-[var(--ease-out-soft)]'
              : ''
          }`}
        />
      </div>
    </nav>
  );
}
