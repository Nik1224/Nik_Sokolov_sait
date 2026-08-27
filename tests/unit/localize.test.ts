/**
 * Единый режим отсутствующего перевода (§4.1, §18): показываем русскую версию
 * с видимой меткой. Проверяем именно это поведение, а не детали реализации.
 */

import { describe, expect, it } from 'vitest';
import {
  formatDate,
  hasTranslation,
  localizedString,
  pageNeedsFallbackNotice,
  resolveLocalized,
} from '@/lib/i18n/localize';

describe('локализованные поля', () => {
  it('отдаёт запрошенный язык, когда перевод есть', () => {
    const result = resolveLocalized({ ru: 'Съёмка', en: 'Shoot' }, 'en');
    expect(result).toEqual({ value: 'Shoot', isFallback: false });
  });

  it('откатывается на русский и помечает это', () => {
    const result = resolveLocalized({ ru: 'Съёмка' }, 'en');
    expect(result).toEqual({ value: 'Съёмка', isFallback: true });
  });

  it('считает пустую строку отсутствующим переводом', () => {
    expect(resolveLocalized({ ru: 'Съёмка', en: '   ' }, 'en')).toEqual({
      value: 'Съёмка',
      isFallback: true,
    });
  });

  it('на русском откат невозможен', () => {
    expect(resolveLocalized({ en: 'Shoot' }, 'ru')).toEqual({ value: null, isFallback: false });
  });

  it('пустой массив блоков считается отсутствующим переводом', () => {
    expect(resolveLocalized({ ru: [{ x: 1 }], en: [] }, 'en').isFallback).toBe(true);
  });
});

describe('метка «только на русском»', () => {
  it('не показывается на русской версии', () => {
    expect(pageNeedsFallbackNotice([{ ru: 'Съёмка' }], 'ru')).toBe(false);
  });

  it('показывается, когда хотя бы одно основное поле без перевода', () => {
    expect(pageNeedsFallbackNotice([{ ru: 'A', en: 'A' }, { ru: 'B' }], 'en')).toBe(true);
  });

  it('не показывается при полном переводе', () => {
    expect(pageNeedsFallbackNotice([{ ru: 'A', en: 'A' }, { ru: 'B', en: 'B' }], 'en')).toBe(false);
  });
});

describe('вспомогательные функции', () => {
  it('hasTranslation различает собственный перевод и откат', () => {
    expect(hasTranslation({ ru: 'A' }, 'en')).toBe(false);
    expect(hasTranslation({ ru: 'A', en: 'B' }, 'en')).toBe(true);
  });

  it('localizedString не возвращает null', () => {
    expect(localizedString(undefined, 'ru')).toBe('');
    expect(localizedString(undefined, 'ru', '—')).toBe('—');
  });

  it('дата форматируется по языку страницы', () => {
    expect(formatDate('2025-11-12', 'ru')).toContain('2025');
    expect(formatDate('2025-11-12', 'en')).toContain('November');
    expect(formatDate('не дата', 'ru')).toBe('');
  });
});
