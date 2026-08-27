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
  pricing: {
    from: string;
    onRequest: string;
    individualEstimate: string;
    extras: string;
    combinedDiscount: string;
  };
  form: {
    heading: string;
    name: string;
    email: string;
    phone: string;
    taskType: string;
    date: string;
    city: string;
    formatsField: string;
    budget: string;
    budgetOptional: string;
    message: string;
    consent: string;
    submit: string;
    required: string;
    invalidEmail: string;
    successTitle: string;
    successBody: string;
    deliveryFailed: string;
    tooManyRequests: string;
    /** Транспорт заявок не подключён до подтверждения получателя (§18). */
    channelPending: string;
    directContacts: string;
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
  pricing: {
    from: 'от',
    onRequest: 'по запросу',
    individualEstimate: 'Индивидуальная смета',
    extras: 'Дополнительно',
    combinedDiscount: 'При заказе фото и видео вместе — скидка 10% на общий чек.',
  },
  form: {
    heading: 'Оставить заявку',
    name: 'Имя',
    email: 'Email',
    phone: 'Телефон или мессенджер',
    taskType: 'Тип задачи',
    date: 'Дата съёмки',
    city: 'Город',
    formatsField: 'Нужные форматы',
    budget: 'Бюджет',
    budgetOptional: 'необязательно',
    message: 'Сообщение',
    consent: 'Согласен на обработку персональных данных',
    submit: 'Отправить заявку',
    required: 'Обязательное поле',
    invalidEmail: 'Проверьте адрес электронной почты',
    successTitle: 'Заявка отправлена',
    successBody: 'Спасибо! Отвечу в ближайшее время. Если вопрос срочный — пишите в мессенджер.',
    deliveryFailed: 'Не удалось отправить заявку. Попробуйте ещё раз или напишите напрямую.',
    tooManyRequests: 'Слишком много попыток подряд. Подождите минуту и повторите.',
    channelPending:
      'Отправка заявок через форму пока не подключена. Напишите напрямую — отвечу так же быстро.',
    directContacts: 'Прямые контакты',
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
  pricing: {
    from: 'from',
    onRequest: 'on request',
    individualEstimate: 'Individual estimate',
    extras: 'Extras',
    combinedDiscount: 'Book photo and video together and the total is 10% lower.',
  },
  form: {
    heading: 'Send a request',
    name: 'Name',
    email: 'Email',
    phone: 'Phone or messenger',
    taskType: 'Type of work',
    date: 'Shooting date',
    city: 'City',
    formatsField: 'Formats needed',
    budget: 'Budget',
    budgetOptional: 'optional',
    message: 'Message',
    consent: 'I consent to the processing of my personal data',
    submit: 'Send request',
    required: 'This field is required',
    invalidEmail: 'Please check the email address',
    successTitle: 'Request sent',
    successBody: 'Thank you — I will reply shortly. For anything urgent, use a messenger.',
    deliveryFailed: 'The request could not be sent. Please try again or get in touch directly.',
    tooManyRequests: 'Too many attempts in a row. Please wait a minute and try again.',
    channelPending:
      'Form submissions are not connected yet. Please use the direct contacts below — I reply just as fast.',
    directContacts: 'Direct contacts',
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
