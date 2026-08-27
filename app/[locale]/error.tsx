'use client';

/** Ошибка рендеринга (ТЗ §7, Empty/ErrorState): понятное сообщение и повтор. */

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { getDictionary } from '@/lib/i18n/dictionaries';
import { parseRoute, startHref } from '@/lib/routing';

export default function ErrorState({ reset }: { error: Error; reset: () => void }) {
  const { locale } = parseRoute(usePathname());
  const dict = getDictionary(locale);

  return (
    <main id="main" className="container-content flex min-h-dvh flex-col justify-center py-24">
      <h1 className="text-h1 m-0 max-w-2xl text-balance">{dict.states.errorTitle}</h1>
      <p className="mt-5 max-w-xl text-lead text-bone-dim">{dict.states.errorBody}</p>

      <div className="mt-10 flex flex-wrap gap-4">
        <button
          type="button"
          onClick={reset}
          className="label bg-bone px-7 py-4 text-ink transition-colors hover:bg-accent"
        >
          {dict.states.retry}
        </button>
        <Link
          href={startHref(locale)}
          className="label border border-line-strong px-7 py-4 text-bone transition-colors hover:border-bone"
        >
          {dict.states.goToStart}
        </Link>
      </div>
    </main>
  );
}
