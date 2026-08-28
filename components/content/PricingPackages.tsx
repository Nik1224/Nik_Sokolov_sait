'use client';

/**
 * Пакетные предложения (ТЗ §5.8, §7).
 *
 * Пакеты подряд читались как свалка: человек ищет свадьбу, а листает портреты
 * и видео. Здесь они разложены по группам, которые раскрываются на месте — без
 * перехода на другую страницу, чтобы выбор оставался перед глазами.
 *
 * Внутри группы форматы переключаются, а не лежат отдельными разделами: свадьба
 * — это один выбор («фото, видео или всё вместе»), а не три разных места на
 * странице.
 *
 * Свёрнутая группа всё равно отвечает на главный вопрос: сколько пакетов и в
 * какие деньги. Иначе список превратился бы в пару безмолвных строк.
 */

import { useMemo, useState } from 'react';
import { PricingBlock } from '@/components/content/PricingBlock';
import type { ContactChannel, PricingEntry, PricingGroup } from '@/content/types';
import type { ShootFormat } from '@/lib/pricing/calculator';
import type { Dictionary } from '@/lib/i18n/dictionaries';
import { localizedString } from '@/lib/i18n/localize';
import type { Locale } from '@/lib/site';

type Props = {
  groups: PricingGroup[];
  entries: PricingEntry[];
  locale: Locale;
  dict: Dictionary;
  contacts: ContactChannel[];
};

type PackageFormat = ShootFormat | 'both';

/** Порядок переключателя: от простого к полному. */
const FORMATS: PackageFormat[] = ['photo', 'video', 'both'];

export function PricingPackages({ groups, entries, locale, dict, contacts }: Props) {
  const [open, setOpen] = useState<string[]>([]);
  /** Выбранный формат внутри каждой группы. */
  const [format, setFormat] = useState<Record<string, PackageFormat>>({});

  const money = useMemo(
    () =>
      new Intl.NumberFormat(locale === 'ru' ? 'ru-RU' : 'en-GB', {
        style: 'currency',
        currency: 'RUB',
        maximumFractionDigits: 0,
      }),
    [locale],
  );

  /** Склонение по правилам языка, а не по самодельным условиям. */
  const packagesLabel = useMemo(() => {
    const rules = new Intl.PluralRules(locale === 'ru' ? 'ru-RU' : 'en-GB');
    return (value: number) => {
      const form = rules.select(value);
      const unit =
        form === 'one'
          ? dict.pricing.packagesUnit.one
          : form === 'few'
            ? dict.pricing.packagesUnit.few
            : dict.pricing.packagesUnit.many;
      return `${value} ${unit}`;
    };
  }, [locale, dict]);

  const sections = groups
    .map((group) => ({
      group,
      items: entries.filter((entry) => entry.groupSlug === group.slug),
    }))
    .filter((section) => section.items.length > 0);

  // Пакет без группы не должен исчезнуть со страницы из-за опечатки в ключе.
  const known = new Set(sections.flatMap((section) => section.items.map((item) => item._id)));
  const ungrouped = entries.filter((entry) => !known.has(entry._id));

  if (sections.length === 0) {
    return <PricingBlock entries={entries} locale={locale} dict={dict} contacts={contacts} />;
  }

  function formatLabel(value: PackageFormat): string {
    if (value === 'photo') return dict.calculator.photo;
    if (value === 'video') return dict.calculator.video;
    return dict.pricing.bothFormats;
  }

  function toggle(slug: string) {
    setOpen((current) =>
      current.includes(slug) ? current.filter((item) => item !== slug) : [...current, slug],
    );
  }

  /** «от 36 000 ₽» для одной цены, «36 000 – 110 000 ₽» для вилки. */
  function priceSummary(items: PricingEntry[]): string | null {
    const prices = items.map((item) => item.price).filter((price): price is number => price != null);
    if (prices.length === 0) return null;
    const min = Math.min(...prices);
    const max = Math.max(...prices);
    return min === max ? money.format(min) : `${money.format(min)} – ${money.format(max)}`;
  }

  return (
    <div className="border-t border-line">
      {sections.map(({ group, items }) => {
        const expanded = open.includes(group.slug);
        const title = localizedString(group.title, locale);
        const description = localizedString(group.description, locale);
        const summary = priceSummary(items);
        const panelId = `pricing-group-${group.slug}`;

        // Переключатель появляется сам, когда в группе форматов больше одного.
        const available = FORMATS.filter((value) =>
          items.some((entry) => (entry.format ?? 'photo') === value),
        );
        const active = format[group.slug] ?? available[0];
        const shown =
          available.length > 1
            ? items.filter((entry) => (entry.format ?? 'photo') === active)
            : items;

        return (
          <section key={group.slug} className="border-b border-line">
            <h3 className="m-0">
              <button
                type="button"
                onClick={() => toggle(group.slug)}
                aria-expanded={expanded}
                aria-controls={panelId}
                className="group flex w-full items-center gap-6 py-7 text-left transition-colors hover:text-accent"
              >
                <span className="flex-1">
                  <span className="text-h3 block text-bone transition-colors group-hover:text-accent">
                    {title}
                  </span>
                  {description ? (
                    <span className="mt-2 block max-w-xl text-sm text-bone-faint">{description}</span>
                  ) : null}

                  {/* На узком экране сводка уходит под описание: справа для неё
                      нет места, а без неё свёрнутая группа ни о чём не говорит. */}
                  <span className="label mt-3 block text-bone-dim sm:hidden">
                    {packagesLabel(items.length)}
                    {summary ? ` · ${summary}` : ''}
                  </span>
                </span>

                {/* Свёрнутая группа сразу отвечает: сколько пакетов и почём. */}
                <span className="label hidden shrink-0 text-right text-bone-dim sm:block">
                  <span className="block">{packagesLabel(items.length)}</span>
                  {summary ? <span className="mt-1 block text-bone-faint">{summary}</span> : null}
                </span>

                <svg
                  aria-hidden="true"
                  viewBox="0 0 24 24"
                  className={`h-4 w-4 shrink-0 fill-none stroke-current stroke-[1.5] transition-transform duration-200 ${
                    expanded ? 'rotate-180' : ''
                  }`}
                  focusable="false"
                >
                  <path d="m5 9 7 7 7-7" />
                </svg>
              </button>
            </h3>

            {expanded ? (
              <div id={panelId} className="pricing-panel pb-10">
                {available.length > 1 ? (
                  <fieldset className="m-0 mb-8 border-0 p-0">
                    <legend className="label mb-4 p-0 text-accent">{dict.calculator.formats}</legend>
                    <div className="flex flex-wrap gap-3">
                      {available.map((value) => (
                        <label
                          key={value}
                          className={`label cursor-pointer border px-5 py-3 transition-colors ${
                            value === active
                              ? 'border-bone bg-bone text-ink'
                              : 'border-line text-bone-dim hover:border-line-strong hover:text-bone'
                          }`}
                        >
                          <input
                            type="radio"
                            name={`format-${group.slug}`}
                            className="sr-only"
                            checked={value === active}
                            onChange={() =>
                              setFormat((current) => ({ ...current, [group.slug]: value }))
                            }
                          />
                          {formatLabel(value)}
                        </label>
                      ))}
                    </div>
                  </fieldset>
                ) : null}

                <PricingBlock
                  entries={shown}
                  locale={locale}
                  dict={dict}
                  contacts={contacts}
                  headingLevel="h4"
                />
              </div>
            ) : (
              <div id={panelId} hidden />
            )}
          </section>
        );
      })}

      {ungrouped.length > 0 ? (
        <div className="pt-10">
          <PricingBlock entries={ungrouped} locale={locale} dict={dict} contacts={contacts} />
        </div>
      ) : null}
    </div>
  );
}
