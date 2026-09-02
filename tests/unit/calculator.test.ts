/**
 * Расчёт стоимости. Ошибка здесь — неверная цена, названная клиенту,
 * поэтому проверяются именно те цифры, которые назвал владелец.
 */

import { describe, expect, it } from 'vitest';
import { buildQuote, formatCost, hourRate, type TaperConfig } from '@/lib/pricing/calculator';

const PHOTO = 12000;
const VIDEO = 15000;
const WEDDING: TaperConfig = { fromHour: 3, toHour: 10, floorFactor: 19 / 24 };

describe('обычная съёмка: ставка не меняется', () => {
  it('час фото стоит 12 000, час видео — 15 000', () => {
    expect(hourRate(PHOTO, 1, null)).toBe(12000);
    expect(hourRate(VIDEO, 8, null)).toBe(15000);
  });

  it('стоимость просто умножается на часы', () => {
    expect(formatCost(PHOTO, 3, null)).toBe(36000);
    expect(formatCost(VIDEO, 2, null)).toBe(30000);
  });
});

describe('свадьба: с четвёртого часа ставка снижается', () => {
  it('первые три часа по базовой ставке', () => {
    for (const hour of [1, 2, 3]) expect(hourRate(PHOTO, hour, WEDDING)).toBe(12000);
    expect(formatCost(PHOTO, 3, WEDDING)).toBe(36000);
  });

  it('с четвёртого часа ставка падает', () => {
    expect(hourRate(PHOTO, 4, WEDDING)).toBeLessThan(12000);
    expect(hourRate(PHOTO, 5, WEDDING)).toBeLessThan(hourRate(PHOTO, 4, WEDDING));
  });

  // Условие владельца: десять часов фото стоят 110 000, а не 120 000.
  it('десять часов фото стоят ровно 110 000', () => {
    expect(formatCost(PHOTO, 10, WEDDING)).toBe(110000);
    expect(PHOTO * 10).toBe(120000);
  });

  it('ставка десятого часа — 9 500', () => {
    expect(hourRate(PHOTO, 10, WEDDING)).toBeCloseTo(9500, 6);
  });

  it('видео снижается в той же пропорции', () => {
    expect(formatCost(VIDEO, 10, WEDDING)).toBe(137500);
    expect(VIDEO * 10).toBe(150000);
  });

  it('после десятого часа ставка больше не падает', () => {
    const tenth = hourRate(PHOTO, 10, WEDDING);
    expect(hourRate(PHOTO, 12, WEDDING)).toBeCloseTo(tenth, 6);
    // Без нижней границы ставка ушла бы в минус на длинной съёмке.
    expect(hourRate(PHOTO, 40, WEDDING)).toBeGreaterThan(0);
  });
});

describe('скидка за фото и видео вместе', () => {
  it('десять процентов от общей суммы', () => {
    const quote = buildQuote({
      formats: ['photo', 'video'],
      hours: 2,
      photoHourPrice: PHOTO,
      videoHourPrice: VIDEO,
      taper: null,
      bundleDiscount: 0.1,
    });

    expect(quote.subtotal).toBe(24000 + 30000);
    expect(quote.discount).toBe(5400);
    expect(quote.total).toBe(48600);
  });

  it('на один формат скидки нет', () => {
    const quote = buildQuote({
      formats: ['photo'],
      hours: 2,
      photoHourPrice: PHOTO,
      videoHourPrice: VIDEO,
      taper: null,
      bundleDiscount: 0.1,
    });

    expect(quote.discount).toBe(0);
    expect(quote.total).toBe(24000);
  });

  it('свадьба с обоими форматами: снижение ставки и скидка вместе', () => {
    const quote = buildQuote({
      formats: ['photo', 'video'],
      hours: 10,
      photoHourPrice: PHOTO,
      videoHourPrice: VIDEO,
      taper: WEDDING,
      bundleDiscount: 0.1,
    });

    expect(quote.subtotal).toBe(110000 + 137500);
    expect(quote.total).toBe(247500 - 24800);
  });
});

describe('края', () => {
  it('без выбранных форматов сумма нулевая', () => {
    const quote = buildQuote({
      formats: [],
      hours: 5,
      photoHourPrice: PHOTO,
      videoHourPrice: VIDEO,
      taper: null,
      bundleDiscount: 0.1,
    });
    expect(quote.total).toBe(0);
    expect(quote.lines).toHaveLength(0);
  });

  it('суммы округляются до сотен: копейки в цене выглядят ошибкой', () => {
    for (const hours of [4, 5, 6, 7, 8, 9]) {
      expect(formatCost(PHOTO, hours, WEDDING) % 100).toBe(0);
      expect(formatCost(VIDEO, hours, WEDDING) % 100).toBe(0);
    }
  });
});

describe('последний час считается по всем выбранным форматам', () => {
  const quote = (formats: ('photo' | 'video')[], hours = 8) =>
    buildQuote({
      formats,
      hours,
      photoHourPrice: PHOTO,
      videoHourPrice: VIDEO,
      taper: WEDDING,
      bundleDiscount: 0.1,
    });

  it('одно фото — фотоставка восьмого часа', () => {
    expect(quote(['photo']).lastHourRate).toBe(Math.round(hourRate(PHOTO, 8, WEDDING)));
  });

  it('одно видео — видеоставка, а не фото', () => {
    expect(quote(['video']).lastHourRate).toBe(Math.round(hourRate(VIDEO, 8, WEDDING)));
  });

  /*
   * Главное, ради чего это заведено: раньше при обоих форматах бралась одна
   * фотоставка, и цифра под итогом была почти вдвое ниже настоящей.
   */
  it('фото и видео — обе ставки сразу, со скидкой за пару', () => {
    const both = quote(['photo', 'video']).lastHourRate!;
    const apart = hourRate(PHOTO, 8, WEDDING) + hourRate(VIDEO, 8, WEDDING);

    expect(both).toBe(Math.round(apart * 0.9));
    expect(both).toBeGreaterThan(quote(['photo']).lastHourRate!);
    expect(both).toBeGreaterThan(quote(['video']).lastHourRate!);
  });

  /*
   * Цифра обещает, во сколько обойдётся следующий час, — значит она обязана
   * сойтись с тем, на сколько от него вырастет итог.
   */
  it('совпадает с приростом итога от ещё одного часа', () => {
    for (const formats of [['photo'], ['video'], ['photo', 'video']] as const) {
      for (const hours of [5, 8, 9]) {
        const grew = quote([...formats], hours).total - quote([...formats], hours - 1).total;
        expect(Math.abs(grew - quote([...formats], hours).lastHourRate!), formats.join('+')).toBeLessThan(200);
      }
    }
  });

  it('без выбранных форматов цифры нет', () => {
    expect(quote([]).lastHourRate).toBeNull();
  });
});
