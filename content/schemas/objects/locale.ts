/**
 * Локализация на уровне поля (ТЗ §8.1).
 * Локализуются тексты; числа, даты, медиа и связи остаются общими полями.
 */

import { defineField, defineType, type Rule } from 'sanity';

/** Русский обязателен: это язык-источник контента (§4.1). */
export function requiredRu(rule: Rule) {
  return rule.custom((value: { ru?: string } | undefined) =>
    value?.ru?.trim() ? true : 'Заполните русскую версию — это язык-источник',
  );
}

export const localeString = defineType({
  name: 'localeString',
  title: 'Строка (RU / EN)',
  type: 'object',
  options: { columns: 2 },
  fields: [
    defineField({ name: 'ru', title: 'Русский', type: 'string' }),
    defineField({ name: 'en', title: 'English', type: 'string' }),
  ],
});

export const localeText = defineType({
  name: 'localeText',
  title: 'Текст (RU / EN)',
  type: 'object',
  fields: [
    defineField({ name: 'ru', title: 'Русский', type: 'text', rows: 3 }),
    defineField({ name: 'en', title: 'English', type: 'text', rows: 3 }),
  ],
});

const blockArray = [
  {
    type: 'block',
    styles: [
      { title: 'Абзац', value: 'normal' },
      { title: 'Подзаголовок', value: 'h2' },
      { title: 'Подзаголовок меньше', value: 'h3' },
      { title: 'Цитата', value: 'blockquote' },
    ],
    lists: [
      { title: 'Маркированный', value: 'bullet' },
      { title: 'Нумерованный', value: 'number' },
    ],
    marks: {
      decorators: [
        { title: 'Полужирный', value: 'strong' },
        { title: 'Курсив', value: 'em' },
      ],
      annotations: [
        {
          name: 'link',
          type: 'object',
          title: 'Ссылка',
          fields: [{ name: 'href', type: 'url', title: 'URL' }],
        },
      ],
    },
  },
  { type: 'mediaAsset' },
];

export const localeBlocks = defineType({
  name: 'localeBlocks',
  title: 'Текст блоками (RU / EN)',
  type: 'object',
  fields: [
    defineField({ name: 'ru', title: 'Русский', type: 'array', of: blockArray }),
    defineField({ name: 'en', title: 'English', type: 'array', of: blockArray }),
  ],
});
