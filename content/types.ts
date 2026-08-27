/**
 * Модели контента (ТЗ §8).
 *
 * Эти типы — единый контракт между CMS-схемами, слоем доступа к данным и
 * страницами. Компоненты не знают, откуда пришли данные: из Sanity или из
 * фикстур. Добавление записи не требует нового шаблона (§8, ключевое требование).
 */

import type { PortableTextBlock } from '@portabletext/types';
import type { LocaleField } from '@/lib/i18n/localize';
import type { Direction } from '@/lib/site';

export type { LocaleField };

/** Минимальный набор статусов (§8.1). Публично видно только `published`. */
export type ContentStatus = 'draft' | 'review' | 'published' | 'archived';

/**
 * Правовой статус медиа (§8.1: без него публикация невозможна).
 * `pending` означает «права не подтверждены» — такие записи не публикуются.
 */
export type MediaRights = 'owned' | 'licensed' | 'client-approved' | 'pending';

export type Blocks = PortableTextBlock[];
export type LocaleBlocks = LocaleField<Blocks>;
export type LocaleString = LocaleField<string>;

/** Точка кадрирования 0..1 — сохраняет смысловой центр при любом соотношении. */
export type FocalPoint = { x: number; y: number };

export type ImageRef = {
  src: string;
  /** Размеры обязательны: без них появляется CLS (§10, §17). */
  width: number;
  height: number;
  /** Крошечная превью-заглушка, чтобы не мигало пустым местом. */
  lqip?: string;
  focalPoint?: FocalPoint;
};

export type VideoProvider = 'kinescope' | 'youtube' | 'vimeo' | 'file';

type MediaCommon = {
  _key: string;
  /** Пустая строка = декоративное изображение (§11). */
  alt: LocaleString;
  caption?: LocaleString;
  credit?: string;
  rights: MediaRights;
};

export type MediaAsset =
  | (MediaCommon & { type: 'image'; image: ImageRef })
  | (MediaCommon & {
      type: 'video';
      provider: VideoProvider;
      /** id ролика у стороннего провайдера либо прямой URL для `file`. */
      videoId?: string;
      url?: string;
      /** Постер обязателен всегда (§10). */
      poster: ImageRef;
      /**
       * Облегчённая петля для фонового воспроизведения: короткая, без звука,
       * с нашего домена. Полный ролик для фона не годится — он весит слишком
       * много и грузился бы при каждом открытии страницы.
       */
      loopSrc?: string;
      durationSeconds?: number;
    });

export type SeoFields = {
  title?: LocaleString;
  description?: LocaleString;
  ogImage?: ImageRef;
  noIndex?: boolean;
};

type BaseDoc = {
  _id: string;
  slug: string;
  status: ContentStatus;
  seo?: SeoFields;
  order?: number;
  /** Явная пометка seed-записи (§15.2). В production такие записи не публикуются. */
  isDemo?: boolean;
};

/** Редактируемый справочник: категории съёмки и типы проектов (§5.2). */
export type Category = {
  _id: string;
  slug: string;
  title: LocaleString;
  directions: Direction[];
  order?: number;
  isDemo?: boolean;
};

/** Редактируемый справочник типов записей журнала (§5.7). */
export type ArticleType = {
  _id: string;
  slug: string;
  title: LocaleString;
  order?: number;
  isDemo?: boolean;
};

/** Форматы работы: «Фото / Видео / Фото + Видео / Команда» (§5.3). */
export type WorkFormat = {
  _id: string;
  slug: string;
  title: LocaleString;
  order?: number;
  isDemo?: boolean;
};

/** Человек в credits. `visibility` защищает от публикации без разрешения (§8). */
export type Person = {
  _id: string;
  displayName: string;
  role: LocaleString;
  url?: string;
  visibility: 'public' | 'private';
  isDemo?: boolean;
};

export type Credit = { person: Person; role?: LocaleString };

export type Project = BaseDoc & {
  title: LocaleString;
  /** Одна работа может принадлежать нескольким веткам. */
  directions: Direction[];
  categorySlugs: string[];
  year: number;
  /** Только подтверждённый клиент; иначе поле пустое (§1.2). */
  client?: string;
  role?: LocaleString;
  lead?: LocaleString;
  challenge?: LocaleBlocks;
  solution?: LocaleBlocks;
  /** Метрики показываем только при наличии подтверждения (§5.5). */
  result?: LocaleBlocks;
  cover: MediaAsset;
  media: MediaAsset[];
  serviceSlugs: string[];
  formatSlugs: string[];
  credits: Credit[];
  featured?: boolean;
};

export type ProcessStep = { title: LocaleString; body?: LocaleString };
export type FaqItem = { question: LocaleString; answer: LocaleString };

export type Service = BaseDoc & {
  direction: 'business';
  title: LocaleString;
  /** Короткое обещание результата (§5.4). */
  summary: LocaleString;
  body?: LocaleBlocks;
  deliverables: LocaleString[];
  formatSlugs: string[];
  process: ProcessStep[];
  faq: FaqItem[];
  hero?: MediaAsset;
  gallery: MediaAsset[];
  /** Ссылка на условия расчёта, а не выдуманная цена. */
  pricingSlug?: string;
  leadTime?: LocaleString;
};

export type Article = BaseDoc & {
  title: LocaleString;
  /** Одна запись CMS показывается в одной, двух или трёх ветках (§5.7). */
  directions: Direction[];
  /** Задаёт canonical среди контекстных URL (§6). */
  primaryDirection: Direction;
  typeSlug: string;
  excerpt: LocaleString;
  body: LocaleBlocks;
  cover: MediaAsset;
  /** Источник истины связи project ↔ article; обратная сторона — запросом. */
  projectSlugs: string[];
  author?: string;
  publishedAt: string;
};

export type PricingEntry = {
  _id: string;
  slug: string;
  direction: Direction;
  /** Пакет показывается карточкой, дополнение — строкой в общем списке. */
  kind: 'package' | 'extra';
  title: LocaleString;
  description: LocaleString;
  /** Цены только подтверждённые. Пусто → «по запросу» (§5.8). */
  price?: number;
  currency?: string;
  /** true — цена нижняя граница («от»), false — фиксированная за пакет. */
  priceFrom?: boolean;
  unit?: LocaleString;
  /** Что входит в пакет: часы, число фотографий, сроки, дополнения. */
  includes: LocaleString[];
  disclaimer?: LocaleString;
  ctaLabel?: LocaleString;
  order?: number;
  active: boolean;
  isDemo?: boolean;
};

export type ContactChannel = {
  kind: 'email' | 'phone' | 'telegram' | 'whatsapp' | 'other';
  label: string;
  value: string;
  href: string;
};

export type SocialLink = { label: string; href: string };

/**
 * Отзыв клиента (ТЗ §5.2: «отзывы только подтверждённые»).
 * Публикуется лишь то, что клиент оставил публично и разрешил показывать.
 */
export type Testimonial = {
  _id: string;
  author: string;
  text: LocaleString;
  directions: Direction[];
  /** Откуда отзыв: страница отзывов, площадка, переписка. */
  source?: string;
  order?: number;
  isDemo?: boolean;
};

export type GlobalSettings = {
  siteName: string;
  /** Шоурил на START. Один на весь сайт, поэтому живёт в настройках (§8). */
  showreel?: MediaAsset;
  descriptor: LocaleString;
  /** География работы: показывается в контактах и футере (§5.8). */
  location?: LocaleString;
  contacts: ContactChannel[];
  socials: SocialLink[];
  legalLinks: { label: LocaleString; href: string }[];
  defaultSeo: SeoFields;
  /** Подключается на этапе 5, с учётом согласия (§12, §18). */
  analytics?: { provider?: string; id?: string };
  featureFlags: {
    /** Пока Private частично живёт на внешней платформе (§5.2). */
    privateExternalUrl?: string;
    /** Транспорт заявок не подключён до подтверждения получателя (§18). */
    contactFormEnabled: boolean;
  };
};

export type DirectionDoc = {
  _id: string;
  key: Direction;
  title: LocaleString;
  lead: LocaleString;
  /** Пояснение направления на START (§5.1). */
  gatewayDescription: LocaleString;
  hero?: MediaAsset;
  gatewayMedia?: MediaAsset;
  /** Что входит в работу всегда: короткие пункты для Home (§5.2). */
  highlights: { title: LocaleString; body?: LocaleString }[];
  /** Порядок и состав пунктов меню; подписи берутся из словаря интерфейса. */
  navOrder?: string[];
  seo?: SeoFields;
  order: number;
  isDemo?: boolean;
};

/** Модульная страница: About, Pricing и прочие текстовые страницы (§8). */
export type Page = BaseDoc & {
  pageType: 'about' | 'pricing' | 'contact' | 'custom';
  direction: Direction;
  title: LocaleString;
  lead?: LocaleString;
  body?: LocaleBlocks;
  hero?: MediaAsset;
};

export type Redirect = {
  _id: string;
  from: string;
  to: string;
  code: 301 | 302;
  note?: string;
  createdAt: string;
};
