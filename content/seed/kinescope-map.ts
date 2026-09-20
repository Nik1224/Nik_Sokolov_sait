/**
 * Проекты Kinescope → категории сайта.
 *
 * В кабинете владельца ролики уже разложены по проектам, и эта раскладка —
 * источник правды. Таблица ниже только называет, во вкладку какой категории
 * попадает проект, и какой подписью описывать ролик.
 *
 * Названия роликов у сервиса рабочие («Kollekciya_2025_Gotov», «Rolik_11.09.24»)
 * и на сайт не идут — ни в alt, ни в подпись. Поэтому описание берётся из
 * категории: оно говорит, что человек увидит, и не выносит наружу имена файлов.
 */

/** Ролики и вертикальные нарезки живут в разных вкладках категории. */
export type KinescopeBucket = 'videos' | 'reels';

export type KinescopeCategoryRule = {
  /** slug категории из `categories` в content/seed/index.ts. */
  categorySlug: string;
  /** Описание горизонтального ролика. */
  video: { ru: string; en: string };
  /** Описание вертикального. Опущено — вертикальные из проекта не берутся. */
  reel?: { ru: string; en: string };
};

/**
 * Проекты, которых здесь нет, в контент не попадают: скрипт и тест о таких
 * сообщают отдельно. Молчаливый пропуск хуже — ролик просто не появился бы на
 * сайте, и понять почему было бы нельзя.
 *
 * Личные проекты владельца («Свадьба моя», «Макс Терских», «Евгений Терешин»)
 * не выгружаются вовсе: их отсекает scripts/kinescope-catalog.mjs.
 */
export const KINESCOPE_CATEGORIES: Record<string, KinescopeCategoryRule> = {
  Wedding: {
    categorySlug: 'wedding',
    video: { ru: 'Свадебный фильм', en: 'Wedding film' },
    reel: { ru: 'Вертикальный ролик со свадьбы', en: 'Vertical wedding reel' },
  },
  Предметка: {
    categorySlug: 'product',
    video: { ru: 'Предметный ролик', en: 'Product film' },
    reel: { ru: 'Вертикальный предметный ролик', en: 'Vertical product reel' },
  },
  Разговорные: {
    categorySlug: 'podcast',
    video: { ru: 'Выпуск разговорного формата', en: 'Conversation format episode' },
    reel: { ru: 'Вертикальная нарезка выпуска', en: 'Vertical cutdown of an episode' },
  },
  'Заводы, стройки, производства': {
    categorySlug: 'manufacturing',
    video: { ru: 'Ролик о производстве', en: 'Film about a production site' },
    reel: { ru: 'Вертикальный ролик с производства', en: 'Vertical reel from a production site' },
  },
  'Инструкции, применения': {
    categorySlug: 'education',
    video: { ru: 'Обучающий ролик', en: 'Training video' },
    reel: { ru: 'Вертикальный обучающий ролик', en: 'Vertical training video' },
  },
  Ивенты: {
    categorySlug: 'conference',
    video: { ru: 'Съёмка события', en: 'Event coverage' },
    reel: { ru: 'Вертикальный ролик с события', en: 'Vertical reel from an event' },
  },
  'Выставки Конференции': {
    categorySlug: 'conference',
    video: { ru: 'Съёмка конференции', en: 'Conference coverage' },
    reel: { ru: 'Вертикальный ролик с конференции', en: 'Vertical reel from a conference' },
  },
  'Имидж Реклама': {
    categorySlug: 'brand-video',
    video: { ru: 'Имиджевый ролик', en: 'Brand film' },
    reel: { ru: 'Вертикальный имиджевый ролик', en: 'Vertical brand reel' },
  },
  'Обзорные видео низко бюджетная реклама': {
    categorySlug: 'commercial',
    video: { ru: 'Обзорный рекламный ролик', en: 'Product overview commercial' },
    reel: { ru: 'Вертикальный рекламный ролик', en: 'Vertical commercial' },
  },
  'Музыкальные Клипы': {
    categorySlug: 'narrative',
    video: { ru: 'Музыкальный клип', en: 'Music video' },
    reel: { ru: 'Вертикальный музыкальный ролик', en: 'Vertical music reel' },
  },
  'Авто-Мото': {
    categorySlug: 'auto-moto',
    video: { ru: 'Ролик об автомобиле', en: 'Car film' },
    reel: { ru: 'Вертикальный ролик об автомобиле', en: 'Vertical car reel' },
  },
  /*
   * Бэкстейдж здесь — услуга: владельца зовут снять чужую съёмку. Не путать с
   * полем `backstage` у категории: там процесс его собственной работы, и такие
   * ролики лежат в content/seed/backstage.ts, подобранные руками.
   */
  Бэкстэйдж: {
    categorySlug: 'backstage',
    video: { ru: 'Бэкстейдж со съёмки', en: 'Backstage from a shoot' },
    reel: { ru: 'Вертикальный бэкстейдж со съёмки', en: 'Vertical backstage from a shoot' },
  },
};

/**
 * Проекты, которые владелец решил не показывать на сайте. Не «ещё не
 * разобрали», а осознанный выбор: спрашивать про них второй раз незачем.
 *
 * Reels и Reels_NIk — склад вертикальных нарезок вперемешку по темам. На сайте
 * вертикальные ролики и так лежат во вкладке каждой категории, рядом со своей
 * съёмкой; отдельная свалка из сорока штук без темы ничего не добавляет.
 */
export const KINESCOPE_NOT_PUBLISHED: ReadonlySet<string> = new Set(['Reels', 'Reels_NIk']);

/**
 * Ролики, уже подобранные руками в других файлах сида: свадебные фильмы и
 * вертикальные нарезки, бэкстейдж, имиджевые ролики, шоурил и клип в кейсе.
 *
 * У них постер вырезан из самого ролика по выбранному кадру, а не взят у
 * сервиса, и подпись написана по содержанию. Брать их ещё раз из каталога
 * значило бы показать тот же ролик дважды и с худшим превью.
 *
 * Список сверяется тестом: тот же ролик не должен попасть в контент дважды.
 */
export const KINESCOPE_HAND_PICKED: ReadonlySet<string> = new Set([
  '14mu754Y3HsJT5joauAKA9', // Бэки Команда
  '38inADPAsNhSBNLv774U9W', // Wedding
  '4iDyL7xFCANnaqByzQhxLa', // Ивенты
  '53w1M3dzAk7dSk2oQHJnEy', // Wedding
  '5j2CWcjbWFdPBp5K6QaQMS', // Ивенты
  '5urNZffxy1yg3bLqsLVBCt', // Бэки Команда
  '8bMnbkTukg4yh35p9QL6qx', // Wedding
  'ahUBooxgkdJ4ErDvQihLCC', // Ивенты
  'aifU2KpMeJAf9vXzfqbhgi', // Wedding
  'ceHqKdkqTh5gGPptNtBa6U', // Имидж Реклама
  'cfm4pTrBLBzJP3XqSayWEQ', // Имидж Реклама
  'dSK6QkqpEZJt7vHY6rCgpD', // Все видео
  'eGyh5aFZCBhj6Ya68UorpC', // Wedding
  'eK6GgHZkhYPWNaYgSqtMSP', // Бэки Команда
  'hQzwXmQNCiaRh9xJpnNpfU', // Бэки Команда
  'icVNyHgNDnZYjHSupUrDeq', // Бэки Команда
  'jX7w3a7b269XtyjKgt5VNT', // Wedding
  'jizgobNaz2jMrtU6wikjpp', // Wedding
  'kn5YEzcPbf2gkVE12u2TEc', // Wedding
  'mKiZ8ZbErKc6kswXJCRzPm', // Wedding
  'nymKFh14h466KSStHx8zYW', // Reels
  'pbyqjbsBD4ZDoCKHnLo5p8', // Имидж Реклама
  'q1Nqzrb866bwinP244wnME', // Wedding
  'rGZYpW7Ecp4tA9VG7CVpkz', // Разговорные
  'sTJ8ZwUMyRCRHaK1wQbkWn', // Имидж Реклама
  'sU9QuGgccRh5yysNzzMQMF', // Имидж Реклама
  'vBpqgC8PkUDdCfLTJMfP9S', // Бэки Команда
  'vmasDNGbABxrUXtrdvx4Nf', // Wedding
  'vmwXTC6jWn8NLNGFbZLguY', // Ивенты
  'vnwY2VdShteAtyRA61MCur', // Wedding
  'vuQoTtijGp6zkrBYKkRtYa', // Бэки Команда
]);
