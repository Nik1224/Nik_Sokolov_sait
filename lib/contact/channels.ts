/**
 * Прямые каналы связи (ТЗ §5.8, §13).
 *
 * Заявка не уходит на почту и не ждёт ответа: человек нажимает «Связаться» и
 * попадает сразу в переписку в своём мессенджере. Текст первого сообщения
 * подставляется заранее — клиенту не нужно объяснять всё заново, а владелец
 * сразу видит, что человек считал на сайте.
 *
 * Здесь только сборка ссылок: чистая, без React и без обращений к браузеру,
 * поэтому её можно проверить тестами.
 */

import type { ContactChannel } from '@/content/types';

export type MessengerKind = 'telegram' | 'max' | 'whatsapp' | 'sms';

export type Messenger = {
  kind: MessengerKind;
  label: string;
  /** Что показать под названием: ник или номер. */
  value: string;
  href: string;
  /**
   * false — мессенджер не умеет открывать чат с готовым текстом. Такому каналу
   * интерфейс копирует сообщение в буфер, иначе человек начнёт с пустого чата.
   */
  prefills: boolean;
};

/**
 * Порядок вывода. Telegram первым — основной канал; SMS последним, это запасной
 * вариант для тех, у кого мессенджеров нет.
 */
const ORDER: MessengerKind[] = ['telegram', 'max', 'whatsapp', 'sms'];

/** Ссылка на профиль MAX — в данных это `other`, отличаем по домену. */
function isMax(channel: ContactChannel): boolean {
  return /(^|\.)max\.ru$/i.test(safeHost(channel.href));
}

function safeHost(value: string): string {
  try {
    return new URL(value).hostname;
  } catch {
    return '';
  }
}

/**
 * Текст в query. Собираем вручную: `URLSearchParams` кодирует пробел как `+`,
 * а мессенджеры показывают его буквально.
 */
function withText(base: string, text: string): string {
  if (!text) return base;
  return `${base}${base.includes('?') ? '&' : '?'}text=${encodeURIComponent(text)}`;
}

/**
 * SMS с готовым текстом. iOS ждёт `&body=`, все остальные — `?body=` по
 * RFC 5724; отдать одну форму обеим системам нельзя.
 */
export function smsHref(phoneHref: string, text: string, isIos: boolean): string {
  const number = phoneHref.replace(/^tel:/i, '').replace(/[^\d+]/g, '');
  if (!text) return `sms:${number}`;
  return `sms:${number}${isIos ? '&' : '?'}body=${encodeURIComponent(text)}`;
}

/**
 * Каналы для кнопки «Связаться». Отсутствующий контакт просто не появляется:
 * владелец управляет списком из CMS, а не через правку компонента.
 */
export function buildMessengers(
  contacts: ContactChannel[],
  message: string,
  isIos: boolean,
): Messenger[] {
  const phone = contacts.find((item) => item.kind === 'phone');

  const found = contacts.flatMap<Messenger>((contact) => {
    if (contact.kind === 'telegram') {
      return [
        {
          kind: 'telegram',
          label: contact.label,
          value: contact.value,
          href: withText(contact.href, message),
          prefills: true,
        },
      ];
    }

    if (contact.kind === 'whatsapp') {
      return [
        {
          kind: 'whatsapp',
          label: contact.label,
          value: contact.value,
          href: withText(contact.href, message),
          prefills: true,
        },
      ];
    }

    if (contact.kind === 'other' && isMax(contact)) {
      return [
        {
          kind: 'max',
          label: contact.label,
          value: contact.value,
          // MAX открывает профиль, но текст в ссылке не принимает.
          href: contact.href,
          prefills: false,
        },
      ];
    }

    return [];
  });

  if (phone) {
    found.push({
      kind: 'sms',
      label: 'SMS',
      value: phone.value,
      href: smsHref(phone.href, message, isIos),
      prefills: true,
    });
  }

  return found.sort((a, b) => ORDER.indexOf(a.kind) - ORDER.indexOf(b.kind));
}
