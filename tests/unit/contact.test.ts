/**
 * Ссылки в мессенджеры и заготовка первого сообщения.
 *
 * Проверяется то, что нельзя увидеть глазами: кодирование текста, различие
 * между iOS и остальными в схеме sms: и порядок каналов.
 */

import { describe, expect, it } from 'vitest';
import { buildMessengers, smsHref } from '@/lib/contact/channels';
import { contactMessage, quotedSubject } from '@/lib/contact/message';
import { directions, globalSettings } from '@/content/seed';
import { getDictionary } from '@/lib/i18n/dictionaries';
import type { ContactChannel } from '@/content/types';

const contacts = globalSettings.contacts;
const dict = getDictionary('ru');

describe('каналы связи', () => {
  it('собирает все четыре канала в заданном порядке', () => {
    const list = buildMessengers(contacts, '', false);
    expect(list.map((item) => item.kind)).toEqual(['telegram', 'max', 'whatsapp', 'sms']);
  });

  it('подставляет текст в Telegram и WhatsApp', () => {
    const [telegram, , whatsapp] = buildMessengers(contacts, 'Привет, мир', false);
    expect(telegram.href).toContain('?text=%D0%9F%D1%80%D0%B8%D0%B2%D0%B5%D1%82');
    expect(whatsapp.href).toContain('?text=');
    expect(telegram.prefills).toBe(true);
  });

  it('пробел кодируется как %20, а не как +', () => {
    // wa.me и Telegram показывают «+» буквально: сообщение приедет слипшимся.
    const [telegram] = buildMessengers(contacts, 'два слова', false);
    expect(telegram.href).toContain('%20');
    expect(telegram.href).not.toContain('+');
  });

  it('перенос строки переживает кодирование', () => {
    const [telegram] = buildMessengers(contacts, 'первая\nвторая', false);
    expect(telegram.href).toContain('%0A');
  });

  it('MAX помечен как канал без подстановки текста', () => {
    const max = buildMessengers(contacts, 'текст', false).find((item) => item.kind === 'max')!;
    expect(max.prefills).toBe(false);
    expect(max.href).not.toContain('text=');
  });

  it('не выдумывает каналы, которых нет в данных', () => {
    const only: ContactChannel[] = [
      { kind: 'telegram', label: 'Telegram', value: '@nick', href: 'https://t.me/nick' },
    ];
    expect(buildMessengers(only, '', false).map((item) => item.kind)).toEqual(['telegram']);
  });

  it('SMS разводит iOS и остальные системы', () => {
    // iOS не понимает `?body=`, а Android — `&body=`: одной формой не обойтись.
    expect(smsHref('tel:+79995550101', 'привет', true)).toContain('&body=');
    expect(smsHref('tel:+79995550101', 'привет', false)).toContain('?body=');
  });

  it('SMS без текста остаётся простой ссылкой на номер', () => {
    expect(smsHref('tel:+79995550101', '', false)).toBe('sms:+79995550101');
  });
});

describe('первое сообщение', () => {
  it('без темы — только приветствие', () => {
    expect(contactMessage({}, dict)).toBe(dict.contact.greeting);
  });

  it('собирает тип съёмки, форматы, часы и сумму', () => {
    const message = contactMessage(
      { subject: 'свадебная съёмка', details: ['фото и видео', '8 часов'], estimate: '219 000 ₽' },
      dict,
    );
    expect(message.split('\n')).toEqual([
      'Добрый день! Пишу с сайта.',
      'Интересует свадебная съёмка — фото и видео, 8 часов.',
      'Расчёт на сайте — 219 000 ₽.',
    ]);
  });

  it('тема без уточнений не оставляет висящего тире', () => {
    const message = contactMessage({ subject: quotedSubject('пакет', 'Полный день') }, dict);
    expect(message).toContain('Интересует пакет «Полный день».');
    expect(message).not.toContain('—');
  });

  it('у каждого типа съёмки есть оборот для сообщения', () => {
    // Заголовок кнопки — прилагательное («Свадебная»), в предложение оно не
    // встаёт. Без отдельного оборота сообщение получится корявым.
    const calculator = directions.find((item) => item.key === 'private')?.calculator;
    expect(calculator).toBeDefined();
    for (const type of calculator!.types) {
      expect(type.messageTitle?.ru, type.slug).toBeTruthy();
      expect(type.messageTitle?.en, type.slug).toBeTruthy();
    }
  });
});
