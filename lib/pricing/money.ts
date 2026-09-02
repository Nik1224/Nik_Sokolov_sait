/**
 * Форматирование цен.
 *
 * Один формат на весь сайт: раньше та же строчка была написана в четырёх
 * местах — на странице стоимости, в калькуляторе, в пакетах и в дополнениях.
 * Рано или поздно они расходятся, и на одной странице сумма выглядит
 * по-разному.
 *
 * `narrowSymbol` вместо обычного: по умолчанию английская локаль выводит для
 * рубля код — «RUB 12,000». Символ ₽ понятен без перевода, а место для него
 * каждый язык выбирает сам: по-русски он идёт после числа, по-английски —
 * перед ним, как принято с $ и £.
 */

import type { Locale } from '@/lib/site';

export function moneyFormat(locale: Locale, currency?: string): Intl.NumberFormat {
  return new Intl.NumberFormat(locale === 'ru' ? 'ru-RU' : 'en-GB', {
    // Без валюты — просто число: у дополнения цена может быть указана без неё.
    style: currency ? 'currency' : 'decimal',
    currency,
    ...(currency ? { currencyDisplay: 'narrowSymbol' as const } : {}),
    maximumFractionDigits: 0,
  });
}
