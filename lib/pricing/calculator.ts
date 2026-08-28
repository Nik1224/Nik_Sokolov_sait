/**
 * Расчёт стоимости съёмки.
 *
 * Логика вынесена из компонента: её нужно проверять тестами, а не глазами.
 * Ошибка здесь — это неверная цена, названная клиенту.
 */

export type ShootFormat = 'photo' | 'video';

export type TaperConfig = {
  /** До какого часа включительно действует базовая ставка. */
  fromHour: number;
  /** К какому часу ставка опускается до нижней границы. */
  toHour: number;
  /** Доля от базовой ставки в нижней точке. */
  floorFactor: number;
};

export type QuoteInput = {
  formats: ShootFormat[];
  hours: number;
  photoHourPrice: number;
  videoHourPrice: number;
  /** Свадебная тарификация. Для остальных съёмок ставка не меняется. */
  taper: TaperConfig | null;
  /** Скидка при заказе фото и видео вместе, доля от 0 до 1. */
  bundleDiscount: number;
};

export type QuoteLine = { format: ShootFormat; hours: number; amount: number };

export type Quote = {
  lines: QuoteLine[];
  subtotal: number;
  discount: number;
  total: number;
  /** Во сколько обходится последний час — показывает, что ставка снижается. */
  lastHourRate: number | null;
};

/**
 * Ставка за конкретный час.
 *
 * Первые часы идут по базовой цене, дальше она убывает линейно до нижней
 * границы и после неё больше не падает — иначе на длинной съёмке ставка ушла
 * бы в ноль и ниже.
 */
export function hourRate(base: number, hour: number, taper: TaperConfig | null): number {
  if (!taper || hour <= taper.fromHour) return base;

  const floor = base * taper.floorFactor;
  const span = taper.toHour - taper.fromHour;
  if (span <= 0) return floor;

  const step = (base - floor) / span;
  const reduced = base - (hour - taper.fromHour) * step;
  return Math.max(reduced, floor);
}

/** Стоимость съёмки выбранной длительности. */
export function formatCost(base: number, hours: number, taper: TaperConfig | null): number {
  let total = 0;
  for (let hour = 1; hour <= hours; hour++) total += hourRate(base, hour, taper);
  // До сотен: копейки в цене съёмки выглядят как ошибка, а не как точность.
  return Math.round(total / 100) * 100;
}

export function buildQuote(input: QuoteInput): Quote {
  const { formats, hours, photoHourPrice, videoHourPrice, taper, bundleDiscount } = input;

  const lines: QuoteLine[] = [];
  if (formats.includes('photo')) {
    lines.push({ format: 'photo', hours, amount: formatCost(photoHourPrice, hours, taper) });
  }
  if (formats.includes('video')) {
    lines.push({ format: 'video', hours, amount: formatCost(videoHourPrice, hours, taper) });
  }

  const subtotal = lines.reduce((sum, line) => sum + line.amount, 0);
  // Скидка только за оба формата сразу: это её единственное основание.
  const discount = lines.length > 1 ? Math.round((subtotal * bundleDiscount) / 100) * 100 : 0;

  const base = formats.includes('photo') ? photoHourPrice : videoHourPrice;

  return {
    lines,
    subtotal,
    discount,
    total: subtotal - discount,
    lastHourRate: hours > 0 ? Math.round(hourRate(base, hours, taper)) : null,
  };
}
