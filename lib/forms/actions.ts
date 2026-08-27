'use server';

/**
 * Приём заявки (ТЗ §13).
 *
 * Порядок: honeypot → серверная валидация → rate limit → отправка письма.
 * Пользователь всегда получает понятный статус: успех, ошибка с возможностью
 * повторить или сообщение о том, что приём заявок не подключён.
 *
 * В аналитику уходит только факт события и направление — ни имени, ни адреса,
 * ни текста сообщения (§12, §17).
 */

import { headers } from 'next/headers';
import { getGlobalSettings } from '@/content/queries';
import { getDictionary } from '../i18n/dictionaries';
import { isLocale, siteUrl } from '../site';
import { parseFormData, validateContact, type SubmitState } from './contact';
import { isMailerConfigured, sendContactEmail } from './mailer';

/**
 * Ограничение частоты в памяти процесса. Этого достаточно против случайного
 * потока; при нескольких экземплярах приложения счётчик нужно вынести в общее
 * хранилище.
 */
const attempts = new Map<string, number[]>();
const WINDOW_MS = 60_000;
const MAX_PER_WINDOW = 5;

function rateLimited(key: string): boolean {
  const now = Date.now();
  const recent = (attempts.get(key) ?? []).filter((time) => now - time < WINDOW_MS);
  recent.push(now);
  attempts.set(key, recent);
  return recent.length > MAX_PER_WINDOW;
}

/** Ключ ограничения — отправитель, а не направление: иначе один бот блокирует всех. */
async function clientKey(): Promise<string> {
  try {
    const store = await headers();
    const forwarded = store.get('x-forwarded-for');
    return forwarded?.split(',')[0]?.trim() || store.get('x-real-ip') || 'unknown';
  } catch {
    return 'unknown';
  }
}

export async function submitContact(
  _previous: SubmitState,
  formData: FormData,
): Promise<SubmitState> {
  const values = parseFormData(formData);
  const locale = isLocale(values.locale) ? values.locale : 'ru';
  const dict = getDictionary(locale);

  // Honeypot: заполненное скрытое поле — почти наверняка бот. Отвечаем как при
  // успехе, чтобы не подсказывать спамеру, что ловушка сработала.
  if (values.company) return { status: 'success' };

  const errors = validateContact(values, {
    required: dict.form.required,
    invalidEmail: dict.form.invalidEmail,
  });
  if (Object.keys(errors).length > 0) return { status: 'invalid', errors };

  if (rateLimited(await clientKey())) {
    return { status: 'error', message: dict.form.tooManyRequests };
  }

  const settings = await getGlobalSettings();
  // Два условия: выключатель в CMS и настроенная отправка. Пока нет любого из
  // них, форма честно предлагает прямые контакты, а не теряет заявку молча.
  if (!settings.featureFlags.contactFormEnabled || !isMailerConfigured()) {
    return { status: 'disabled' };
  }

  const result = await sendContactEmail(values, siteUrl());
  if (!result.ok) {
    return result.reason === 'not-configured'
      ? { status: 'disabled' }
      : { status: 'error', message: dict.form.deliveryFailed };
  }

  return { status: 'success' };
}
