'use client';

/**
 * Калькулятор стоимости съёмки (ТЗ §5.8 — правила расчёта).
 *
 * Показывает порядок суммы до разговора: клиент выбирает формат, тип съёмки
 * и длительность, а расчёт объясняет себя построчно. Сама арифметика живёт в
 * lib/pricing/calculator и покрыта тестами — здесь только интерфейс.
 *
 * Все ставки и правила приходят из данных: менять цену владелец должен без
 * разработчика.
 */

import { useMemo, useState } from 'react';
import { ContactButton } from '@/components/contact/ContactButton';
import type { CalculatorConfig, ContactChannel } from '@/content/types';
import type { Dictionary } from '@/lib/i18n/dictionaries';
import { localizedString } from '@/lib/i18n/localize';
import type { MessageDraft } from '@/lib/contact/message';
import { buildQuote, type ShootFormat } from '@/lib/pricing/calculator';
import { moneyFormat } from '@/lib/pricing/money';
import type { Locale } from '@/lib/site';

type Props = {
  config: CalculatorConfig;
  locale: Locale;
  dict: Dictionary;
  contacts: ContactChannel[];
};

export function PriceCalculator({ config, locale, dict, contacts }: Props) {
  const [formats, setFormats] = useState<ShootFormat[]>(['photo']);
  const [typeSlug, setTypeSlug] = useState(config.types[0]?.slug ?? '');
  const [hours, setHours] = useState(config.types[0]?.defaultHours ?? 1);

  const type = config.types.find((item) => item.slug === typeSlug) ?? config.types[0];

  const quote = useMemo(
    () =>
      buildQuote({
        formats,
        hours,
        photoHourPrice: config.photoHourPrice,
        videoHourPrice: config.videoHourPrice,
        taper: type?.taper ? config.taper : null,
        bundleDiscount: config.bundleDiscount,
      }),
    [formats, hours, type, config],
  );

  /** Склонение по правилам языка, а не по самодельным условиям. */
  const hoursLabel = useMemo(() => {
    const rules = new Intl.PluralRules(locale === 'ru' ? 'ru-RU' : 'en-GB');
    return (value: number) => {
      const form = rules.select(value);
      const unit =
        form === 'one'
          ? dict.calculator.hoursUnit.one
          : form === 'few'
            ? dict.calculator.hoursUnit.few
            : dict.calculator.hoursUnit.many;
      return `${value} ${unit}`;
    };
  }, [locale, dict]);

  const money = useMemo(() => moneyFormat(locale, config.currency), [locale, config.currency]);

  function toggleFormat(format: ShootFormat) {
    setFormats((current) =>
      current.includes(format) ? current.filter((item) => item !== format) : [...current, format],
    );
  }

  /** Смена типа подтягивает длительность в допустимые границы. */
  function pickType(slug: string) {
    setTypeSlug(slug);
    const next = config.types.find((item) => item.slug === slug);
    if (!next) return;
    setHours((current) => Math.min(Math.max(current, next.minHours), next.maxHours));
  }

  if (!type) return null;

  /**
   * Текст, с которым человек уйдёт в мессенджер: то же, что он видит на экране.
   * Владельцу не приходится переспрашивать объём, а клиенту — пересказывать.
   */
  const draft: MessageDraft = {
    subject: localizedString(type.messageTitle ?? type.title, locale).toLocaleLowerCase(
      locale === 'ru' ? 'ru-RU' : 'en-GB',
    ),
    details: [
      quote.lines
        .map((line) =>
          (line.format === 'photo' ? dict.calculator.photo : dict.calculator.video).toLocaleLowerCase(
            locale === 'ru' ? 'ru-RU' : 'en-GB',
          ),
        )
        .join(dict.calculator.formatsJoiner),
      hoursLabel(hours),
    ].filter(Boolean),
    estimate: quote.total > 0 ? money.format(quote.total) : undefined,
  };

  const hint = localizedString(type.hint, locale);
  const note = localizedString(config.note, locale);

  return (
    <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,22rem)] lg:gap-14">
      <div className="flex flex-col gap-9">
        <fieldset className="m-0 border-0 p-0">
          <legend className="label mb-4 p-0 text-accent">{dict.calculator.formats}</legend>
          <div className="flex flex-wrap gap-3">
            {(['photo', 'video'] as const).map((format) => {
              const active = formats.includes(format);
              return (
                <label
                  key={format}
                  className={`label cursor-pointer border px-5 py-3 transition-colors ${
                    active
                      ? 'border-bone bg-bone text-ink'
                      : 'border-line text-bone-dim hover:border-line-strong hover:text-bone'
                  }`}
                >
                  <input
                    type="checkbox"
                    className="sr-only"
                    checked={active}
                    onChange={() => toggleFormat(format)}
                  />
                  {format === 'photo' ? dict.calculator.photo : dict.calculator.video}
                </label>
              );
            })}
          </div>
        </fieldset>

        <fieldset className="m-0 border-0 p-0">
          <legend className="label mb-4 p-0 text-accent">{dict.calculator.shootType}</legend>
          <div className="flex flex-wrap gap-3">
            {config.types.map((option) => {
              const active = option.slug === type.slug;
              return (
                <label
                  key={option.slug}
                  className={`label cursor-pointer border px-5 py-3 transition-colors ${
                    active
                      ? 'border-bone bg-bone text-ink'
                      : 'border-line text-bone-dim hover:border-line-strong hover:text-bone'
                  }`}
                >
                  <input
                    type="radio"
                    name="shoot-type"
                    className="sr-only"
                    checked={active}
                    onChange={() => pickType(option.slug)}
                  />
                  {localizedString(option.title, locale)}
                </label>
              );
            })}
          </div>
        </fieldset>

        <div>
          <label htmlFor="calc-hours" className="label block text-accent">
            {dict.calculator.hours}
          </label>
          <div className="mt-4 flex items-center gap-5">
            <input
              id="calc-hours"
              type="range"
              min={type.minHours}
              max={type.maxHours}
              step={1}
              value={hours}
              onChange={(event) => setHours(Number(event.target.value))}
              aria-valuetext={hoursLabel(hours)}
              className="calc-range h-1 w-full cursor-pointer"
            />
            <output htmlFor="calc-hours" className="text-h3 w-28 shrink-0 text-bone">
              {hoursLabel(hours)}
            </output>
          </div>

          {hint ? <p className="mt-4 max-w-lg text-sm text-bone-faint">{hint}</p> : null}
        </div>
      </div>

      {/* Итог объявляется ассистивным технологиям: он меняется без перезагрузки. */}
      <div
        role="status"
        aria-live="polite"
        className="h-fit border-t border-line pt-6 lg:border-l lg:border-t-0 lg:pl-10 lg:pt-0"
      >
        {quote.lines.length === 0 ? (
          <p className="m-0 text-bone-dim">{dict.calculator.pickFormat}</p>
        ) : (
          <>
            <ul className="m-0 list-none space-y-3 p-0">
              {quote.lines.map((line) => (
                <li key={line.format} className="flex justify-between gap-4 text-bone-dim">
                  <span>
                    {line.format === 'photo' ? dict.calculator.photo : dict.calculator.video},{' '}
                    {hoursLabel(line.hours)}
                  </span>
                  <span className="whitespace-nowrap text-bone">{money.format(line.amount)}</span>
                </li>
              ))}

              {quote.discount > 0 ? (
                <li className="flex justify-between gap-4 border-t border-line pt-3 text-accent">
                  <span>{dict.calculator.bundleDiscount}</span>
                  <span className="whitespace-nowrap">−{money.format(quote.discount)}</span>
                </li>
              ) : null}
            </ul>

            <p className="mt-6 flex items-baseline justify-between gap-4 border-t border-line pt-5">
              <span className="label text-bone-faint">{dict.calculator.total}</span>
              <span className="text-h2 whitespace-nowrap text-bone">{money.format(quote.total)}</span>
            </p>

            {type.taper && quote.lastHourRate ? (
              <p className="label mt-3 text-right text-bone-faint">
                {dict.calculator.perHourNow} — {money.format(quote.lastHourRate)}
              </p>
            ) : null}
          </>
        )}

        <ContactButton
          dict={dict}
          contacts={contacts}
          draft={draft}
          label={dict.calculator.cta}
          className="mt-8 px-6 py-3.5"
        />

        {note ? <p className="mt-6 text-sm text-bone-faint">{note}</p> : null}
      </div>
    </div>
  );
}
