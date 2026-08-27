'use client';

/**
 * 404 (ТЗ §6): предлагает три направления и способ связаться.
 * Язык берётся из адреса — он остаётся источником истины и на странице ошибки.
 */

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { getDictionary } from '@/lib/i18n/dictionaries';
import { directionHomeHref, parseRoute, startHref } from '@/lib/routing';
import { DIRECTIONS } from '@/lib/site';

export default function NotFound() {
  const { locale } = parseRoute(usePathname());
  const dict = getDictionary(locale);

  return (
    <main id="main" className="container-content flex min-h-dvh flex-col justify-center py-24">
      <p className="label text-accent">404</p>
      <h1 className="text-h1 mt-5 max-w-2xl text-balance">{dict.states.notFoundTitle}</h1>
      <p className="mt-5 max-w-xl text-lead text-bone-dim">{dict.states.notFoundBody}</p>

      <ul className="m-0 mt-12 grid list-none gap-px bg-line p-0 sm:grid-cols-3">
        {DIRECTIONS.map((direction) => (
          <li key={direction} className="bg-ink">
            <Link
              href={directionHomeHref(locale, direction)}
              className="group flex items-center justify-between p-6"
            >
              <span className="text-h3 text-bone transition-colors group-hover:text-accent">
                {dict.directions[direction]}
              </span>
              <span aria-hidden="true" className="label text-bone-faint">
                →
              </span>
            </Link>
          </li>
        ))}
      </ul>

      <p className="mt-10">
        <Link href={startHref(locale)} className="label text-bone-dim transition-colors hover:text-bone">
          {dict.states.goToStart} →
        </Link>
      </p>
    </main>
  );
}
