'use client';

/**
 * Основное меню текущего направления (ТЗ §4).
 * Активный пункт обозначен визуально и через `aria-current`.
 */

import Link from 'next/link';
import { usePathname } from 'next/navigation';
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

  return (
    <nav aria-label={dict.common.mainNavigation} className="hidden lg:block">
      <ul className="m-0 flex list-none items-center gap-5 p-0 xl:gap-8">
        {sections.map((section) => {
          const isActive = section === active;
          return (
            <li key={section}>
              <Link
                href={href({ locale, direction, section })}
                aria-current={isActive ? 'page' : undefined}
                className={`label transition-colors ${
                  isActive ? 'text-accent' : 'text-bone-dim hover:text-bone'
                }`}
              >
                {dict.nav[section]}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
