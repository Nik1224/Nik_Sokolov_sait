/**
 * Схема и валидация формы заявки (ТЗ §7, §13).
 *
 * Одна и та же проверка используется на клиенте (для быстрой подсказки) и на
 * сервере (как единственный настоящий барьер): клиентскую валидацию обойти
 * тривиально, поэтому серверная обязательна.
 */

import type { Direction } from '../site';

export type ContactFormValues = {
  direction: Direction;
  taskType: string;
  date: string;
  city: string;
  formats: string[];
  budget: string;
  message: string;
  name: string;
  email: string;
  phone: string;
  consent: boolean;
  /** Honeypot: настоящий пользователь это поле не видит и не заполняет. */
  company: string;
  sourceUrl: string;
  locale: string;
};

export type FieldErrors = Partial<Record<keyof ContactFormValues, string>>;

export type SubmitState =
  | { status: 'idle' }
  | { status: 'invalid'; errors: FieldErrors }
  | { status: 'error'; message: string }
  | { status: 'success' }
  /** Канал приёма заявок не подтверждён — форма честно об этом сообщает (§18). */
  | { status: 'disabled' };

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export function validateContact(
  values: Partial<ContactFormValues>,
  messages: { required: string; invalidEmail: string },
): FieldErrors {
  const errors: FieldErrors = {};

  if (!values.name?.trim()) errors.name = messages.required;
  if (!values.message?.trim()) errors.message = messages.required;
  if (!values.consent) errors.consent = messages.required;

  const email = values.email?.trim() ?? '';
  const phone = values.phone?.trim() ?? '';
  if (!email && !phone) {
    // Достаточно одного способа связи, но хотя бы один нужен.
    errors.email = messages.required;
  } else if (email && !EMAIL_PATTERN.test(email)) {
    errors.email = messages.invalidEmail;
  }

  return errors;
}

export function parseFormData(formData: FormData): Partial<ContactFormValues> {
  const get = (key: string) => (formData.get(key) as string | null)?.trim() ?? '';
  return {
    direction: get('direction') as Direction,
    taskType: get('taskType'),
    date: get('date'),
    city: get('city'),
    formats: formData.getAll('formats').map(String),
    budget: get('budget'),
    message: get('message'),
    name: get('name'),
    email: get('email'),
    phone: get('phone'),
    consent: formData.get('consent') === 'on',
    company: get('company'),
    sourceUrl: get('sourceUrl'),
    locale: get('locale'),
  };
}
