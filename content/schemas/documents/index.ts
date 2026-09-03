/**
 * Документы CMS (ТЗ §8).
 *
 * Валидация не даёт опубликовать запись без title, slug, направления,
 * обложки/постера, alt, SEO и правового статуса медиа (§8.1).
 */

import { defineField, defineType } from 'sanity';
import { requiredRu } from '../objects/locale';

const STATUS_OPTIONS = [
  { title: 'Черновик', value: 'draft' },
  { title: 'На проверке', value: 'review' },
  { title: 'Опубликовано', value: 'published' },
  { title: 'В архиве', value: 'archived' },
];

const DIRECTION_OPTIONS = [
  { title: 'PRIVATE', value: 'private' },
  { title: 'BUSINESS', value: 'business' },
  { title: 'PRODUCTION', value: 'production' },
];

const statusField = defineField({
  name: 'status',
  title: 'Статус',
  type: 'string',
  initialValue: 'draft',
  options: { list: STATUS_OPTIONS },
  validation: (rule) => rule.required(),
});

const demoField = defineField({
  name: 'isDemo',
  title: 'Demo-запись',
  description: 'Кандидат на замену реальным контентом. Такие записи не публикуются (§15.2).',
  type: 'boolean',
  initialValue: false,
});

/** Slug неизменяем после публикации без 301-редиректа (§6). */
const slugField = defineField({
  name: 'slug',
  title: 'Slug',
  description: 'Строчная латиница через дефис. После публикации менять только вместе с редиректом.',
  type: 'slug',
  options: { source: 'title.ru', maxLength: 96 },
  validation: (rule) => rule.required(),
});

const seoField = defineField({
  name: 'seo',
  title: 'SEO',
  type: 'seoFields',
  validation: (rule) =>
    rule.custom((value: { title?: { ru?: string } } | undefined, context) => {
      const doc = context.document as { status?: string } | undefined;
      if (doc?.status !== 'published') return true;
      return value?.title?.ru?.trim() ? true : 'Перед публикацией заполните SEO title';
    }),
});

export const globalSettings = defineType({
  name: 'globalSettings',
  title: 'Настройки сайта',
  type: 'document',
  fields: [
    defineField({ name: 'siteName', title: 'Название', type: 'string', validation: (rule) => rule.required() }),
    defineField({ name: 'descriptor', title: 'Дескриптор', type: 'localeString' }),
    defineField({
      name: 'showreel',
      title: 'Шоурил на стартовой странице',
      description: 'Постер обязателен — сторонний плеер грузится только по клику.',
      type: 'mediaAsset',
    }),
    defineField({
      name: 'location',
      title: 'География',
      description: 'Например: Москва / Весь мир.',
      type: 'localeString',
    }),
    defineField({ name: 'contacts', title: 'Контакты', type: 'array', of: [{ type: 'contactChannel' }] }),
    defineField({ name: 'socials', title: 'Соцсети', type: 'array', of: [{ type: 'socialLink' }] }),
    defineField({ name: 'legalLinks', title: 'Юридические ссылки', type: 'array', of: [{ type: 'linkItem' }] }),
    defineField({ name: 'defaultSeo', title: 'SEO по умолчанию', type: 'seoFields' }),
    defineField({
      name: 'analytics',
      title: 'Аналитика',
      type: 'object',
      fields: [
        defineField({ name: 'provider', title: 'Система', type: 'string' }),
        defineField({ name: 'id', title: 'Идентификатор', type: 'string' }),
      ],
    }),
    defineField({
      name: 'featureFlags',
      title: 'Флаги',
      type: 'object',
      fields: [
        defineField({
          name: 'privateExternalUrl',
          title: 'Внешняя платформа для Private',
          description: 'Пока часть Private живёт снаружи — переход будет явно обозначен (§5.2).',
          type: 'url',
        }),
      ],
    }),
  ],
  preview: { prepare: () => ({ title: 'Настройки сайта' }) },
});

export const direction = defineType({
  name: 'direction',
  title: 'Направление',
  type: 'document',
  fields: [
    defineField({
      name: 'key',
      title: 'Направление',
      type: 'string',
      options: { list: DIRECTION_OPTIONS },
      validation: (rule) => rule.required(),
    }),
    defineField({ name: 'title', title: 'Заголовок', type: 'localeString', validation: requiredRu }),
    defineField({ name: 'lead', title: 'Лид', type: 'localeText', validation: requiredRu }),
    defineField({
      name: 'gatewayDescription',
      title: 'Пояснение на START',
      description: 'Короткая фраза на стартовом экране (§5.1).',
      type: 'localeText',
      validation: requiredRu,
    }),
    defineField({ name: 'hero', title: 'Hero-медиа', type: 'mediaAsset' }),
    defineField({ name: 'gatewayMedia', title: 'Медиа карточки на START', type: 'mediaAsset' }),
    defineField({
      name: 'highlights',
      title: 'Что входит всегда',
      description: 'Короткие пункты для главной страницы направления.',
      type: 'array',
      of: [
        {
          type: 'object',
          fields: [
            { name: 'title', title: 'Заголовок', type: 'localeString' },
            { name: 'body', title: 'Пояснение', type: 'localeString' },
          ],
          preview: { select: { title: 'title.ru' } },
        },
      ],
    }),
    defineField({
      name: 'pricingGroups',
      title: 'Группы пакетов на странице стоимости',
      description: 'Раскрывающиеся разделы: «Свадебная фотосъёмка», «Портрет и семья» и так далее. Порядок здесь = порядок на странице.',
      type: 'array',
      of: [
        {
          type: 'object',
          fields: [
            { name: 'slug', title: 'Ключ', type: 'string' },
            { name: 'title', title: 'Название', type: 'localeString' },
            { name: 'description', title: 'Пояснение', type: 'localeString' },
          ],
          preview: { select: { title: 'title.ru', subtitle: 'slug' } },
        },
      ],
    }),
    defineField({
      name: 'navOrder',
      title: 'Порядок разделов в меню',
      description: 'Ключи разделов. Пусто — порядок по умолчанию.',
      type: 'array',
      of: [{ type: 'string' }],
    }),
    seoField,
    defineField({ name: 'order', title: 'Порядок', type: 'number', validation: (rule) => rule.required() }),
    demoField,
  ],
  preview: { select: { title: 'title.ru', subtitle: 'key' } },
});

export const album = defineType({
  name: 'album',
  title: 'Полная серия съёмки',
  description: 'Один день целиком. Сама галерея живёт на внешнем сервисе выдачи — здесь только карточка и ссылка.',
  type: 'document',
  fields: [
    defineField({ name: 'title', title: 'Кого снимали', type: 'localeString', validation: requiredRu }),
    slugField,
    defineField({
      name: 'direction',
      title: 'Направление',
      type: 'string',
      options: { list: DIRECTION_OPTIONS },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'url',
      title: 'Адрес онлайн-галереи',
      description: 'Открывается в новой вкладке.',
      type: 'url',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'categorySlug',
      title: 'Категория портфолио',
      description: 'Ключ категории. Заполнено — альбом показывается в её вкладке; пусто — только на странице полных серий.',
      type: 'string',
    }),
    defineField({ name: 'date', title: 'Дата съёмки', type: 'date' }),
    defineField({ name: 'location', title: 'Место', type: 'localeString' }),
    defineField({
      name: 'cover',
      title: 'Обложка',
      description: 'Кадр именно с этой съёмки. Без обложки карточка останется текстовой.',
      type: 'mediaAsset',
    }),
    defineField({ name: 'order', title: 'Порядок', type: 'number' }),
    demoField,
  ],
  preview: { select: { title: 'title.ru', subtitle: 'url', media: 'cover.image' } },
});

export const category = defineType({
  name: 'category',
  title: 'Категория съёмки',
  type: 'document',
  fields: [
    defineField({ name: 'title', title: 'Название', type: 'localeString', validation: requiredRu }),
    slugField,
    defineField({
      name: 'description',
      title: 'Что внутри',
      description: 'Одна строка: что человек увидит в этой категории. Пусто — плитка останется с одним названием.',
      type: 'localeText',
    }),
    defineField({
      name: 'directions',
      title: 'Направления',
      type: 'array',
      of: [{ type: 'string' }],
      options: { list: DIRECTION_OPTIONS },
      validation: (rule) => rule.required().min(1),
    }),
    defineField({
      name: 'fullSeries',
      title: 'Бывают полные серии',
      description: 'Включите, если у этой категории бывает полная выдача одной съёмки. На такие категории ведёт переход к альбомам.',
      type: 'boolean',
      initialValue: false,
    }),
    defineField({ name: 'order', title: 'Порядок', type: 'number' }),
    demoField,
  ],
  preview: { select: { title: 'title.ru' } },
});

export const articleType = defineType({
  name: 'articleType',
  title: 'Тип записи журнала',
  type: 'document',
  fields: [
    defineField({ name: 'title', title: 'Название', type: 'localeString', validation: requiredRu }),
    slugField,
    defineField({ name: 'order', title: 'Порядок', type: 'number' }),
    demoField,
  ],
  preview: { select: { title: 'title.ru' } },
});

export const workFormat = defineType({
  name: 'workFormat',
  title: 'Формат работы',
  type: 'document',
  fields: [
    defineField({ name: 'title', title: 'Название', type: 'localeString', validation: requiredRu }),
    slugField,
    defineField({ name: 'order', title: 'Порядок', type: 'number' }),
    demoField,
  ],
  preview: { select: { title: 'title.ru' } },
});

export const person = defineType({
  name: 'person',
  title: 'Человек / credit',
  type: 'document',
  fields: [
    defineField({ name: 'displayName', title: 'Имя', type: 'string', validation: (rule) => rule.required() }),
    defineField({ name: 'role', title: 'Роль', type: 'localeString', validation: requiredRu }),
    defineField({ name: 'url', title: 'Ссылка', type: 'url' }),
    defineField({
      name: 'visibility',
      title: 'Публикация',
      description: 'Публично показываем только с разрешения человека (§8).',
      type: 'string',
      initialValue: 'private',
      options: {
        list: [
          { title: 'Можно показывать публично', value: 'public' },
          { title: 'Не публиковать', value: 'private' },
        ],
      },
      validation: (rule) => rule.required(),
    }),
    demoField,
  ],
  preview: { select: { title: 'displayName', subtitle: 'role.ru' } },
});

export const project = defineType({
  name: 'project',
  title: 'Проект / кейс',
  type: 'document',
  fields: [
    defineField({ name: 'title', title: 'Название', type: 'localeString', validation: requiredRu }),
    slugField,
    statusField,
    defineField({
      name: 'directions',
      title: 'Направления',
      description: 'Работа может относиться к нескольким веткам.',
      type: 'array',
      of: [{ type: 'string' }],
      options: { list: DIRECTION_OPTIONS },
      validation: (rule) => rule.required().min(1),
    }),
    defineField({
      name: 'categories',
      title: 'Категории',
      type: 'array',
      of: [{ type: 'reference', to: [{ type: 'category' }] }],
    }),
    defineField({ name: 'year', title: 'Год', type: 'number', validation: (rule) => rule.required() }),
    defineField({
      name: 'client',
      title: 'Клиент',
      description: 'Указывать только подтверждённого клиента (§1.2).',
      type: 'string',
    }),
    defineField({ name: 'role', title: 'Роль Никиты', type: 'localeString' }),
    defineField({ name: 'lead', title: 'Лид', type: 'localeText' }),
    defineField({ name: 'challenge', title: 'Задача', type: 'localeBlocks' }),
    defineField({ name: 'solution', title: 'Решение', type: 'localeBlocks' }),
    defineField({
      name: 'result',
      title: 'Результат',
      description: 'Фактические метрики — только при наличии подтверждения (§5.5).',
      type: 'localeBlocks',
    }),
    defineField({
      name: 'figures',
      title: 'Цифры',
      description: 'Две-четыре подтверждённые цифры под обложкой. Пусто — блока не будет.',
      type: 'array',
      of: [{ type: 'projectFigure' }],
      validation: (rule) => rule.max(4),
    }),
    defineField({
      name: 'cover',
      title: 'Обложка',
      type: 'mediaAsset',
      validation: (rule) => rule.required(),
    }),
    defineField({ name: 'media', title: 'Медиа', type: 'array', of: [{ type: 'mediaAsset' }] }),
    defineField({
      name: 'formats',
      title: 'Форматы',
      type: 'array',
      of: [{ type: 'reference', to: [{ type: 'workFormat' }] }],
    }),
    defineField({ name: 'credits', title: 'Команда', type: 'array', of: [{ type: 'credit' }] }),
    defineField({ name: 'featured', title: 'В подборке Selected Work', type: 'boolean', initialValue: false }),
    seoField,
    defineField({ name: 'order', title: 'Порядок', type: 'number' }),
    demoField,
  ],
  preview: { select: { title: 'title.ru', subtitle: 'year', media: 'cover.image' } },
});

export const article = defineType({
  name: 'article',
  title: 'Запись журнала',
  type: 'document',
  description: 'Единая коллекция: одна запись может показываться в одной, двух или трёх ветках (§5.7).',
  fields: [
    defineField({ name: 'title', title: 'Заголовок', type: 'localeString', validation: requiredRu }),
    slugField,
    statusField,
    defineField({
      name: 'directions',
      title: 'Показывать в направлениях',
      type: 'array',
      of: [{ type: 'string' }],
      options: { list: DIRECTION_OPTIONS },
      validation: (rule) => rule.required().min(1),
    }),
    defineField({
      name: 'primaryDirection',
      title: 'Основное направление',
      description: 'Его адрес становится каноническим среди контекстных URL (§6).',
      type: 'string',
      options: { list: DIRECTION_OPTIONS },
      validation: (rule) =>
        rule.required().custom((value, context) => {
          const doc = context.document as { directions?: string[] } | undefined;
          if (value && doc?.directions && !doc.directions.includes(value as string)) {
            return 'Основное направление должно входить в список направлений';
          }
          return true;
        }),
    }),
    defineField({
      name: 'articleType',
      title: 'Тип записи',
      type: 'reference',
      to: [{ type: 'articleType' }],
      validation: (rule) => rule.required(),
    }),
    defineField({ name: 'excerpt', title: 'Краткое описание', type: 'localeText', validation: requiredRu }),
    defineField({ name: 'body', title: 'Текст', type: 'localeBlocks' }),
    defineField({ name: 'cover', title: 'Обложка', type: 'mediaAsset', validation: (rule) => rule.required() }),
    defineField({
      name: 'projects',
      title: 'Связанные проекты',
      description: 'Связь заполняется здесь. На странице проекта заметки появятся автоматически.',
      type: 'array',
      of: [{ type: 'reference', to: [{ type: 'project' }] }],
    }),
    defineField({ name: 'author', title: 'Автор', type: 'string' }),
    defineField({
      name: 'publishedAt',
      title: 'Дата публикации',
      type: 'date',
      validation: (rule) => rule.required(),
    }),
    seoField,
    defineField({ name: 'order', title: 'Порядок', type: 'number' }),
    demoField,
  ],
  preview: { select: { title: 'title.ru', subtitle: 'publishedAt', media: 'cover.image' } },
});

export const pricingEntry = defineType({
  name: 'pricingEntry',
  title: 'Условие стоимости',
  type: 'document',
  fields: [
    defineField({ name: 'title', title: 'Название', type: 'localeString', validation: requiredRu }),
    slugField,
    defineField({
      name: 'direction',
      title: 'Направление',
      type: 'string',
      options: { list: DIRECTION_OPTIONS },
      validation: (rule) => rule.required(),
    }),
    defineField({ name: 'description', title: 'Описание', type: 'localeText', validation: requiredRu }),
    defineField({
      name: 'groupSlug',
      title: 'Группа',
      description: 'Ключ группы из документа направления. Пусто — пакет попадёт в общий список.',
      type: 'string',
    }),
    defineField({
      name: 'format',
      title: 'Что снимаем',
      description: 'Если в группе есть пакеты разных форматов, на странице появится переключатель.',
      type: 'string',
      options: {
        list: [
          { title: 'Фото', value: 'photo' },
          { title: 'Видео', value: 'video' },
          { title: 'Фото и видео', value: 'both' },
        ],
        layout: 'radio',
      },
    }),
    defineField({
      name: 'kind',
      title: 'Тип',
      type: 'string',
      initialValue: 'package',
      options: {
        list: [
          { title: 'Пакет — отдельной карточкой', value: 'package' },
          { title: 'Дополнение — строкой в списке', value: 'extra' },
        ],
        layout: 'radio',
      },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'priceFrom',
      title: 'Цена «от»',
      description: 'Включите, если это нижняя граница, а не точная стоимость.',
      type: 'boolean',
      initialValue: false,
    }),
    defineField({
      name: 'price',
      title: 'Цена',
      description: 'Только подтверждённая цифра. Пусто — покажем «по запросу» (§5.8).',
      type: 'number',
    }),
    defineField({ name: 'currency', title: 'Валюта', type: 'string' }),
    defineField({ name: 'unit', title: 'Единица', type: 'localeString' }),
    defineField({
      name: 'includes',
      title: 'Что входит',
      description: 'Часы, количество фотографий, сроки, дополнения — по пункту на строку.',
      type: 'array',
      of: [{ type: 'localeString' }],
    }),
    defineField({ name: 'disclaimer', title: 'Примечание', type: 'localeText' }),
    defineField({ name: 'ctaLabel', title: 'Подпись кнопки', type: 'localeString' }),
    defineField({ name: 'order', title: 'Порядок', type: 'number' }),
    defineField({ name: 'active', title: 'Показывать', type: 'boolean', initialValue: true }),
    demoField,
  ],
  preview: { select: { title: 'title.ru', subtitle: 'direction' } },
});

export const page = defineType({
  name: 'page',
  title: 'Страница',
  type: 'document',
  fields: [
    defineField({
      name: 'pageType',
      title: 'Тип',
      type: 'string',
      options: {
        list: [
          { title: 'О себе', value: 'about' },
          { title: 'Стоимость', value: 'pricing' },
          { title: 'Контакты', value: 'contact' },
          { title: 'Произвольная', value: 'custom' },
        ],
      },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'direction',
      title: 'Направление',
      type: 'string',
      options: { list: DIRECTION_OPTIONS },
      validation: (rule) => rule.required(),
    }),
    defineField({ name: 'title', title: 'Заголовок', type: 'localeString', validation: requiredRu }),
    slugField,
    statusField,
    defineField({ name: 'lead', title: 'Лид', type: 'localeText' }),
    defineField({ name: 'body', title: 'Текст', type: 'localeBlocks' }),
    defineField({ name: 'hero', title: 'Hero-медиа', type: 'mediaAsset' }),
    seoField,
    defineField({ name: 'order', title: 'Порядок', type: 'number' }),
    demoField,
  ],
  preview: { select: { title: 'title.ru', subtitle: 'direction' } },
});

export const testimonial = defineType({
  name: 'testimonial',
  title: 'Отзыв',
  type: 'document',
  description: 'Публикуются только отзывы, которые клиент оставил публично (§5.2).',
  fields: [
    defineField({ name: 'author', title: 'Кто оставил', type: 'string', validation: (rule) => rule.required() }),
    defineField({ name: 'text', title: 'Текст', type: 'localeText', validation: requiredRu }),
    defineField({
      name: 'directions',
      title: 'Показывать в направлениях',
      type: 'array',
      of: [{ type: 'string' }],
      options: { list: DIRECTION_OPTIONS },
      validation: (rule) => rule.required().min(1),
    }),
    defineField({
      name: 'source',
      title: 'Источник',
      description: 'Где отзыв оставлен: страница отзывов, площадка, переписка.',
      type: 'string',
    }),
    defineField({ name: 'order', title: 'Порядок', type: 'number' }),
    demoField,
  ],
  preview: { select: { title: 'author', subtitle: 'text.ru' } },
});

export const redirect = defineType({
  name: 'redirect',
  title: 'Редирект',
  type: 'document',
  description: 'Старые и изменённые адреса (§6).',
  fields: [
    defineField({ name: 'from', title: 'Откуда', type: 'string', validation: (rule) => rule.required() }),
    defineField({ name: 'to', title: 'Куда', type: 'string', validation: (rule) => rule.required() }),
    defineField({
      name: 'code',
      title: 'Код',
      type: 'number',
      initialValue: 301,
      options: {
        list: [
          { title: '301 — постоянный', value: 301 },
          { title: '302 — временный', value: 302 },
        ],
      },
      validation: (rule) => rule.required(),
    }),
    defineField({ name: 'note', title: 'Примечание', type: 'string' }),
    defineField({ name: 'createdAt', title: 'Создан', type: 'datetime' }),
  ],
  preview: { select: { title: 'from', subtitle: 'to' } },
});
