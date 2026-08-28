/**
 * Пакеты и калькулятор считают одинаково (ТЗ §5.8).
 *
 * Это была реальная беда: пакеты приехали со старого сайта, калькулятор считал
 * по новым ставкам, и одна и та же съёмка стоила по-разному на одной странице.
 * Тест держит их вместе — поменяли ставку в калькуляторе, увидели, какие пакеты
 * разошлись.
 */

import { describe, expect, it } from 'vitest';
import { directions, pricingEntries } from '@/content/seed';
import { formatCost } from '@/lib/pricing/calculator';

const privateDirection = directions.find((item) => item.key === 'private')!;
const calculator = privateDirection.calculator!;
const { photoHourPrice: PHOTO, videoHourPrice: VIDEO, taper } = calculator;

const packages = pricingEntries.filter(
  (entry) => entry.direction === 'private' && entry.kind === 'package',
);
const bySlug = (slug: string) => packages.find((entry) => entry.slug === slug)!;

/** Каждый следующий оператор стоит половину основного. */
const withOperators = (base: number, operators: number) =>
  Math.round((base * (1 + (operators - 1) / 2)) / 100) * 100;

describe('цены пакетов совпадают с калькулятором', () => {
  it.each([
    ['wedding-3h', formatCost(PHOTO, 3, taper)],
    ['wedding-8h', formatCost(PHOTO, 8, taper)],
    // Пакет «10–12 часов» одной цифрой не покрыть, показываем нижнюю границу.
    ['wedding-12h', formatCost(PHOTO, 10, taper)],
    ['portrait-family', formatCost(PHOTO, 2, null)],
    ['portrait-solo', formatCost(PHOTO, 1, null)],
    ['video-hourly', formatCost(VIDEO, 3, null)],
    ['video-wedding-day', withOperators(formatCost(VIDEO, 10, taper), 2)],
  ])('%s', (slug, expected) => {
    expect(bySlug(slug).price).toBe(expected);
  });

  it('«Видео, максимальный» — три оператора плюс кран и монтаж в день свадьбы', () => {
    const crew = withOperators(formatCost(VIDEO, 12, taper), 3);
    expect(bySlug('video-max').price).toBe(crew + 40000);
  });

  it('«Максимальный портрет» дороже съёмки ровно на сторонние услуги', () => {
    // Стилист, визажист и студия — не наценка за час, и это должно быть видно.
    const shooting = formatCost(PHOTO, 2, null);
    expect(bySlug('portrait-max').price).toBe(shooting + 26000);
    expect(bySlug('portrait-max').disclaimer?.ru).toContain('24 000');
  });

  it('цена «от» стоит только там, где сумма зависит от часов', () => {
    expect(bySlug('wedding-12h').priceFrom).toBe(true);
    expect(bySlug('wedding-8h').priceFrom).toBeFalsy();
  });

  it('дополнительный час стоит столько же, сколько в калькуляторе', () => {
    const hour = pricingEntries.find((entry) => entry.slug === 'extra-hour')!;
    expect(hour.price).toBe(PHOTO);
    expect(hour.disclaimer?.ru).toContain(String(VIDEO).replace(/\B(?=(\d{3})+(?!\d))/g, ' '));
  });
});

describe('группы пакетов', () => {
  it('каждый пакет PRIVATE лежит в объявленной группе', () => {
    const declared = new Set((privateDirection.pricingGroups ?? []).map((group) => group.slug));
    expect(declared.size).toBeGreaterThan(0);
    for (const entry of packages) {
      expect(declared, entry.slug).toContain(entry.groupSlug);
    }
  });

  it('пустых групп нет: раскрывать нечего — показывать незачем', () => {
    for (const group of privateDirection.pricingGroups ?? []) {
      expect(packages.some((entry) => entry.groupSlug === group.slug), group.slug).toBe(true);
    }
  });
});
