/**
 * Seed-данные: demo / migration candidates (ТЗ §15.2).
 *
 * Здесь НЕТ подтверждённых фактов: ни клиентов, ни цен, ни ролей, ни отзывов.
 * Всё помечено `isDemo: true` и служит только для проверки шаблонов и сеток.
 * Реальный контент заводится в CMS на этапе 4.
 */

import type {
  Article,
  ArticleType,
  Category,
  DirectionDoc,
  GlobalSettings,
  Page,
  Person,
  PricingEntry,
  Project,
  Redirect,
  Service,
  WorkFormat,
} from '../types';
import { bodyRu, bodyRuEn, decorative, image, video } from './helpers';

const demo = { isDemo: true, status: 'published' } as const;

export const globalSettings: GlobalSettings = {
  siteName: 'Nikita Sokolov',
  descriptor: { ru: 'Photo / Video / Visual Production', en: 'Photo / Video / Visual Production' },
  location: { ru: 'Москва / Санкт-Петербург', en: 'Moscow / St. Petersburg' },

  // Настоящий шоурил, подтверждён владельцем. Постер лежит локально: если
  // тянуть его с CDN Kinescope, браузер посетителя свяжется со сторонним
  // сервисом ещё до нажатия «play», и отложенная загрузка теряет смысл (§7, §10).
  showreel: {
    _key: 'showreel',
    type: 'video',
    provider: 'kinescope',
    videoId: 'dSK6QkqpEZJt7vHY6rCgpD',
    poster: { src: '/media/showreel-poster.jpg', width: 1920, height: 1080 },
    // Петля 40 с без звука, 2,4 МБ. Полный ролик — 146 с и 104 МБ: фоном такое
    // грузить нельзя. Постер вырезан из первого кадра петли, поэтому старт
    // видео не даёт скачка картинки.
    loopSrc: '/media/showreel-loop.mp4',
    durationSeconds: 146,
    alt: { ru: 'Шоурил Никиты Соколова', en: 'Nikita Sokolov showreel' },
    rights: 'owned',
  },

  // Контакты подтверждены владельцем и взяты с lokos.pro/contacts.
  // Электронной почты на источнике нет — до неё приём заявок формой выключен.
  contacts: [
    {
      kind: 'phone',
      label: 'Телефон',
      value: '+7 989 527 70 70',
      href: 'tel:+79895277070',
    },
    {
      kind: 'telegram',
      label: 'Telegram',
      value: '@Nik_Sokolov_pro',
      href: 'https://t.me/Nik_Sokolov_pro',
    },
    {
      kind: 'whatsapp',
      label: 'WhatsApp',
      value: '+7 989 527 70 70',
      href: 'https://wa.me/79895277070',
    },
    {
      kind: 'other',
      label: 'MAX',
      value: 'Никита Соколов',
      href: 'https://max.ru/u/f9LHodD0cOKBHjeB8uWKsh7BaGMKcGKyv76u2uT01F7z5U09WaniuE6C4ug',
    },
  ],

  socials: [
    { label: 'VK — Lokos.pro', href: 'https://vk.ru/lokospro' },
    { label: 'VK — Никита Соколов', href: 'https://vk.ru/nik_sokolov_pro' },
    { label: 'Instagram — Lokos.pro', href: 'https://instagram.com/lokos.pro_' },
    { label: 'Instagram — Никита Соколов', href: 'https://www.instagram.com/nik_sokolov_' },
    { label: 'Pinterest', href: 'https://pin.it/9MkJLGC' },
  ],

  // Ссылки ведут на действующие документы lokos.pro. При переезде на новый
  // домен их нужно перенести и заменить адреса (§13, §18).
  legalLinks: [
    { label: { ru: 'Пользовательское соглашение', en: 'Terms of service' }, href: 'https://lokos.pro/legal-terms' },
    { label: { ru: 'Политика конфиденциальности', en: 'Privacy policy' }, href: 'https://lokos.pro/legal-privacy' },
  ],
  defaultSeo: {
    title: { ru: 'Nikita Sokolov — фото, видео, визуальное производство', en: 'Nikita Sokolov — photo, video, visual production' },
    description: {
      ru: 'Фотограф и видеограф: частные съёмки, работа с компаниями и брендами, участие в профессиональных продакшенах.',
      en: 'Photographer and videographer: private shoots, work with companies and brands, professional production credits.',
    },
  },
  // Получатель заявок подтверждён владельцем. Реальная отправка включится,
  // как только в окружении появятся RESEND_API_KEY и CONTACT_RECIPIENT.
  featureFlags: { contactFormEnabled: true },
};

export const directions: DirectionDoc[] = [
  {
    _id: 'direction.private',
    key: 'private',
    order: 1,
    isDemo: true,
    title: { ru: 'Частные съёмки', en: 'Private shoots' },
    lead: {
      ru: 'Свадьбы, портрет, семья, love story и частные события — съёмка, за которой остаётся история, а не набор кадров.',
      en: 'Weddings, portraits, family, love stories and private events — photography that keeps the story, not just the frames.',
    },
    gatewayDescription: {
      ru: 'Личные съёмки: свадьбы, портрет, семья, love story.',
      en: 'Personal shoots: weddings, portraits, family, love stories.',
    },
    hero: decorative('hero-private', 'wide', 2),
    // Вертикальная петля 16 с без звука, 1,8 МБ. Играет только в раскрытой
    // карточке и подключается при первом наведении. Водяной знак Instagram
    // в кадре оставлен намеренно — по решению владельца.
    gatewayMedia: {
      _key: 'gw-private',
      type: 'video',
      provider: 'file',
      poster: { src: '/media/private-poster.jpg', width: 720, height: 1280 },
      loopSrc: '/media/private-loop.mp4',
      alt: { ru: 'Кадр из частной съёмки', en: 'Frame from a private shoot' },
      rights: 'owned',
    },
  },
  {
    _id: 'direction.business',
    key: 'business',
    order: 2,
    isDemo: true,
    title: { ru: 'Фото и видео для компаний и брендов', en: 'Photo and video for companies and brands' },
    lead: {
      ru: 'Конференции, интервью, имиджевые и рекламные съёмки, контент для соцсетей. Один подрядчик или собранная под задачу команда.',
      en: 'Conferences, interviews, brand and advertising shoots, social content. One contractor or a team assembled for the task.',
    },
    gatewayDescription: {
      ru: 'Задачи компаний: события, интервью, бренд, реклама, контент.',
      en: 'Business needs: events, interviews, brand, advertising, content.',
    },
    hero: decorative('hero-business', 'wide', 3),
    gatewayMedia: decorative('gw-business', 'tall', 3),
  },
  {
    _id: 'direction.production',
    key: 'production',
    order: 3,
    isDemo: true,
    title: { ru: 'Nikita Sokolov', en: 'Nikita Sokolov' },
    lead: {
      ru: 'Работа в составе продакшена. Шоурил, отобранные работы и credits.',
      en: 'Working as part of a production. Showreel, selected work and credits.',
    },
    gatewayDescription: {
      ru: 'Для продюсеров и продакшенов: шоурил, работы, credits.',
      en: 'For producers and production houses: showreel, work, credits.',
    },
    hero: decorative('hero-production', 'wide', 4),
    gatewayMedia: decorative('gw-production', 'tall', 4),
  },
];

export const categories: Category[] = [
  { _id: 'cat.wedding', slug: 'wedding', title: { ru: 'Свадьбы', en: 'Weddings' }, directions: ['private'], order: 1, isDemo: true },
  { _id: 'cat.portrait', slug: 'portrait', title: { ru: 'Портрет', en: 'Portrait' }, directions: ['private'], order: 2, isDemo: true },
  { _id: 'cat.family', slug: 'family', title: { ru: 'Семья', en: 'Family' }, directions: ['private'], order: 3, isDemo: true },
  { _id: 'cat.love-story', slug: 'love-story', title: { ru: 'Love story', en: 'Love story' }, directions: ['private'], order: 4, isDemo: true },
  { _id: 'cat.private-event', slug: 'private-event', title: { ru: 'Частные события', en: 'Private events' }, directions: ['private'], order: 5, isDemo: true },
  { _id: 'cat.conference', slug: 'conference', title: { ru: 'Конференции и события', en: 'Conferences and events' }, directions: ['business', 'production'], order: 6, isDemo: true },
  { _id: 'cat.interview', slug: 'interview', title: { ru: 'Интервью и подкасты', en: 'Interviews and podcasts' }, directions: ['business'], order: 7, isDemo: true },
  { _id: 'cat.commercial', slug: 'commercial', title: { ru: 'Реклама', en: 'Advertising' }, directions: ['business', 'production'], order: 8, isDemo: true },
  { _id: 'cat.narrative', slug: 'narrative', title: { ru: 'Игровое и нарратив', en: 'Narrative' }, directions: ['production'], order: 9, isDemo: true },
];

export const articleTypes: ArticleType[] = [
  { _id: 'at.backstage', slug: 'backstage', title: { ru: 'Backstage', en: 'Backstage' }, order: 1, isDemo: true },
  { _id: 'at.project-story', slug: 'project-story', title: { ru: 'История проекта', en: 'Project story' }, order: 2, isDemo: true },
  { _id: 'at.process', slug: 'process', title: { ru: 'Процесс', en: 'Process' }, order: 3, isDemo: true },
  { _id: 'at.location', slug: 'location', title: { ru: 'Локация', en: 'Location' }, order: 4, isDemo: true },
  { _id: 'at.preparation', slug: 'preparation', title: { ru: 'Подготовка', en: 'Preparation' }, order: 5, isDemo: true },
  { _id: 'at.production-note', slug: 'production-note', title: { ru: 'Production note', en: 'Production note' }, order: 6, isDemo: true },
  { _id: 'at.personal', slug: 'personal', title: { ru: 'Личная заметка', en: 'Personal note' }, order: 7, isDemo: true },
];

export const workFormats: WorkFormat[] = [
  { _id: 'fmt.photo', slug: 'photo', title: { ru: 'Фото', en: 'Photo' }, order: 1, isDemo: true },
  { _id: 'fmt.video', slug: 'video', title: { ru: 'Видео', en: 'Video' }, order: 2, isDemo: true },
  { _id: 'fmt.photo-video', slug: 'photo-video', title: { ru: 'Фото + видео', en: 'Photo + video' }, order: 3, isDemo: true },
  { _id: 'fmt.team', slug: 'team', title: { ru: 'Команда', en: 'Team' }, order: 4, isDemo: true },
];

export const people: Person[] = [
  { _id: 'p.demo-1', displayName: 'Demo Person A', role: { ru: 'Оператор', en: 'Camera operator' }, visibility: 'public', isDemo: true },
  { _id: 'p.demo-2', displayName: 'Demo Person B', role: { ru: 'Свет', en: 'Gaffer' }, visibility: 'public', isDemo: true },
  { _id: 'p.demo-3', displayName: 'Demo Person C', role: { ru: 'Монтаж', en: 'Editor' }, visibility: 'public', isDemo: true },
];

export const services: Service[] = [
  {
    ...demo,
    _id: 'svc.events',
    slug: 'events-conferences',
    direction: 'business',
    order: 1,
    title: { ru: 'События и конференции', en: 'Events & conferences' },
    summary: {
      ru: 'Репортаж, который можно сразу публиковать: спикеры, зал, детали, атмосфера.',
      en: 'Coverage ready to publish: speakers, the room, details, atmosphere.',
    },
    body: bodyRuEn(
      [
        'Съёмка деловых событий требует незаметности и скорости. Важно не мешать программе, но не пропустить ключевые моменты: выход спикера, реакцию зала, живое общение в кулуарах.',
        'Материал структурируется под задачи после события — отчёт, пресс-релиз, соцсети, сайт мероприятия следующего года.',
      ],
      [
        'Covering business events takes discretion and speed. You must stay out of the programme yet miss none of the key moments: the speaker walking on, the room reacting, the real conversations in the foyer.',
        'The material is then structured around what happens after the event — the report, the press release, social channels, next year\'s event page.',
      ],
    ),
    deliverables: [
      { ru: 'Отобранный и обработанный репортаж', en: 'Selected and edited coverage' },
      { ru: 'Экспресс-подборка в день события', en: 'Same-day express selection' },
      { ru: 'Горизонтальные и вертикальные кадрирования', en: 'Horizontal and vertical crops' },
    ],
    formatSlugs: ['photo', 'video', 'photo-video', 'team'],
    process: [
      { title: { ru: 'Бриф и тайминг', en: 'Brief and timing' }, body: { ru: 'Программа, ключевые моменты, список обязательных кадров.', en: 'Programme, key moments, must-have shot list.' } },
      { title: { ru: 'Съёмочный день', en: 'Shooting day' }, body: { ru: 'Один или несколько специалистов в зависимости от площадок.', en: 'One or several specialists depending on the venues.' } },
      { title: { ru: 'Отбор и обработка', en: 'Selection and editing' } },
      { title: { ru: 'Передача материалов', en: 'Delivery' } },
    ],
    faq: [
      { question: { ru: 'Как быстро приходят материалы?', en: 'How soon are the files delivered?' }, answer: { ru: 'Сроки согласуются под программу события и объём съёмки.', en: 'Timelines are agreed against the event programme and shooting volume.' } },
      { question: { ru: 'Можно ли снимать несколько залов одновременно?', en: 'Can several halls be covered at once?' }, answer: { ru: 'Да, под такие задачи собирается команда.', en: 'Yes, a team is assembled for that.' } },
    ],
    hero: decorative('svc-events-hero', 'wide', 1),
    gallery: [
      image('svc-events-1', 'still', 1, 'Зал конференции во время выступления', 'Conference hall during a talk'),
      image('svc-events-2', 'still', 2, 'Спикер у сцены', 'Speaker by the stage'),
      image('svc-events-3', 'tall', 1, 'Общение участников в кулуарах', 'Attendees talking in the foyer'),
    ],
    pricingSlug: 'business-event',
    leadTime: { ru: 'Сроки согласуются под задачу', en: 'Timelines agreed per project' },
  },
  {
    ...demo,
    _id: 'svc.interviews',
    slug: 'interviews-podcasts',
    direction: 'business',
    order: 2,
    title: { ru: 'Интервью и подкасты', en: 'Interviews & podcasts' },
    summary: { ru: 'Разговорный формат со светом и звуком, который не стыдно поставить на главную.', en: 'Conversation formats with lighting and sound worth putting on your homepage.' },
    body: bodyRuEn(
      ['Интервью держится на трёх вещах: свет, звук и спокойный собеседник. Техническая часть готовится заранее, чтобы съёмочный день был про содержание, а не про настройку.'],
      ['An interview rests on three things: light, sound and a calm guest. The technical side is prepared in advance so that the shooting day is about the conversation, not the setup.'],
    ),
    deliverables: [
      { ru: 'Смонтированный выпуск', en: 'Edited episode' },
      { ru: 'Вертикальные нарезки', en: 'Vertical cutdowns' },
      { ru: 'Кадры со съёмки', en: 'Stills from the shoot' },
    ],
    formatSlugs: ['video', 'photo-video'],
    process: [
      { title: { ru: 'Подготовка студии', en: 'Studio prep' } },
      { title: { ru: 'Съёмка', en: 'Shoot' } },
      { title: { ru: 'Монтаж и звук', en: 'Edit and sound' } },
    ],
    faq: [{ question: { ru: 'Своя студия или выезд?', en: 'Studio or on location?' }, answer: { ru: 'Оба варианта: выбор зависит от формата и количества выпусков.', en: 'Both: the choice depends on the format and number of episodes.' } }],
    hero: decorative('svc-int-hero', 'wide', 5),
    gallery: [image('svc-int-1', 'still', 3, 'Съёмка интервью в студии', 'Interview being filmed in a studio')],
    pricingSlug: 'business-interview',
  },
  {
    ...demo,
    _id: 'svc.brand',
    slug: 'brand-image',
    direction: 'business',
    order: 3,
    title: { ru: 'Бренд и имидж', en: 'Brand & image' },
    summary: { ru: 'Команда, офис, производство и продукт в едином визуальном языке.', en: 'Team, office, production and product in one visual language.' },
    body: bodyRuEn(
      ['Имиджевая съёмка — это библиотека кадров, которой компания пользуется весь год: сайт, презентации, вакансии, СМИ.'],
      ['A brand shoot produces a library the company draws on all year: website, decks, job ads, press requests.'],
    ),
    deliverables: [
      { ru: 'Библиотека кадров под задачи компании', en: 'Shot library for company needs' },
      { ru: 'Портреты команды в едином стиле', en: 'Team portraits in one consistent style' },
    ],
    formatSlugs: ['photo', 'photo-video'],
    process: [{ title: { ru: 'Референсы и подготовка', en: 'References and prep' } }, { title: { ru: 'Съёмочный день', en: 'Shooting day' } }, { title: { ru: 'Обработка', en: 'Post' } }],
    faq: [],
    hero: decorative('svc-brand-hero', 'wide', 6),
    gallery: [image('svc-brand-1', 'square', 1, 'Портрет сотрудника на рабочем месте', 'Employee portrait at the workplace')],
    pricingSlug: 'business-brand',
  },
  {
    ...demo,
    _id: 'svc.advertising',
    slug: 'advertising',
    direction: 'business',
    order: 4,
    title: { ru: 'Рекламная съёмка', en: 'Advertising' },
    summary: { ru: 'Проекты со сценарием, подготовкой и собранной под задачу командой.', en: 'Projects with a script, preparation and a team assembled for the task.' },
    body: bodyRuEn(
      ['Рекламный проект начинается задолго до камеры: идея, раскадровка, локации, каст, смета. Здесь важна предсказуемость — что именно получит клиент и в какой срок.'],
      ['An advertising project starts long before the camera: concept, storyboard, locations, casting, budget. What matters here is predictability — exactly what the client receives, and when.'],
    ),
    deliverables: [
      { ru: 'Основной ролик и версии под площадки', en: 'Master film and platform versions' },
      { ru: 'Кадры со съёмки', en: 'Stills from the shoot' },
    ],
    formatSlugs: ['video', 'team'],
    process: [
      { title: { ru: 'Идея и раскадровка', en: 'Concept and storyboard' } },
      { title: { ru: 'Препродакшн', en: 'Pre-production' } },
      { title: { ru: 'Съёмка', en: 'Production' } },
      { title: { ru: 'Постпродакшн', en: 'Post-production' } },
    ],
    faq: [],
    hero: decorative('svc-adv-hero', 'wide', 2),
    gallery: [image('svc-adv-1', 'still', 4, 'Подготовка света на съёмочной площадке', 'Lighting setup on set')],
    pricingSlug: 'business-custom',
  },
  {
    ...demo,
    _id: 'svc.social',
    slug: 'social-content',
    direction: 'business',
    order: 5,
    title: { ru: 'Контент для соцсетей', en: 'Social content' },
    summary: { ru: 'Регулярный поток вертикального видео и фото без просадки качества.', en: 'A steady stream of vertical video and photo without a drop in quality.' },
    body: bodyRuEn(
      ['Контент-съёмки работают на регулярности. Формат один раз настраивается, дальше повторяется циклами и не требует каждый раз нового согласования.'],
      ['Content shoots work through regularity. The format is set up once, then repeats in cycles without needing fresh approval every time.'],
    ),
    deliverables: [
      { ru: 'Пакет вертикальных роликов', en: 'Batch of vertical videos' },
      { ru: 'Фото под ленту и сторис', en: 'Photos for feed and stories' },
    ],
    formatSlugs: ['photo', 'video', 'photo-video'],
    process: [{ title: { ru: 'Контент-план', en: 'Content plan' } }, { title: { ru: 'Съёмочный блок', en: 'Shooting block' } }, { title: { ru: 'Монтаж', en: 'Edit' } }],
    faq: [],
    hero: decorative('svc-social-hero', 'wide', 3),
    gallery: [image('svc-social-1', 'tall', 3, 'Вертикальный кадр со съёмки контента', 'Vertical frame from a content shoot')],
    pricingSlug: 'business-social',
  },
];

export const projects: Project[] = [
  {
    ...demo,
    _id: 'prj.conference',
    slug: 'demo-industry-conference',
    directions: ['business'],
    categorySlugs: ['conference'],
    year: 2025,
    featured: true,
    order: 1,
    title: { ru: 'Отраслевая конференция', en: 'Industry conference' },
    role: { ru: 'Фотограф, координация съёмочной группы', en: 'Photographer, crew coordination' },
    lead: { ru: 'Двухдневная программа, три зала, съёмка для отчёта и коммуникаций следующего сезона.', en: 'A two-day programme, three halls, coverage for the report and next season communications.' },
    challenge: bodyRu('Программа шла параллельно в трёх залах, а материалы нужны были уже к вечеру первого дня.'),
    solution: bodyRu('Съёмочный график был разложен по залам заранее, часть материала отбиралась прямо на площадке, чтобы вечерняя подборка ушла без задержки.'),
    result: bodyRu('Материалы переданы в согласованные сроки и использованы в отчёте и анонсах следующего события.'),
    cover: image('prj-conf-cover', 'still', 1, 'Зал конференции с полной посадкой', 'Conference hall at full capacity'),
    media: [
      image('prj-conf-1', 'still', 2, 'Спикер во время доклада', 'Speaker during a talk'),
      image('prj-conf-2', 'tall', 1, 'Разговор участников в перерыве', 'Attendees talking during a break', { ru: 'Кулуары важнее сцены: там договариваются.', en: 'The foyer matters more than the stage: deals happen there.' }),
      image('prj-conf-3', 'still', 3, 'Общий план сцены', 'Wide shot of the stage'),
    ],
    serviceSlugs: ['events-conferences'],
    formatSlugs: ['photo', 'team'],
    credits: [{ person: people[0] }, { person: people[1] }],
  },
  {
    ...demo,
    _id: 'prj.podcast',
    slug: 'demo-podcast-season',
    directions: ['business'],
    categorySlugs: ['interview'],
    year: 2025,
    featured: true,
    order: 2,
    title: { ru: 'Сезон подкаста', en: 'Podcast season' },
    role: { ru: 'Съёмка и монтаж', en: 'Filming and editing' },
    lead: { ru: 'Восемь выпусков, снятых блоками, с единым светом и типографикой.', en: 'Eight episodes shot in blocks with consistent lighting and typography.' },
    challenge: bodyRu('Выпуски снимались блоками по несколько за день — при этом каждый должен был выглядеть как отдельная запись, а не конвейер.'),
    solution: bodyRu('Схема света и точки камер фиксировались один раз, а различие между выпусками задавалось фоном и раскладкой графики.'),
    cover: image('prj-pod-cover', 'still', 4, 'Съёмка подкаста в студии', 'Podcast being filmed in a studio'),
    media: [image('prj-pod-1', 'still', 5, 'Два собеседника за столом', 'Two people talking at a table'), video('prj-pod-v', 4, 'Фрагмент выпуска подкаста', 'Excerpt from a podcast episode', 92)],
    serviceSlugs: ['interviews-podcasts'],
    formatSlugs: ['video'],
    credits: [{ person: people[2] }],
  },
  {
    ...demo,
    _id: 'prj.brand-library',
    slug: 'demo-brand-library',
    directions: ['business'],
    categorySlugs: ['commercial'],
    year: 2024,
    order: 3,
    title: { ru: 'Имиджевая библиотека', en: 'Brand image library' },
    role: { ru: 'Фотограф', en: 'Photographer' },
    lead: { ru: 'Съёмка команды, офиса и производства для сайта и внутренних коммуникаций.', en: 'Team, office and production photography for the website and internal communications.' },
    challenge: bodyRu('Разные площадки, разный свет и очень ограниченное время у каждого сотрудника.'),
    solution: bodyRu('Съёмка была построена как маршрут: мобильный свет переносился между точками, а очередь сотрудников шла по расписанию.'),
    cover: image('prj-brand-cover', 'square', 2, 'Портрет сотрудника в интерьере офиса', 'Employee portrait in an office interior'),
    media: [image('prj-brand-1', 'still', 6, 'Рабочее пространство', 'Working space'), image('prj-brand-2', 'tall', 4, 'Портрет в производственном цехе', 'Portrait in a production facility')],
    serviceSlugs: ['brand-image'],
    formatSlugs: ['photo'],
    credits: [],
  },
  {
    ...demo,
    _id: 'prj.short-film',
    slug: 'demo-short-form-film',
    directions: ['production'],
    categorySlugs: ['narrative'],
    year: 2025,
    featured: true,
    order: 1,
    title: { ru: 'Короткая форма', en: 'Short form' },
    role: { ru: 'Роль в проекте — К ПОДТВЕРЖДЕНИЮ', en: 'Role on the project — TO BE CONFIRMED' },
    lead: { ru: 'Съёмочный проект с полным препродакшном и командой на площадке.', en: 'A shooting project with full pre-production and a crew on set.' },
    challenge: bodyRu('Съёмка шла в естественном свете в ограниченное окно времени.'),
    solution: bodyRu('Порядок сцен был выстроен по движению солнца, а не по сценарию, чтобы уложиться в свет.'),
    cover: image('prj-film-cover', 'wide', 5, 'Кадр со съёмочной площадки', 'Frame from the set'),
    media: [video('prj-film-v', 5, 'Фрагмент проекта', 'Project excerpt', 74), image('prj-film-1', 'wide', 6, 'Работа на площадке', 'Work on set')],
    serviceSlugs: [],
    formatSlugs: ['video', 'team'],
    credits: [{ person: people[0] }, { person: people[1] }, { person: people[2] }],
  },
  {
    ...demo,
    _id: 'prj.commercial',
    slug: 'demo-commercial-spot',
    directions: ['production', 'business'],
    categorySlugs: ['commercial'],
    year: 2024,
    order: 2,
    title: { ru: 'Рекламный ролик', en: 'Commercial spot' },
    role: { ru: 'Роль в проекте — К ПОДТВЕРЖДЕНИЮ', en: 'Role on the project — TO BE CONFIRMED' },
    lead: { ru: 'Проект со сценарием, раскадровкой и версиями под несколько площадок.', en: 'A project with a script, storyboard and versions for several platforms.' },
    challenge: bodyRu('Один съёмочный день и три обязательных формата на выходе.'),
    solution: bodyRu('Каждая сцена сразу снималась в двух кадрированиях, чтобы вертикальные версии не пришлось добирать отдельно.'),
    cover: image('prj-com-cover', 'wide', 1, 'Кадр из рекламного ролика', 'Frame from a commercial'),
    media: [video('prj-com-v', 1, 'Рекламный ролик', 'Commercial spot', 30)],
    serviceSlugs: ['advertising'],
    formatSlugs: ['video', 'team'],
    credits: [{ person: people[1] }],
  },
  {
    ...demo,
    _id: 'prj.wedding',
    slug: 'demo-wedding-day',
    directions: ['private'],
    categorySlugs: ['wedding'],
    year: 2025,
    featured: true,
    order: 1,
    title: { ru: 'Свадебный день', en: 'Wedding day' },
    lead: { ru: 'Полный день от сборов до вечера, без постановки там, где её не нужно.', en: 'A full day from getting ready to the evening, without staging where none is needed.' },
    cover: image('prj-wed-cover', 'still', 2, 'Пара во время церемонии', 'Couple during the ceremony'),
    media: [
      image('prj-wed-1', 'tall', 5, 'Утренние сборы', 'Getting ready in the morning'),
      image('prj-wed-2', 'still', 3, 'Гости во время поздравлений', 'Guests during the toasts'),
      image('prj-wed-3', 'still', 4, 'Вечерний танец', 'Evening dance'),
    ],
    serviceSlugs: [],
    formatSlugs: ['photo'],
    credits: [],
  },
  {
    ...demo,
    _id: 'prj.portrait',
    slug: 'demo-portrait-session',
    directions: ['private'],
    categorySlugs: ['portrait'],
    year: 2025,
    order: 2,
    title: { ru: 'Портретная съёмка', en: 'Portrait session' },
    lead: { ru: 'Час на локации и спокойный ритм — без списка обязательных поз.', en: 'An hour on location at a calm pace — no mandatory pose list.' },
    cover: image('prj-por-cover', 'tall', 6, 'Портрет в естественном свете', 'Portrait in natural light'),
    media: [image('prj-por-1', 'square', 3, 'Портрет крупным планом', 'Close-up portrait')],
    serviceSlugs: [],
    formatSlugs: ['photo'],
    credits: [],
  },
  {
    ...demo,
    _id: 'prj.family',
    slug: 'demo-family-session',
    directions: ['private'],
    categorySlugs: ['family'],
    year: 2024,
    order: 3,
    title: { ru: 'Семейная съёмка', en: 'Family session' },
    lead: { ru: 'Дом и прогулка: съёмка, в которой детям не надо позировать.', en: 'Home and a walk: a shoot where children do not have to pose.' },
    cover: image('prj-fam-cover', 'still', 5, 'Семья на прогулке', 'A family on a walk'),
    media: [image('prj-fam-1', 'square', 4, 'Дети играют дома', 'Children playing at home')],
    serviceSlugs: [],
    formatSlugs: ['photo'],
    credits: [],
  },
];

export const articles: Article[] = [
  {
    ...demo,
    _id: 'art.conference-backstage',
    slug: 'demo-conference-backstage',
    directions: ['business', 'production'],
    primaryDirection: 'business',
    typeSlug: 'backstage',
    order: 1,
    publishedAt: '2025-11-12',
    title: { ru: 'Как снимают конференцию на три зала', en: 'Covering a three-hall conference' },
    excerpt: {
      ru: 'Заметка о том, как распределяется съёмочная группа, когда программа идёт параллельно.',
      en: 'A note on how a crew is distributed when the programme runs in parallel.',
    },
    body: bodyRu(
      'Самое сложное в многозальной конференции — не съёмка, а расписание. Один человек физически не успевает на все ключевые доклады, поэтому программа заранее размечается по приоритетам.',
      'Дальше решает подготовка: где стоит свет, откуда снимается общий план, кто отвечает за кулуары. К моменту, когда начинается первый доклад, все вопросы уже закрыты.',
      'Вечерняя подборка собирается прямо на площадке — это отдельная работа, которую стоит закладывать в смету и в тайминг съёмочного дня.',
    ),
    cover: image('art-conf-cover', 'wide', 2, 'Съёмочная группа за работой на конференции', 'Crew working at a conference'),
    projectSlugs: ['demo-industry-conference'],
  },
  {
    ...demo,
    _id: 'art.light-setup',
    slug: 'demo-interview-light',
    directions: ['business'],
    primaryDirection: 'business',
    typeSlug: 'process',
    order: 2,
    publishedAt: '2025-09-30',
    title: { ru: 'Свет для интервью, который не надо переставлять', en: 'Interview lighting you never have to move' },
    excerpt: { ru: 'Почему схема на два прибора работает лучше сложной, если выпусков много.', en: 'Why a two-light setup beats a complex one when there are many episodes.' },
    body: bodyRu(
      'Когда выпусков десятки, побеждает не самая красивая схема, а самая повторяемая. Её можно собрать за двадцать минут и получить тот же результат в следующий съёмочный день.',
      'Два прибора и отражатель закрывают почти любой разговорный формат. Всё остальное — вопрос фона и расстояния до собеседника.',
    ),
    cover: image('art-light-cover', 'still', 6, 'Схема света в студии', 'Studio lighting setup'),
    projectSlugs: ['demo-podcast-season'],
  },
  {
    ...demo,
    _id: 'art.production-note',
    slug: 'demo-production-note',
    directions: ['production'],
    primaryDirection: 'production',
    typeSlug: 'production-note',
    order: 3,
    publishedAt: '2025-08-04',
    title: { ru: 'Съёмочный день по солнцу, а не по сценарию', en: 'Shooting to the sun, not to the script' },
    excerpt: { ru: 'Заметка о порядке сцен, когда весь свет естественный.', en: 'A note on scene order when all the light is natural.' },
    body: bodyRu(
      'В естественном свете порядок сцен диктует не драматургия, а положение солнца. Сцену, снятую не в своё время, потом не спасёт ни свет, ни цветокоррекция.',
      'Поэтому раскадровка на площадке пересобирается в расписание: что снимаем на восходе, что в полдень, что в последний час перед закатом.',
    ),
    cover: image('art-prod-cover', 'wide', 4, 'Съёмка в естественном свете', 'Shooting in natural light'),
    projectSlugs: ['demo-short-form-film'],
  },
  {
    ...demo,
    _id: 'art.wedding-prep',
    slug: 'demo-wedding-preparation',
    directions: ['private'],
    primaryDirection: 'private',
    typeSlug: 'preparation',
    order: 4,
    publishedAt: '2025-07-18',
    title: { ru: 'Что обсудить с фотографом до свадьбы', en: 'What to discuss with your photographer before the wedding' },
    excerpt: { ru: 'Короткий список вопросов, который снимает большую часть волнения.', en: 'A short list of questions that removes most of the anxiety.' },
    body: bodyRu(
      'Почти все сложности свадебной съёмки решаются одним разговором за пару недель до даты: тайминг, список важных людей, места, где будет тесно или темно.',
      'Отдельно стоит проговорить, что снимать не нужно. Это экономит время в самый плотный час дня.',
    ),
    cover: image('art-wed-cover', 'still', 1, 'Подготовка к свадебной съёмке', 'Preparing for a wedding shoot'),
    projectSlugs: ['demo-wedding-day'],
  },
  {
    ...demo,
    _id: 'art.cross-direction',
    slug: 'demo-one-shoot-three-audiences',
    directions: ['private', 'business', 'production'],
    primaryDirection: 'business',
    typeSlug: 'personal',
    order: 5,
    publishedAt: '2025-06-02',
    title: { ru: 'Одна съёмка — три разных заказчика', en: 'One shoot, three different clients' },
    excerpt: { ru: 'Почему одна и та же техника решает совершенно разные задачи.', en: 'Why the same craft solves completely different problems.' },
    body: bodyRu(
      'Частному клиенту важно, чтобы съёмка была про него. Компании — чтобы материал работал на задачу. Продакшену — чтобы человек на площадке отвечал за свою зону и не создавал вопросов.',
      'Техника при этом почти одна и та же. Разное — то, как строится разговор до съёмки и что считается результатом.',
    ),
    cover: image('art-cross-cover', 'still', 4, 'Камера на съёмочной площадке', 'Camera on set'),
    projectSlugs: [],
  },
  {
    // Единственная запись без английской версии: проверяет режим fallback (§4.1).
    ...demo,
    _id: 'art.ru-only',
    slug: 'demo-location-scouting',
    directions: ['private', 'business'],
    primaryDirection: 'private',
    typeSlug: 'location',
    order: 6,
    publishedAt: '2025-05-20',
    title: { ru: 'Как выбирают локацию для съёмки' },
    excerpt: { ru: 'Заметка о том, почему красивое место не всегда снимаемое.' },
    body: bodyRu(
      'Локация оценивается не по тому, как она выглядит глазами, а по тому, как в ней ложится свет в нужный час и сколько там места для работы.',
      'Красивое место с плохим светом и без единой точки съёмки проигрывает скучному двору с ровной тенью.',
    ),
    cover: image('art-loc-cover', 'tall', 2, 'Осмотр локации перед съёмкой', 'Scouting a location before a shoot'),
    projectSlugs: ['demo-portrait-session'],
  },
];

export const pricingEntries: PricingEntry[] = [
  // Цены НЕ ЗАПОЛНЕНЫ намеренно: §5.8 и §1.2 запрещают публиковать
  // неподтверждённые цифры. Поле `price` заполняется владельцем в CMS.
  { _id: 'pr.private-portrait', slug: 'private-portrait', direction: 'private', order: 1, active: true, isDemo: true, title: { ru: 'Портретная съёмка', en: 'Portrait session' }, description: { ru: 'Съёмка на локации, отобранные и обработанные кадры.', en: 'On-location shoot, selected and edited frames.' }, disclaimer: { ru: 'Стоимость подтверждается владельцем.', en: 'Pricing to be confirmed by the owner.' } },
  { _id: 'pr.private-wedding', slug: 'private-wedding', direction: 'private', order: 2, active: true, isDemo: true, title: { ru: 'Свадебный день', en: 'Wedding day' }, description: { ru: 'Полный день съёмки, от сборов до вечерней части.', en: 'Full-day coverage, from getting ready to the evening.' }, disclaimer: { ru: 'Стоимость подтверждается владельцем.', en: 'Pricing to be confirmed by the owner.' } },
  { _id: 'pr.private-family', slug: 'private-family', direction: 'private', order: 3, active: true, isDemo: true, title: { ru: 'Семейная съёмка', en: 'Family session' }, description: { ru: 'Съёмка дома или на прогулке.', en: 'At home or on a walk.' }, disclaimer: { ru: 'Стоимость подтверждается владельцем.', en: 'Pricing to be confirmed by the owner.' } },
  { _id: 'pr.business-event', slug: 'business-event', direction: 'business', order: 1, active: true, isDemo: true, title: { ru: 'События и конференции', en: 'Events & conferences' }, description: { ru: 'Расчёт зависит от длительности программы, числа площадок и состава группы.', en: 'Calculated from programme length, number of venues and crew size.' }, disclaimer: { ru: 'Итоговая смета формируется после брифа.', en: 'The final estimate is prepared after the brief.' } },
  { _id: 'pr.business-interview', slug: 'business-interview', direction: 'business', order: 2, active: true, isDemo: true, title: { ru: 'Интервью и подкасты', en: 'Interviews & podcasts' }, description: { ru: 'Расчёт зависит от числа выпусков и глубины монтажа.', en: 'Calculated from episode count and depth of editing.' }, disclaimer: { ru: 'Итоговая смета формируется после брифа.', en: 'The final estimate is prepared after the brief.' } },
  { _id: 'pr.business-brand', slug: 'business-brand', direction: 'business', order: 3, active: true, isDemo: true, title: { ru: 'Бренд и имидж', en: 'Brand & image' }, description: { ru: 'Расчёт зависит от числа площадок и объёма съёмки.', en: 'Calculated from number of locations and shooting volume.' }, disclaimer: { ru: 'Итоговая смета формируется после брифа.', en: 'The final estimate is prepared after the brief.' } },
  { _id: 'pr.business-social', slug: 'business-social', direction: 'business', order: 4, active: true, isDemo: true, title: { ru: 'Контент для соцсетей', en: 'Social content' }, description: { ru: 'Расчёт зависит от объёма пакета и периодичности.', en: 'Calculated from package size and frequency.' }, disclaimer: { ru: 'Итоговая смета формируется после брифа.', en: 'The final estimate is prepared after the brief.' } },
  { _id: 'pr.business-custom', slug: 'business-custom', direction: 'business', order: 5, active: true, isDemo: true, title: { ru: 'Рекламные и сложные проекты', en: 'Advertising and complex projects' }, description: { ru: 'Индивидуальная смета: препродакшн, команда, локации, постпродакшн.', en: 'Individual estimate: pre-production, crew, locations, post-production.' }, disclaimer: { ru: 'Только индивидуальный расчёт.', en: 'Individual estimate only.' } },
];

function aboutPage(
  direction: 'private' | 'business' | 'production',
  lead: { ru: string; en: string },
  body: { ru: string[]; en: string[] },
): Page {
  return {
    ...demo,
    _id: `page.about.${direction}`,
    slug: 'about',
    pageType: 'about',
    direction,
    order: 1,
    title: { ru: 'О себе', en: 'About' },
    lead,
    body: bodyRuEn(body.ru, body.en),
    hero: decorative(`about-${direction}`, 'still', direction === 'private' ? 2 : direction === 'business' ? 4 : 6),
  };
}

export const pages: Page[] = [
  aboutPage(
    'private',
    { ru: 'Снимаю людей так, чтобы через год фотографии смотрели не из вежливости.', en: 'I photograph people so that a year later the pictures are not looked at out of politeness.' },
    {
      ru: [
        'Частная съёмка — это прежде всего разговор. До камеры мы обсуждаем, что для вас важно и чего не хочется совсем: это экономит время и снимает большую часть напряжения.',
        'Дальше остаётся техника: свет, ритм и умение не мешать. КОНТЕНТ К ПОДТВЕРЖДЕНИЮ: профессиональная история, стаж и география.',
      ],
      en: [
        'A private shoot is a conversation first. Before the camera comes out we agree on what matters to you and what you would rather avoid entirely — that saves time and removes most of the tension.',
        'After that it is craft: light, rhythm and knowing when to stay out of the way. CONTENT TO BE CONFIRMED: professional background, years of experience and geography.',
      ],
    },
  ),
  aboutPage(
    'business',
    { ru: 'Фото и видео как рабочий инструмент компании, а не как разовая услуга.', en: 'Photo and video as a working tool for the company, not a one-off service.' },
    {
      ru: [
        'Для компании съёмка — часть коммуникации. Поэтому работа начинается с задачи: где материал будет опубликован, кто его аудитория и что считается результатом.',
        'Под объём задачи собирается команда — от одного специалиста до полноценной группы. КОНТЕНТ К ПОДТВЕРЖДЕНИЮ: список клиентов, стаж и подтверждённые проекты.',
      ],
      en: [
        'For a company, a shoot is part of communication. So the work starts from the task: where the material will be published, who the audience is and what counts as a result.',
        'A team is assembled to match the scope — from a single specialist to a full crew. CONTENT TO BE CONFIRMED: client list, years of experience and confirmed projects.',
      ],
    },
  ),
  aboutPage(
    'production',
    { ru: 'Работа в составе продакшена: своя зона ответственности и предсказуемый результат.', en: 'Working as part of a production: a clear area of responsibility and a predictable result.' },
    {
      ru: [
        'На площадке ценится не универсальность, а надёжность в своей роли: прийти подготовленным, отработать смену и сдать материал в оговорённом виде.',
        'КОНТЕНТ К ПОДТВЕРЖДЕНИЮ: подтверждённые роли, credits, оборудование и опыт работы в проектах.',
      ],
      en: [
        'On set what counts is not versatility but reliability in your own role: arrive prepared, work the day, deliver the material in the agreed form.',
        'CONTENT TO BE CONFIRMED: confirmed roles, credits, equipment and project experience.',
      ],
    },
  ),
];

/** Таблица редиректов (§6). Заполняется при переносе старых адресов. */
export const redirects: Redirect[] = [];
