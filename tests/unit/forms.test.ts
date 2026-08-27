/**
 * Форма заявки (ТЗ §13).
 *
 * Клиентскую проверку обойти тривиально, поэтому вся ответственность на
 * серверной валидации — её и тестируем.
 */

import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { parseFormData, validateContact } from '@/lib/forms/contact';
import { isMailerConfigured, sendContactEmail } from '@/lib/forms/mailer';

const messages = { required: 'Обязательное поле', invalidEmail: 'Проверьте адрес' };

describe('валидация заявки', () => {
  it('требует имя, сообщение и согласие на обработку данных', () => {
    const errors = validateContact({}, messages);
    expect(errors.name).toBe(messages.required);
    expect(errors.message).toBe(messages.required);
    expect(errors.consent).toBe(messages.required);
  });

  it('требует хотя бы один способ связи', () => {
    const errors = validateContact(
      { name: 'Аня', message: 'Здравствуйте', consent: true },
      messages,
    );
    expect(errors.email).toBe(messages.required);
  });

  it('телефона достаточно — почта необязательна', () => {
    const errors = validateContact(
      { name: 'Аня', message: 'Здравствуйте', consent: true, phone: '+7 900 000 00 00' },
      messages,
    );
    expect(errors).toEqual({});
  });

  it('ловит испорченный адрес почты', () => {
    const errors = validateContact(
      { name: 'Аня', message: 'Здравствуйте', consent: true, email: 'аня@' },
      messages,
    );
    expect(errors.email).toBe(messages.invalidEmail);
  });

  it('пропускает корректно заполненную форму', () => {
    const errors = validateContact(
      { name: 'Аня', message: 'Нужна съёмка', consent: true, email: 'anya@example.com' },
      messages,
    );
    expect(errors).toEqual({});
  });
});

describe('чтение формы', () => {
  it('собирает все поля, включая множественный выбор форматов', () => {
    const data = new FormData();
    data.set('name', '  Аня  ');
    data.set('email', 'anya@example.com');
    data.set('direction', 'private');
    data.set('consent', 'on');
    data.append('formats', 'photo');
    data.append('formats', 'video');

    const values = parseFormData(data);
    expect(values.name).toBe('Аня');
    expect(values.consent).toBe(true);
    expect(values.formats).toEqual(['photo', 'video']);
  });

  it('без галочки согласия consent остаётся false', () => {
    const data = new FormData();
    data.set('name', 'Аня');
    expect(parseFormData(data).consent).toBe(false);
  });
});

describe('отправка письма', () => {
  const saved = { key: process.env.RESEND_API_KEY, to: process.env.CONTACT_RECIPIENT };

  beforeEach(() => {
    delete process.env.RESEND_API_KEY;
    delete process.env.CONTACT_RECIPIENT;
  });

  afterEach(() => {
    if (saved.key) process.env.RESEND_API_KEY = saved.key;
    if (saved.to) process.env.CONTACT_RECIPIENT = saved.to;
  });

  it('без ключа и получателя отправка считается ненастроенной', async () => {
    expect(isMailerConfigured()).toBe(false);
    const result = await sendContactEmail({ name: 'Аня' }, 'https://example.com');
    expect(result).toEqual({ ok: false, reason: 'not-configured' });
  });

  it('одного лишь получателя без ключа недостаточно', () => {
    process.env.CONTACT_RECIPIENT = 'test@example.com';
    expect(isMailerConfigured()).toBe(false);
  });

  it('при обоих значениях отправка считается настроенной', () => {
    process.env.CONTACT_RECIPIENT = 'test@example.com';
    process.env.RESEND_API_KEY = 're_test';
    expect(isMailerConfigured()).toBe(true);
  });
});

describe('обработка заявки целиком', () => {
  const saved = {
    key: process.env.RESEND_API_KEY,
    to: process.env.CONTACT_RECIPIENT,
    fetch: globalThis.fetch,
  };

  function validForm(): FormData {
    const data = new FormData();
    data.set('direction', 'private');
    data.set('locale', 'ru');
    data.set('name', 'Аня');
    data.set('email', 'anya@example.com');
    data.set('message', 'Нужна съёмка');
    data.set('consent', 'on');
    data.set('sourceUrl', '/ru/private/contact');
    return data;
  }

  afterEach(() => {
    globalThis.fetch = saved.fetch;
    if (saved.key) process.env.RESEND_API_KEY = saved.key;
    else delete process.env.RESEND_API_KEY;
    if (saved.to) process.env.CONTACT_RECIPIENT = saved.to;
    else delete process.env.CONTACT_RECIPIENT;
  });

  it('незаполненная форма не уходит и возвращает ошибки полей', async () => {
    const { submitContact } = await import('@/lib/forms/actions');
    const result = await submitContact({ status: 'idle' }, new FormData());
    expect(result.status).toBe('invalid');
  });

  it('заполненная ловушка выглядит как успех, но письмо не отправляется', async () => {
    let called = false;
    globalThis.fetch = (async () => {
      called = true;
      return new Response('{}', { status: 200 });
    }) as typeof fetch;

    const data = validForm();
    data.set('company', 'спам-бот');

    const { submitContact } = await import('@/lib/forms/actions');
    const result = await submitContact({ status: 'idle' }, data);

    expect(result.status).toBe('success');
    expect(called).toBe(false);
  });

  it('без ключа отправки форма честно сообщает, что приём не подключён', async () => {
    delete process.env.RESEND_API_KEY;
    const { submitContact } = await import('@/lib/forms/actions');
    const result = await submitContact({ status: 'idle' }, validForm());
    expect(result.status).toBe('disabled');
  });

  it('при настроенной отправке письмо уходит получателю', async () => {
    process.env.RESEND_API_KEY = 're_test';
    process.env.CONTACT_RECIPIENT = 'owner@example.com';

    let payload: Record<string, unknown> = {};
    globalThis.fetch = (async (_url: string, init: RequestInit) => {
      payload = JSON.parse(String(init.body));
      return new Response('{"id":"1"}', { status: 200 });
    }) as unknown as typeof fetch;

    const { submitContact } = await import('@/lib/forms/actions');
    const result = await submitContact({ status: 'idle' }, validForm());

    expect(result.status).toBe('success');
    expect(payload.to).toEqual(['owner@example.com']);
    // Ответ уходит клиенту напрямую.
    expect(payload.reply_to).toBe('anya@example.com');
    // В письме есть направление, сообщение и страница-источник (§13).
    expect(String(payload.text)).toContain('PRIVATE');
    expect(String(payload.text)).toContain('Нужна съёмка');
    expect(String(payload.text)).toContain('/ru/private/contact');
  });

  it('сбой отправки не выдаётся за успех', async () => {
    process.env.RESEND_API_KEY = 're_test';
    process.env.CONTACT_RECIPIENT = 'owner@example.com';
    globalThis.fetch = (async () => new Response('nope', { status: 500 })) as typeof fetch;

    const { submitContact } = await import('@/lib/forms/actions');
    const result = await submitContact({ status: 'idle' }, validForm());
    expect(result.status).toBe('error');
  });
});

describe('режим без реальной отправки', () => {
  const saved = { dry: process.env.CONTACT_DRY_RUN, fetch: globalThis.fetch };

  afterEach(() => {
    globalThis.fetch = saved.fetch;
    if (saved.dry) process.env.CONTACT_DRY_RUN = saved.dry;
    else delete process.env.CONTACT_DRY_RUN;
  });

  it('путь проходится до конца, но письмо не уходит', async () => {
    process.env.CONTACT_DRY_RUN = '1';
    let called = false;
    globalThis.fetch = (async () => {
      called = true;
      return new Response('{}', { status: 200 });
    }) as typeof fetch;

    const result = await sendContactEmail({ name: 'Аня' }, 'https://example.com');
    expect(result).toEqual({ ok: true });
    expect(called).toBe(false);
  });
});
