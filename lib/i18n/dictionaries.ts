/**
 * Строки интерфейса (ТЗ §15.3: i18n / locale routing + dictionaries).
 *
 * Здесь живёт ТОЛЬКО обвязка интерфейса: подписи меню, кнопок, состояний.
 * Содержательные тексты — заголовки, лиды, описания услуг — приходят из CMS
 * и здесь не дублируются.
 */

import type { Direction, Locale, Section } from '../site';

type SectionLabels = Record<Section, string>;
type DirectionLabels = Record<Direction, string>;

export type Dictionary = {
  brand: { name: string; descriptor: string };
  nav: SectionLabels;
  directions: DirectionLabels;
  common: {
    skipToContent: string;
    mainNavigation: string;
    openMenu: string;
    closeMenu: string;
    chooseDirection: string;
    filterBy: string;
    allDirections: string;
    currentDirection: string;
    language: string;
    switchToOther: string;
    home: string;
    breadcrumb: string;
    readMore: string;
    viewAll: string;
    year: string;
    client: string;
    role: string;
    credits: string;
    relatedProjects: string;
    relatedArticles: string;
    relatedCases: string;
    relatedServices: string;
    backstageNotes: string;
    finalCase: string;
    moreFromDirection: string;
    testimonials: string;
    included: string;
    formats: string;
    deliverables: string;
    process: string;
    faq: string;
    challenge: string;
    solution: string;
    result: string;
  };
  states: {
    emptyTitle: string;
    emptyBody: string;
    notFoundTitle: string;
    notFoundBody: string;
    errorTitle: string;
    errorBody: string;
    retry: string;
    goToStart: string;
    goToDirectionHome: string;
  };
  fallback: {
    /** Единый режим для всего сайта: показываем RU с заметной меткой (§4.1). */
    notice: string;
    short: string;
  };
  media: {
    playVideo: string;
    watchShowreel: string;
    videoConsent: string;
    videoConsentAction: string;
    openGallery: string;
    closeGallery: string;
    previous: string;
    next: string;
    imageOf: string;
  };
  calculator: {
    heading: string;
    formats: string;
    photo: string;
    video: string;
    shootType: string;
    hours: string;
    /** Формы множественного числа: функцию нельзя передать в клиентский компонент. */
    hoursUnit: { one: string; few: string; many: string };
    pickFormat: string;
    bundleDiscount: string;
    subtotal: string;
    total: string;
    perHourNow: string;
    cta: string;
    /** Как перечислить форматы в предложении: «фото и видео». */
    formatsJoiner: string;
  };
  albums: {
    /** Лид страницы полных серий. */
    lead: string;
    /** Заметный переход с портфолио. */
    promoLabel: string;
    promoTitle: string;
    promoBody: string;
    promoAction: string;
    /** Подпись у карточки альбома: галерея открывается на стороннем сервисе. */
    openGallery: string;
    externalHint: string;
    emptyTitle: string;
    emptyBody: string;
  };
  pricing: {
    from: string;
    /** Заголовок раскрывающегося списка пакетов. */
    packages: string;
    packagesUnit: { one: string; few: string; many: string };
    /** Третий вариант переключателя форматов внутри группы. */
    bothFormats: string;
    onRequest: string;
    individualEstimate: string;
    extras: string;
    combinedDiscount: string;
  };
  contact: {
    /** Заголовок блока связи и подпись кнопки. */
    heading: string;
    button: string;
    /** Подпись под заголовком блока связи на главной. */
    homeLead: string;
    /** Заголовок окна выбора мессенджера. */
    pickChannel: string;
    pickChannelLead: string;
    close: string;
    messageLabel: string;
    copy: string;
    copied: string;
    /** MAX открывает чат, но текст в ссылке не принимает. */
    pasteHint: string;
    call: string;
    directContacts: string;
    /** Заготовка первого сообщения. */
    greeting: string;
    subjectPrefix: string;
    packageWord: string;
    serviceWord: string;
    estimatePrefix: string;
  };
  content: {
    /** Метка обязательна там, где факт не подтверждён владельцем (§0, §15.1). */
    unconfirmed: string;
    demoData: string;
  };
};

const ru: Dictionary = {
  brand: { name: 'Nikita Sokolov', descriptor: 'Photo / Video / Visual Production' },
  nav: {
    portfolio: 'Портфолио',
    albums: 'Полные свадьбы',
    services: 'Услуги',
    cases: 'Кейсы',
    showreel: 'Шоурил',
    work: 'Работы',
    experience: 'Опыт и credits',
    pricing: 'Стоимость',
    blog: 'Журнал',
    about: 'О себе',
    contact: 'Контакты',
  },
  directions: { private: 'Private', business: 'Business', production: 'Production' },
  common: {
    skipToContent: 'К основному содержимому',
    mainNavigation: 'Основная навигация',
    openMenu: 'Открыть меню',
    closeMenu: 'Закрыть меню',
    chooseDirection: 'Выбрать направление',
    filterBy: 'Фильтр',
    allDirections: 'Все направления',
    currentDirection: 'Текущее направление',
    language: 'Язык',
    switchToOther: 'Switch to English',
    home: 'Главная',
    breadcrumb: 'Вы здесь',
    readMore: 'Читать',
    viewAll: 'Смотреть все',
    year: 'Год',
    client: 'Клиент',
    role: 'Роль',
    credits: 'Команда',
    relatedProjects: 'Похожие проекты',
    relatedArticles: 'Связанные заметки',
    relatedCases: 'Связанные кейсы',
    relatedServices: 'Связанные услуги',
    backstageNotes: 'Backstage и заметки',
    finalCase: 'Финальный кейс',
    moreFromDirection: 'Ещё из этого направления',
    testimonials: 'Отзывы',
    included: 'Что входит всегда',
    formats: 'Форматы',
    deliverables: 'Что получает клиент',
    process: 'Этапы работы',
    faq: 'Частые вопросы',
    challenge: 'Задача',
    solution: 'Решение',
    result: 'Результат',
  },
  states: {
    emptyTitle: 'Здесь пока пусто',
    emptyBody: 'Раздел скоро наполнится. Пока можно посмотреть другие материалы направления.',
    notFoundTitle: 'Страница не найдена',
    notFoundBody: 'Возможно, адрес изменился. Выберите направление или напишите напрямую.',
    errorTitle: 'Что-то пошло не так',
    errorBody: 'Страницу не удалось загрузить. Попробуйте ещё раз.',
    retry: 'Повторить',
    goToStart: 'Все направления',
    goToDirectionHome: 'На главную направления',
  },
  fallback: {
    notice: 'This page is currently available in Russian only.',
    short: 'RU only',
  },
  media: {
    playVideo: 'Смотреть видео',
    watchShowreel: 'Смотреть шоурил со звуком',
    videoConsent:
      'Плеер загрузится со стороннего сервиса и получит данные вашего браузера.',
    videoConsentAction: 'Загрузить и воспроизвести',
    openGallery: 'Открыть в галерее',
    closeGallery: 'Закрыть галерею',
    previous: 'Предыдущее',
    next: 'Следующее',
    imageOf: 'из',
  },
  calculator: {
    heading: 'Посчитать стоимость',
    formats: 'Что снимаем',
    photo: 'Фото',
    video: 'Видео',
    shootType: 'Тип съёмки',
    hours: 'Часов съёмки',
    hoursUnit: { one: 'час', few: 'часа', many: 'часов' },
    pickFormat: 'Выберите фото, видео или оба формата.',
    bundleDiscount: 'Скидка за фото и видео вместе',
    subtotal: 'Сумма',
    total: 'Итого',
    perHourNow: 'Последний час',
    cta: 'Обсудить съёмку',
    formatsJoiner: ' и ',
  },
  albums: {
    lead: 'В портфолио — лучшие кадры с разных свадеб. Здесь каждый альбом — один день целиком, от утренних сборов до последнего танца.',
    promoLabel: 'Полные серии',
    promoTitle: 'Посмотреть свадьбу целиком',
    promoBody: 'Ниже — избранные кадры с разных свадеб. Если хотите увидеть, как выглядит весь день, откройте альбом целиком.',
    promoAction: 'Открыть альбомы',
    openGallery: 'Смотреть галерею',
    externalHint: 'откроется в новой вкладке',
    emptyTitle: 'Альбомы скоро появятся',
    emptyBody: 'Полные серии готовятся к публикации. Напишите — пришлю ссылку на подходящую съёмку.',
  },
  pricing: {
    from: 'от',
    packages: 'Пакетные предложения',
    packagesUnit: { one: 'пакет', few: 'пакета', many: 'пакетов' },
    bothFormats: 'Фото и видео',
    onRequest: 'по запросу',
    individualEstimate: 'Индивидуальная смета',
    extras: 'Дополнительно',
    combinedDiscount: 'При заказе фото и видео вместе — скидка 10% на общий чек.',
  },
  contact: {
    heading: 'Связаться',
    button: 'Связаться',
    homeLead: 'Напишите в удобный мессенджер — отвечу лично, без анкет и ожидания.',
    pickChannel: 'Где вам удобнее написать?',
    pickChannelLead: 'Сообщение уже готово — останется отправить.',
    close: 'Закрыть',
    messageLabel: 'Сообщение',
    copy: 'Скопировать',
    copied: 'Скопировано',
    pasteHint: 'MAX не подставляет текст: сообщение скопируется, вставьте его в чат.',
    call: 'Позвонить',
    directContacts: 'Прямые контакты',
    greeting: 'Добрый день! Пишу с сайта.',
    subjectPrefix: 'Интересует',
    packageWord: 'пакет',
    serviceWord: 'услуга',
    estimatePrefix: 'Расчёт на сайте —',
  },
  content: {
    unconfirmed: 'КОНТЕНТ К ПОДТВЕРЖДЕНИЮ',
    demoData: 'Demo-данные. Не для публикации.',
  },
};

const en: Dictionary = {
  brand: { name: 'Nikita Sokolov', descriptor: 'Photo / Video / Visual Production' },
  nav: {
    portfolio: 'Portfolio',
    albums: 'Full weddings',
    services: 'Services',
    cases: 'Cases',
    showreel: 'Showreel',
    work: 'Work',
    experience: 'Experience & credits',
    pricing: 'Pricing',
    blog: 'Journal',
    about: 'About',
    contact: 'Contact',
  },
  directions: { private: 'Private', business: 'Business', production: 'Production' },
  common: {
    skipToContent: 'Skip to main content',
    mainNavigation: 'Main navigation',
    openMenu: 'Open menu',
    closeMenu: 'Close menu',
    chooseDirection: 'Choose a direction',
    filterBy: 'Filter',
    allDirections: 'All directions',
    currentDirection: 'Current direction',
    language: 'Language',
    switchToOther: 'Переключить на русский',
    home: 'Home',
    breadcrumb: 'You are here',
    readMore: 'Read',
    viewAll: 'View all',
    year: 'Year',
    client: 'Client',
    role: 'Role',
    credits: 'Credits',
    relatedProjects: 'Related projects',
    relatedArticles: 'Related notes',
    relatedCases: 'Related cases',
    relatedServices: 'Related services',
    backstageNotes: 'Backstage & notes',
    finalCase: 'Final case',
    moreFromDirection: 'More from this direction',
    testimonials: 'Reviews',
    included: 'Always included',
    formats: 'Formats',
    deliverables: 'What you get',
    process: 'Process',
    faq: 'FAQ',
    challenge: 'Challenge',
    solution: 'Solution',
    result: 'Result',
  },
  states: {
    emptyTitle: 'Nothing here yet',
    emptyBody: 'This section is being filled. Meanwhile, explore the rest of this direction.',
    notFoundTitle: 'Page not found',
    notFoundBody: 'The address may have changed. Pick a direction below or get in touch.',
    errorTitle: 'Something went wrong',
    errorBody: 'The page failed to load. Please try again.',
    retry: 'Try again',
    goToStart: 'All directions',
    goToDirectionHome: 'Direction home',
  },
  fallback: {
    notice: 'This page is currently available in Russian only.',
    short: 'RU only',
  },
  media: {
    playVideo: 'Play video',
    watchShowreel: 'Watch showreel with sound',
    videoConsent:
      'The player loads from a third-party service and receives your browser data.',
    videoConsentAction: 'Load and play',
    openGallery: 'Open in gallery',
    closeGallery: 'Close gallery',
    previous: 'Previous',
    next: 'Next',
    imageOf: 'of',
  },
  calculator: {
    heading: 'Estimate the cost',
    formats: 'What we shoot',
    photo: 'Photo',
    video: 'Video',
    shootType: 'Type of shoot',
    hours: 'Hours of shooting',
    hoursUnit: { one: 'hour', few: 'hours', many: 'hours' },
    pickFormat: 'Choose photo, video, or both.',
    bundleDiscount: 'Photo and video together',
    subtotal: 'Subtotal',
    total: 'Total',
    perHourNow: 'Last hour',
    cta: 'Discuss the shoot',
    formatsJoiner: ' and ',
  },
  albums: {
    lead: 'The portfolio holds the best frames from many weddings. Each album here is one whole day, from the morning preparations to the last dance.',
    promoLabel: 'Full series',
    promoTitle: 'See a whole wedding',
    promoBody: 'Below are selected frames from many weddings. To see what a full day looks like, open a complete album.',
    promoAction: 'Open the albums',
    openGallery: 'View the gallery',
    externalHint: 'opens in a new tab',
    emptyTitle: 'Albums are on the way',
    emptyBody: 'Full series are being prepared. Get in touch and I will send a link to a fitting shoot.',
  },
  pricing: {
    from: 'from',
    packages: 'Packages',
    packagesUnit: { one: 'package', few: 'packages', many: 'packages' },
    bothFormats: 'Photo and video',
    onRequest: 'on request',
    individualEstimate: 'Individual estimate',
    extras: 'Extras',
    combinedDiscount: 'Book photo and video together and the total is 10% lower.',
  },
  contact: {
    heading: 'Get in touch',
    button: 'Get in touch',
    homeLead: 'Write in whichever messenger suits you — I answer personally, no forms, no waiting.',
    pickChannel: 'Where would you like to write?',
    pickChannelLead: 'The message is ready — just hit send.',
    close: 'Close',
    messageLabel: 'Message',
    copy: 'Copy',
    copied: 'Copied',
    pasteHint: 'MAX cannot prefill text: the message will be copied, paste it into the chat.',
    call: 'Call',
    directContacts: 'Direct contacts',
    greeting: 'Hello! I am writing from your website.',
    subjectPrefix: 'I am interested in',
    packageWord: 'the package',
    serviceWord: 'the service',
    estimatePrefix: 'Website estimate —',
  },
  content: {
    unconfirmed: 'CONTENT TO BE CONFIRMED',
    demoData: 'Demo data. Not for publication.',
  },
};

const dictionaries: Record<Locale, Dictionary> = { ru, en };

export function getDictionary(locale: Locale): Dictionary {
  return dictionaries[locale];
}
