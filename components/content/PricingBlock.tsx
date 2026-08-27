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
  // «от» только там, где это действительно нижняя граница: у пакета с
  // фиксированной ценой такая приписка вводит в заблуждение.
  const prefix = entry.priceFrom ? `${dict.pricing.from} ` : '';
  return `${prefix}${formatted}${unit ? ` / ${unit}` : ''}`;
}

export function PricingBlock({ entries, locale, dict, contactHref }: Props) {
  const packages = entries.filter((entry) => entry.kind !== 'extra');
  if (packages.length === 0) return null;

  return (
    <ul className="m-0 grid list-none gap-px bg-line p-0 md:grid-cols-2 lg:grid-cols-3">
      {packages.map((entry) => {
        const disclaimer = localizedString(entry.disclaimer, locale);
        const ctaLabel = localizedString(entry.ctaLabel, locale) || dict.form.heading;

        return (
          <li key={entry._id} className="flex flex-col bg-ink p-6 lg:p-8">
            <h3 className="text-h3 m-0 text-bone">{localizedString(entry.title, locale)}</h3>
            <p className="label mt-4 text-accent">{formatPrice(entry, locale, dict)}</p>
            <p className="mt-4 text-bone-dim">{localizedString(entry.description, locale)}</p>

            {entry.includes.length > 0 ? (
              <ul className="m-0 mt-6 flex-1 list-none space-y-2 p-0 text-sm text-bone-dim">
                {entry.includes.map((line, index) => (
                  <li key={index} className="flex gap-3">
                    <span aria-hidden="true" className="mt-2 h-px w-3 shrink-0 bg-line-strong" />
                    {localizedString(line, locale)}
                  </li>
                ))}
              </ul>
            ) : (
              <span className="flex-1" />
            )}

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

/**
 * Дополнения к пакетам: доплаты и опции. Карточка на каждую строку выглядела
 * бы как отдельная услуга, хотя это надбавка к основному пакету.
 */
export function PricingExtras({ entries, locale, dict }: Omit<Props, 'contactHref'>) {
  const extras = entries.filter((entry) => entry.kind === 'extra');
  if (extras.length === 0) return null;

  return (
    <ul className="m-0 list-none p-0">
      {extras.map((entry) => {
        const note = localizedString(entry.disclaimer, locale);
        return (
          <li
            key={entry._id}
            className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1 border-t border-line py-4"
          >
            <span className="text-bone">{localizedString(entry.title, locale)}</span>
            <span className="label text-accent">{note || formatPrice(entry, locale, dict)}</span>
          </li>
        );
      })}
    </ul>
  );
}
