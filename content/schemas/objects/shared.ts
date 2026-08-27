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

export const processStep = defineType({
  name: 'processStep',
  title: 'Этап',
  type: 'object',
  fields: [
    defineField({
      name: 'title',
      title: 'Название',
      type: 'localeString',
      validation: (rule) => rule.required(),
    }),
    defineField({ name: 'body', title: 'Пояснение', type: 'localeText' }),
  ],
  preview: { select: { title: 'title.ru' } },
});

export const faqItem = defineType({
  name: 'faqItem',
  title: 'Вопрос',
  type: 'object',
  fields: [
    defineField({
      name: 'question',
      title: 'Вопрос',
      type: 'localeString',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'answer',
      title: 'Ответ',
      type: 'localeText',
      validation: (rule) => rule.required(),
    }),
  ],
  preview: { select: { title: 'question.ru' } },
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
