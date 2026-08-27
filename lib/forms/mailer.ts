/**
 * Доставка заявок на почту (ТЗ §13).
 *
 * Письмо содержит направление, адрес страницы-источника, язык и все введённые
 * поля. Адрес получателя и ключ доступа живут только в переменных окружения:
 * в репозиторий они не попадают.
 *
 * Отправка идёт через HTTP-API Resend — обычным `fetch`, без дополнительной
 * библиотеки и без SMTP-настроек.
 */

import type { ContactFormValues } from './contact';

const ENDPOINT = 'https://api.resend.com/emails';

export type SendResult = { ok: true } | { ok: false; reason: 'not-configured' | 'failed' };

/**
 * Режим «без реальной отправки» для автотестов и CI.
 * Весь путь заявки проходится целиком, но письмо не уходит — иначе каждый
 * прогон тестов засыпал бы владельца проверочными заявками.
 */
function isDryRun(): boolean {
  return process.env.CONTACT_DRY_RUN === '1';
}

/** Настроена ли отправка. Без ключа и получателя форма работать не должна. */
export function isMailerConfigured(): boolean {
  if (isDryRun()) return true;
  return Boolean(process.env.RESEND_API_KEY && process.env.CONTACT_RECIPIENT);
}

/** Значения из формы попадают в HTML — экранируем, чтобы не сломать письмо. */
function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

const DIRECTION_TITLES: Record<string, string> = {
  private: 'PRIVATE — частная съёмка',
  business: 'BUSINESS — компания или бренд',
  production: 'PRODUCTION — продакшен',
};

type Row = { label: string; value: string };

function buildRows(values: Partial<ContactFormValues>, origin: string): Row[] {
  const rows: Row[] = [
    { label: 'Направление', value: DIRECTION_TITLES[values.direction ?? ''] ?? values.direction ?? '—' },
    { label: 'Имя', value: values.name ?? '' },
    { label: 'Email', value: values.email ?? '' },
    { label: 'Телефон / мессенджер', value: values.phone ?? '' },
    { label: 'Тип задачи', value: values.taskType ?? '' },
    { label: 'Дата съёмки', value: values.date ?? '' },
    { label: 'Город', value: values.city ?? '' },
    { label: 'Форматы', value: (values.formats ?? []).join(', ') },
    { label: 'Бюджет', value: values.budget ?? '' },
    { label: 'Сообщение', value: values.message ?? '' },
    { label: 'Страница', value: origin + (values.sourceUrl ?? '') },
    { label: 'Язык страницы', value: values.locale === 'en' ? 'English' : 'Русский' },
  ];
  return rows.filter((row) => row.value.trim() !== '');
}

export async function sendContactEmail(
  values: Partial<ContactFormValues>,
  origin: string,
): Promise<SendResult> {
  if (!isMailerConfigured()) return { ok: false, reason: 'not-configured' };
  // Тестовый прогон: путь пройден, письмо намеренно не отправляется.
  if (isDryRun()) return { ok: true };

  const rows = buildRows(values, origin);
  const direction = DIRECTION_TITLES[values.direction ?? ''] ?? 'Сайт';
  const name = values.name?.trim() || 'без имени';

  const text = rows.map((row) => `${row.label}: ${row.value}`).join('\n');
  const html = `<table style="border-collapse:collapse;font-family:sans-serif;font-size:14px">
${rows
  .map(
    (row) =>
      `<tr><td style="padding:6px 16px 6px 0;color:#666;vertical-align:top">${escapeHtml(row.label)}</td>` +
      `<td style="padding:6px 0;white-space:pre-wrap">${escapeHtml(row.value)}</td></tr>`,
  )
  .join('\n')}
</table>`;

  try {
    const response = await fetch(ENDPOINT, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: process.env.CONTACT_SENDER || 'onboarding@resend.dev',
        to: [process.env.CONTACT_RECIPIENT],
        subject: `Заявка с сайта — ${direction} — ${name}`,
        text,
        html,
        // Ответ уходит прямо клиенту, а не в служебный ящик отправителя.
        reply_to: values.email?.trim() || undefined,
      }),
    });

    if (!response.ok) return { ok: false, reason: 'failed' };
    return { ok: true };
  } catch {
    // Сеть или сервис недоступны — говорим об этом честно и предлагаем повтор.
    return { ok: false, reason: 'failed' };
  }
}
