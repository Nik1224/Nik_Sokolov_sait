/**
 * Заготовка первого сообщения (ТЗ §5.8).
 *
 * Человек уходит в мессенджер с уже написанным текстом: он не пересказывает то,
 * что только что выбрал на сайте, а владелец сразу видит тип съёмки, объём и ту
 * сумму, которую клиент посчитал. Разговор начинается с одного и того же числа
 * с обеих сторон.
 *
 * Без React и без браузера — проверяется тестами.
 */

import type { Dictionary } from '@/lib/i18n/dictionaries';

export type MessageDraft = {
  /** Что интересует: «свадьба», «пакет „Полный день“», «услуга „Съёмка для бренда“». */
  subject?: string;
  /** Уточнения к теме: форматы, длительность. */
  details?: string[];
  /** Итог калькулятора, уже с валютой. */
  estimate?: string;
};

/**
 * Разные строки, а не одна длинная: в чате такое сообщение читается сразу, без
 * вычитывания. Пустые части выпадают — «Интересует» без темы не появится.
 */
export function contactMessage(draft: MessageDraft, dict: Dictionary): string {
  const lines = [dict.contact.greeting];

  if (draft.subject) {
    const details = (draft.details ?? []).filter(Boolean).join(', ');
    lines.push(
      details
        ? `${dict.contact.subjectPrefix} ${draft.subject} — ${details}.`
        : `${dict.contact.subjectPrefix} ${draft.subject}.`,
    );
  }

  if (draft.estimate) {
    lines.push(`${dict.contact.estimatePrefix} ${draft.estimate}.`);
  }

  return lines.join('\n');
}

/** Название пакета или услуги в кавычках: «пакет „Полный день“». */
export function quotedSubject(word: string, title: string): string {
  return `${word} «${title}»`;
}
