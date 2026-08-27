/**
 * Медиа (ТЗ §8, §10).
 * Без alt, постера и правового статуса запись не публикуется (§8.1).
 */

import { defineField, defineType } from 'sanity';

export const mediaAsset = defineType({
  name: 'mediaAsset',
  title: 'Медиа',
  type: 'object',
  fields: [
    defineField({
      name: 'type',
      title: 'Тип',
      type: 'string',
      initialValue: 'image',
      options: {
        list: [
          { title: 'Изображение', value: 'image' },
          { title: 'Видео', value: 'video' },
        ],
        layout: 'radio',
      },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'image',
      title: 'Изображение',
      type: 'image',
      // hotspot даёт focal point: смысловой центр не обрезается (§10).
      options: { hotspot: true },
      hidden: ({ parent }) => parent?.type !== 'image',
      validation: (rule) =>
        rule.custom((value, context) => {
          const parent = context.parent as { type?: string } | undefined;
          if (parent?.type === 'image' && !value) return 'Загрузите изображение';
          return true;
        }),
    }),
    defineField({
      name: 'provider',
      title: 'Где размещено видео',
      type: 'string',
      options: {
        list: [
          { title: 'Kinescope', value: 'kinescope' },
          { title: 'YouTube', value: 'youtube' },
          { title: 'Vimeo', value: 'vimeo' },
          { title: 'Файл по прямой ссылке', value: 'file' },
        ],
      },
      hidden: ({ parent }) => parent?.type !== 'video',
    }),
    defineField({
      name: 'videoId',
      title: 'ID ролика у провайдера',
      type: 'string',
      hidden: ({ parent }) => parent?.type !== 'video' || parent?.provider === 'file',
    }),
    defineField({
      name: 'url',
      title: 'Прямая ссылка на файл',
      type: 'url',
      hidden: ({ parent }) => parent?.type !== 'video' || parent?.provider !== 'file',
    }),
    defineField({
      name: 'poster',
      title: 'Постер',
      description: 'Обязателен для любого видео: без него страница «прыгает» при загрузке.',
      type: 'image',
      options: { hotspot: true },
      hidden: ({ parent }) => parent?.type !== 'video',
      validation: (rule) =>
        rule.custom((value, context) => {
          const parent = context.parent as { type?: string } | undefined;
          if (parent?.type === 'video' && !value) return 'Постер обязателен для видео';
          return true;
        }),
    }),
    defineField({
      name: 'loopSrc',
      title: 'Файл петли для фона',
      description:
        'Короткий ролик без звука для фонового воспроизведения. Полный ролик сюда класть нельзя — он слишком тяжёлый.',
      type: 'url',
      hidden: ({ parent }) => parent?.type !== 'video',
    }),
    defineField({
      name: 'durationSeconds',
      title: 'Длительность, сек',
      type: 'number',
      hidden: ({ parent }) => parent?.type !== 'video',
    }),
    defineField({
      name: 'decorative',
      title: 'Декоративное изображение',
      description: 'Не несёт смысла — ассистивные технологии его пропустят. Alt тогда не нужен.',
      type: 'boolean',
      initialValue: false,
    }),
    defineField({
      name: 'alt',
      title: 'Alt-текст',
      type: 'localeString',
      hidden: ({ parent }) => parent?.decorative === true,
      validation: (rule) =>
        rule.custom((value: { ru?: string } | undefined, context) => {
          const parent = context.parent as { decorative?: boolean } | undefined;
          if (parent?.decorative) return true;
          return value?.ru?.trim() ? true : 'Опишите, что на изображении';
        }),
    }),
    defineField({ name: 'caption', title: 'Подпись', type: 'localeString' }),
    defineField({ name: 'credit', title: 'Авторство / credit', type: 'string' }),
    defineField({
      name: 'rights',
      title: 'Правовой статус',
      description: 'Материал с неподтверждёнными правами публиковать нельзя (§9).',
      type: 'string',
      initialValue: 'pending',
      options: {
        list: [
          { title: 'Права мои', value: 'owned' },
          { title: 'Лицензия получена', value: 'licensed' },
          { title: 'Согласовано с клиентом', value: 'client-approved' },
          { title: 'Права не подтверждены', value: 'pending' },
        ],
      },
      validation: (rule) => rule.required(),
    }),
  ],
  preview: {
    select: { title: 'alt.ru', media: 'image', type: 'type', rights: 'rights' },
    prepare({ title, media, type, rights }) {
      return {
        title: title || (type === 'video' ? 'Видео' : 'Изображение'),
        subtitle: rights === 'pending' ? '⚠ права не подтверждены' : undefined,
        media,
      };
    },
  },
});
