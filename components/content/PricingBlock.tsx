/**
 * Стоимость (ТЗ §5.8, §7).
 *
 * Показываются только подтверждённые цифры. Если цена не заполнена, честно
 * пишем «по запросу» — придумывать значения запрещено (§1.2).
 */

import Link from 'next/link';
import type { PricingEntry } from '@/content/types';
import type { Dictionary } from '@/lib/i18n/dictionaries';
import { localizedString } from '@/lib/i18n/localize';
import type { Locale } from '@/lib/site';

type Props = {
  entries: PricingEntry[];
  locale: Locale;
  dict: Dictionary;
  contactHref: string;
};

function formatPrice(entry: PricingEntry, locale: Locale, dict: Dictionary): string {
  if (typeof entry.price !== 'number') return dict.pricing.onRequest;
  const formatted = new Intl.NumberFormat(locale === 'ru' ? 'ru-RU' : 'en-GB', {
    style: entry.currency ? 'currency' : 'decimal',
    currency: entry.currency,
    maximumFractionDigits: 0,
  }).format(entry.price);
  const unit = localizedString(entry.unit, locale);
  return `${dict.pricing.from} ${formatted}${unit ? ` / ${unit}` : ''}`;
}

export function PricingBlock({ entries, locale, dict, contactHref }: Props) {
  if (entries.length === 0) return null;

  return (
    <ul className="m-0 grid list-none gap-px bg-line p-0 md:grid-cols-2 lg:grid-cols-3">
      {entries.map((entry) => {
        const disclaimer = localizedString(entry.disclaimer, locale);
        const ctaLabel = localizedString(entry.ctaLabel, locale) || dict.form.heading;

        return (
          <li key={entry._id} className="flex flex-col bg-ink p-6 lg:p-8">
            <h3 className="text-h3 m-0 text-bone">{localizedString(entry.title, locale)}</h3>
            <p className="label mt-4 text-accent">{formatPrice(entry, locale, dict)}</p>
            <p className="mt-4 flex-1 text-bone-dim">{localizedString(entry.description, locale)}</p>
            {disclaimer ? <p className="mt-6 text-sm text-bone-faint">{disclaimer}</p> : null}
            <Link
              href={contactHref}
              className="label mt-6 text-bone transition-colors hover:text-accent"
            >
              {ctaLabel} →
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
