/** Общие объекты: SEO, credits, этапы, FAQ, контакты (ТЗ §7, §8). */

import { defineField, defineType } from 'sanity';

export const seoFields = defineType({
  name: 'seoFields',
  title: 'SEO',
  type: 'object',
  options: { collapsible: true, collapsed: true },
  fields: [
    defineField({ name: 'title', title: 'Title', type: 'localeString' }),
    defineField({ name: 'description', title: 'Description', type: 'localeText' }),
    defineField({ name: 'ogImage', title: 'Изображение для соцсетей', type: 'image' }),
    defineField({
      name: 'noIndex',
      title: 'Закрыть от индексации',
      type: 'boolean',
      initialValue: false,
    }),
  ],
});

export const credit = defineType({
  name: 'credit',
  title: 'Credit',
  type: 'object',
  fields: [
    defineField({
      name: 'person',
      title: 'Человек',
      type: 'reference',
      to: [{ type: 'person' }],
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'role',
      title: 'Роль в этом проекте',
      description: 'Если отличается от роли по умолчанию.',
      type: 'localeString',
    }),
  ],
});

export const contactChannel = defineType({
  name: 'contactChannel',
  title: 'Контакт',
  type: 'object',
  fields: [
    defineField({
      name: 'kind',
      title: 'Тип',
      type: 'string',
      options: {
        list: [
          { title: 'Email', value: 'email' },
          { title: 'Телефон', value: 'phone' },
          { title: 'Telegram', value: 'telegram' },
          { title: 'WhatsApp', value: 'whatsapp' },
          { title: 'Другое', value: 'other' },
        ],
      },
      validation: (rule) => rule.required(),
    }),
    defineField({ name: 'label', title: 'Подпись', type: 'string', validation: (rule) => rule.required() }),
    defineField({ name: 'value', title: 'Значение', type: 'string', validation: (rule) => rule.required() }),
    defineField({
      name: 'href',
      title: 'Ссылка',
      description: 'mailto:, tel:, https://t.me/… — контакт должен быть кликабельным (§5.8).',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
  ],
  preview: { select: { title: 'label', subtitle: 'value' } },
});

export const linkItem = defineType({
  name: 'linkItem',
  title: 'Ссылка',
  type: 'object',
  fields: [
    defineField({ name: 'label', title: 'Подпись', type: 'localeString' }),
    defineField({ name: 'href', title: 'URL', type: 'string', validation: (rule) => rule.required() }),
  ],
});

export const socialLink = defineType({
  name: 'socialLink',
  title: 'Соцсеть',
  type: 'object',
  fields: [
    defineField({ name: 'label', title: 'Название', type: 'string', validation: (rule) => rule.required() }),
    defineField({ name: 'href', title: 'URL', type: 'url', validation: (rule) => rule.required() }),
  ],
});

/**
 * Цифра кейса: крупное число и подпись под ним. Значение — строкой, а не
 * числом: «14,5 часа» и «3 дня» числом не запишешь, а формат в разных языках
 * разный.
 */
export const projectFigure = defineType({
  name: 'projectFigure',
  title: 'Цифра',
  type: 'object',
  fields: [
    defineField({
      name: 'value',
      title: 'Число',
      description: 'Коротко: «18», «14,5 часа», «3 дня».',
      type: 'localeString',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'label',
      title: 'Подпись',
      description: 'Что это за число: «роликов», «материала», «дня съёмки».',
      type: 'localeString',
      validation: (rule) => rule.required(),
    }),
  ],
  preview: { select: { title: 'value.ru', subtitle: 'label.ru' } },
});
