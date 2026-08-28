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

/** Скидка за оба формата округляется так же, как в калькуляторе. */
const withBundleDiscount = (sum: number) =>
  sum - Math.round((sum * calculator.bundleDiscount) / 100) * 100;

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

  it.each([
    ['wedding-3h-full', ['wedding-3h', 'video-hourly']],
    ['wedding-day-full', ['wedding-12h', 'video-wedding-day']],
  ])('%s — сумма двух пакетов минус скидка за оба формата', (slug, parts) => {
    const sum = parts.reduce((total, part) => total + bySlug(part).price!, 0);
    expect(bySlug(slug).price).toBe(withBundleDiscount(sum));
  });

  it('«Фото и видео, максимум» считается по двенадцати часам, а не по десяти', () => {
    // Фото-пакет помечен «от 110 000» за десять часов; в максимуме часов
    // двенадцать, поэтому фотографическая половина берётся по ним.
    const photo = formatCost(PHOTO, 12, taper);
    expect(bySlug('wedding-max-full').price).toBe(
      withBundleDiscount(photo + bySlug('video-max').price!),
    );
  });

  it('совмещённый пакет всегда дешевле, чем купить обе съёмки отдельно', () => {
    for (const slug of ['wedding-3h-full', 'wedding-day-full', 'wedding-max-full']) {
      const entry = bySlug(slug);
      const stated = /(\d[\d\s]*) ₽ \+ .*?(\d[\d\s]*) ₽ = (\d[\d\s]*) ₽/.exec(
        entry.disclaimer?.ru ?? '',
      );
      // Расклад в примечании обязан сходиться с ценой: клиент по нему считает.
      expect(stated, `${slug}: в примечании нет расклада`).not.toBeNull();
      const full = Number(stated![3].replace(/\s/g, ''));
      expect(entry.price).toBe(withBundleDiscount(full));
      expect(entry.price!).toBeLessThan(full);
    }
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
