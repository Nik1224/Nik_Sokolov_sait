/** Мелкие глобальные элементы: skip-link, JSON-LD, метки контента, крошки. */

import Link from 'next/link';
import type { Dictionary } from '@/lib/i18n/dictionaries';

/** Первый элемент в tab-порядке: пропуск навигации (ТЗ §11). */
export function SkipLink({ label }: { label: string }) {
  return (
    <a href="#main" className="skip-link">
      {label}
    </a>
  );
}

/** Структурированные данные (§12). */
export function JsonLd({ data }: { data: Record<string, unknown> | Record<string, unknown>[] }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, '\\u003c') }}
    />
  );
}

/**
 * Метка «страница доступна только на русском» (§4.1).
 * Показывается один раз на странице, а не у каждого поля.
 */
export function FallbackNotice({ dict }: { dict: Dictionary }) {
  return (
    <p
      lang="en"
      className="label border-l-2 border-accent bg-ink-raised px-4 py-3 text-bone-dim"
    >
      {dict.fallback.notice}
    </p>
  );
}

/** Пометка неподтверждённого факта (§0, §15.1). */
export function UnconfirmedTag({ dict }: { dict: Dictionary }) {
  return (
    <span className="label border border-accent-dim px-2 py-1 text-accent">
      [{dict.content.unconfirmed}]
    </span>
  );
}

/**
 * Полоса о demo-данных. Видна только вне production, чтобы placeholders
 * заведомо не попали в боевую версию (§17).
 */
export function DemoBanner({ dict }: { dict: Dictionary }) {
  if (process.env.NODE_ENV === 'production') return null;
  return (
    <div className="border-b border-accent-dim bg-accent-dim/15 px-[var(--spacing-gutter)] py-2 text-center">
      <p className="label text-accent">{dict.content.demoData}</p>
    </div>
  );
}

export type Crumb = { label: string; href?: string };

/** Хлебные крошки на вложенных страницах (§12). */
export function Breadcrumbs({ items, dict }: { items: Crumb[]; dict: Dictionary }) {
  return (
    <nav aria-label={dict.common.breadcrumb} className="mb-8">
      <ol className="m-0 flex list-none flex-wrap items-center gap-2 p-0">
        {items.map((item, index) => (
          <li key={`${item.label}-${index}`} className="flex items-center gap-2">
            {index > 0 ? (
              <span aria-hidden="true" className="text-bone-faint">
                /
              </span>
            ) : null}
            {item.href ? (
              <Link href={item.href} className="label text-bone-faint transition-colors hover:text-bone-dim">
                {item.label}
              </Link>
            ) : (
              <span aria-current="page" className="label text-bone-dim">
                {item.label}
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
