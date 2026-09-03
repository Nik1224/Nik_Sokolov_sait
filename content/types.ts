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
  /**
   * Заранее пережатые варианты для srcset. Sanity CDN режет картинки на лету,
   * а локальным файлам нужен готовый список — иначе телефон грузит кадр,
   * рассчитанный на полный экран.
   */
  sources?: { width: number; src: string }[];
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
  /**
   * Одна строка о том, что человек увидит внутри. Названия «Производство» мало:
   * оно не говорит, снимают там цех или рекламу про цех.
   *
   * Пусто — плитка остаётся с одним названием и не выглядит сломанной.
   */
  description?: LocaleString;
  directions: Direction[];
  /**
   * Портфолио категории: кадры, ролики и вертикальные видео. Живёт у категории,
   * а не у отдельной работы: человек приходит смотреть «свадьбы», а не
   * конкретную свадьбу.
   */
  gallery?: MediaAsset[];
  /**
   * Ролики и вертикальные видео категории. Лежат отдельно от кадров: на
   * странице это разные вкладки, и смешивать их в одну ленту нельзя — человек
   * приходит либо смотреть фотографии, либо смотреть видео.
   */
  videos?: MediaAsset[];
  reels?: MediaAsset[];
  /**
   * Короткая петля для наведения на плитку категории на Home. Не портфолио:
   * один кадр движения вместо статичной строки. Без неё плитка остаётся
   * текстовой и работает ровно так же.
   */
  preview?: MediaAsset;
  /**
   * Бывает ли у категории полная выдача одной съёмки. Определяет, где показывать
   * переход к альбомам: у портрета такой съёмки не бывает, у свадьбы бывает.
   */
  fullSeries?: boolean;
  /**
   * Бэкстейдж: как идёт работа на площадке. Не портфолио — там результат, а
   * здесь процесс, и он отвечает на другой вопрос: каково будет рядом с этим
   * фотографом весь день.
   *
   * Живёт у категории, как кадры и ролики, и держится правило «по одному
   * сильному ролику на категорию»: показать все — значит утопить каждый.
   * Пусто — блок не показывается, пустой раздел хуже отсутствующего.
   */
  backstage?: MediaAsset[];
  order?: number;
  isDemo?: boolean;
};

/**
 * Полная серия одной съёмки (ТЗ §5.2).
 *
 * Портфолио — лучшие кадры с разных свадеб; альбом — один день целиком.
 * Сами галереи живут на внешнем сервисе выдачи, поэтому у альбома есть адрес,
 * но нет собственной страницы: дублировать сотни кадров незачем.
 */
export type Album = {
  _id: string;
  slug: string;
  direction: Direction;
  /**
   * Категория портфолио, во вкладке которой показывать альбом. Без неё альбом
   * живёт только на странице полных серий.
   */
  categorySlug?: string;
  /** Кого снимали: обычно имена пары. */
  title: LocaleString;
  /** Дата съёмки в ISO. Показывается годом. */
  date?: string;
  location?: LocaleString;
  /** Адрес онлайн-галереи. Открывается в новой вкладке. */
  url: string;
  /** Обложка. Без неё карточка остаётся текстовой и не выглядит сломанной. */
  cover?: MediaAsset;
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

/**
 * Цифра кейса: крупное число и подпись под ним.
 *
 * Кейс читают по диагонали, и объём работы должен считываться раньше текста:
 * «18 роликов, 14,5 часа» человек видит за секунду, а три абзаца — нет.
 * Публикуются только подтверждённые числа (§5.5), как и всё в `result`.
 */
export type ProjectFigure = { value: LocaleString; label: LocaleString };

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
  /** Две-четыре цифры под обложкой. Пусто — блока нет. */
  figures?: ProjectFigure[];
  cover: MediaAsset;
  media: MediaAsset[];
  formatSlugs: string[];
  credits: Credit[];
  featured?: boolean;
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

/**
 * Группа пакетов на странице стоимости (ТЗ §5.8).
 *
 * Девять пакетов подряд читаются как свалка: человек ищет свадьбу, а листает
 * портреты и видео. Группы раскрываются на месте, без перехода на другую
 * страницу — выбор остаётся перед глазами.
 */
export type PricingGroup = {
  slug: string;
  title: LocaleString;
  /** Короткое пояснение под заголовком группы. */
  description?: LocaleString;
};

export type PricingEntry = {
  _id: string;
  slug: string;
  direction: Direction;
  /** К какой группе относится пакет. Пусто — покажется общим списком. */
  groupSlug?: string;
  /**
   * Что снимаем. Когда внутри группы форматов несколько, она показывает
   * переключатель: свадьба — это один выбор с тремя вариантами, а не три
   * разных места на странице.
   */
  format?: 'photo' | 'video' | 'both';
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
  };
};

/** Вариант съёмки в калькуляторе (ТЗ §5.8: правила расчёта). */
export type ShootTypeOption = {
  slug: string;
  title: LocaleString;
  /** Ниже этого времени съёмка не имеет смысла. */
  minHours: number;
  maxHours: number;
  defaultHours: number;
  /** Подсказка под ползунком: почему столько времени. */
  hint?: LocaleString;
  /**
   * Как назвать съёмку в первом сообщении мессенджера: в кнопках заголовок —
   * прилагательное («Свадебная»), а в предложении нужен оборот целиком.
   */
  messageTitle?: LocaleString;
  /** Свадебная тарификация: с четвёртого часа ставка снижается. */
  taper: boolean;
};

/**
 * Настройки калькулятора стоимости. Цифры живут в данных, а не в коде:
 * менять ставку владелец должен без разработчика (§8).
 */
export type CalculatorConfig = {
  photoHourPrice: number;
  videoHourPrice: number;
  currency: string;
  /** Скидка за фото и видео вместе, доля от 0 до 1. */
  bundleDiscount: number;
  taper: { fromHour: number; toHour: number; floorFactor: number };
  types: ShootTypeOption[];
  /** Оговорка под расчётом: он предварительный. */
  note?: LocaleString;
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
  /** Калькулятор стоимости. Есть не у всех направлений. */
  calculator?: CalculatorConfig;
  /** Группы пакетов на странице стоимости. Пусто — пакеты идут одним списком. */
  pricingGroups?: PricingGroup[];
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
