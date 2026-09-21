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
  /**
   * Ролики, которые владелец попросил поставить в начало, — по videoId и в
   * этом порядке. Остальные идут следом, свежие впереди. Своего порядка у
   * роликов в Kinescope нет, поэтому он записан здесь.
   */
  first?: string[];
};

/**
 * Ключи — названия проектов в кабинете как есть, с приставкой ветки. Владелец
 * разложил ролики по проектам и назвал их так же, как категории на сайте;
 * сайт эту раскладку повторяет.
 *
 * Проекты, которых здесь нет, в контент не попадают: скрипт и тест о таких
 * сообщают отдельно. Молчаливый пропуск хуже — ролик просто не появился бы на
 * сайте, и понять почему было бы нельзя.
 *
 * Личные проекты владельца («Свадьба моя», «Макс Терских», «Евгений Терешин»)
 * и «Архив» не выгружаются вовсе: их отсекает scripts/kinescope-catalog.mjs.
 */
export const KINESCOPE_CATEGORIES: Record<string, KinescopeCategoryRule> = {
  'Private · Свадьбы': {
    categorySlug: 'wedding',
    video: { ru: 'Свадебный фильм', en: 'Wedding film' },
    reel: { ru: 'Вертикальный ролик со свадьбы', en: 'Vertical wedding reel' },
  },
  /*
   * Проект называется «Частные события», но внутри дни рождения и крестины —
   * детские праздники. На сайте они в категории детских событий: у категории
   * «Частные события» по замыслу только альбомы, без роликов и вкладок.
   */
  'Private · Частные события': {
    categorySlug: 'kids',
    video: { ru: 'Съёмка детского праздника', en: "Filmed at a child's party" },
    reel: { ru: 'Вертикальный ролик с детского праздника', en: "Vertical reel from a child's party" },
  },
  'Private · Школьные': {
    categorySlug: 'school',
    video: { ru: 'Школьная съёмка', en: 'School film' },
    reel: { ru: 'Вертикальный ролик со школьной съёмки', en: 'Vertical reel from a school shoot' },
  },
  'Business · Обучающие ролики и подкасты': {
    categorySlug: 'education',
    video: { ru: 'Обучающий ролик или выпуск подкаста', en: 'Training video or podcast episode' },
    reel: { ru: 'Вертикальный обучающий ролик', en: 'Vertical training video' },
  },
  'Business · Производство': {
    categorySlug: 'manufacturing',
    video: { ru: 'Ролик о производстве', en: 'Film about a production site' },
    reel: { ru: 'Вертикальный ролик с производства', en: 'Vertical reel from a production site' },
  },
  'Business · Реклама и имиджевое видео': {
    categorySlug: 'commercial',
    video: { ru: 'Рекламный или имиджевый ролик', en: 'Commercial or brand film' },
    reel: { ru: 'Вертикальный рекламный ролик', en: 'Vertical commercial' },
  },
  'Business · Предметная съёмка': {
    categorySlug: 'product',
    video: { ru: 'Предметный ролик', en: 'Product film' },
    reel: { ru: 'Вертикальный предметный ролик', en: 'Vertical product reel' },
  },
  'Business · События и конференции': {
    categorySlug: 'conference',
    video: { ru: 'Съёмка события', en: 'Event coverage' },
    reel: { ru: 'Вертикальный ролик с события', en: 'Vertical reel from an event' },
  },
  'Business · Детейлинг и тюнинг': {
    categorySlug: 'auto-moto',
    video: { ru: 'Ролик о детейлинге', en: 'Detailing film' },
    reel: { ru: 'Вертикальный ролик о детейлинге', en: 'Vertical detailing reel' },
  },
  /*
   * Бэкстейдж здесь — услуга: владельца зовут снять чужую съёмку. Не путать с
   * полем `backstage` у категории: там процесс его собственной работы, и такие
   * ролики лежат в content/seed/backstage.ts, подобранные руками.
   */
  'Business · Бэкстейдж': {
    categorySlug: 'backstage',
    video: { ru: 'Бэкстейдж со съёмки', en: 'Backstage from a shoot' },
    reel: { ru: 'Вертикальный бэкстейдж со съёмки', en: 'Vertical backstage from a shoot' },
  },
  'Business · Спорт и танцы': {
    categorySlug: 'sport',
    video: { ru: 'Съёмка спорта или танца', en: 'Sport or dance film' },
    reel: { ru: 'Вертикальный ролик со спортивной съёмки', en: 'Vertical reel from a sports shoot' },
  },
  'Business · Еда и кухня': {
    categorySlug: 'food',
    video: { ru: 'Ролик о еде', en: 'Food film' },
    reel: { ru: 'Вертикальный ролик о еде', en: 'Vertical food reel' },
  },
  'Business · Медицина': {
    categorySlug: 'medical',
    video: { ru: 'Съёмка в клинике', en: 'Filmed at a clinic' },
    reel: { ru: 'Вертикальный ролик из клиники', en: 'Vertical reel from a clinic' },
    // «Авеню»: сначала фильм о поликлинике, за ним ролик о приёме.
    first: ['rs7uKfPPDPFw8zM1AF6aUv', 'shc5Eat7TdmzGVhcBHSG5P'],
  },
  'Production · Музыкальные клипы': {
    categorySlug: 'music-video',
    video: { ru: 'Музыкальный клип', en: 'Music video' },
    reel: { ru: 'Вертикальный музыкальный ролик', en: 'Vertical music reel' },
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
  '14mu754Y3HsJT5joauAKA9', // Архив
  '38inADPAsNhSBNLv774U9W', // Private · Свадьбы
  '4iDyL7xFCANnaqByzQhxLa', // Business · События и конференции
  '53w1M3dzAk7dSk2oQHJnEy', // Private · Свадьбы
  '5j2CWcjbWFdPBp5K6QaQMS', // Business · События и конференции
  '5urNZffxy1yg3bLqsLVBCt', // Архив
  '8bMnbkTukg4yh35p9QL6qx', // Private · Свадьбы
  'ahUBooxgkdJ4ErDvQihLCC', // Business · События и конференции
  'aifU2KpMeJAf9vXzfqbhgi', // Private · Свадьбы
  'ceHqKdkqTh5gGPptNtBa6U', // Business · Реклама и имиджевое видео
  'cfm4pTrBLBzJP3XqSayWEQ', // Business · Реклама и имиджевое видео
  'dSK6QkqpEZJt7vHY6rCgpD', // Архив
  'eGyh5aFZCBhj6Ya68UorpC', // Private · Свадьбы
  'eK6GgHZkhYPWNaYgSqtMSP', // Архив
  'hQzwXmQNCiaRh9xJpnNpfU', // Архив
  'icVNyHgNDnZYjHSupUrDeq', // Архив
  'jX7w3a7b269XtyjKgt5VNT', // Private · Свадьбы
  'jizgobNaz2jMrtU6wikjpp', // Private · Свадьбы
  'kn5YEzcPbf2gkVE12u2TEc', // Private · Свадьбы
  'mKiZ8ZbErKc6kswXJCRzPm', // Private · Свадьбы
  'nymKFh14h466KSStHx8zYW', // Reels
  'pbyqjbsBD4ZDoCKHnLo5p8', // Business · Реклама и имиджевое видео
  'q1Nqzrb866bwinP244wnME', // Private · Свадьбы
  'rGZYpW7Ecp4tA9VG7CVpkz', // Business · Обучающие ролики и подкасты
  'sTJ8ZwUMyRCRHaK1wQbkWn', // Business · Реклама и имиджевое видео
  'sU9QuGgccRh5yysNzzMQMF', // Business · Реклама и имиджевое видео
  'vBpqgC8PkUDdCfLTJMfP9S', // Архив
  'vmasDNGbABxrUXtrdvx4Nf', // Private · Свадьбы
  'vmwXTC6jWn8NLNGFbZLguY', // Business · События и конференции
  'vnwY2VdShteAtyRA61MCur', // Private · Свадьбы
  'vuQoTtijGp6zkrBYKkRtYa', // Архив
]);
