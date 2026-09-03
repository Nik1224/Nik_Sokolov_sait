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
    packages: string;
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
    showMore: string;
    /** Вкладки портфолио. */
    photos: string;
    videos: string;
    reels: string;
    /** Подпись переключателя вкладок для озвучки. */
    sectionLegend: string;
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
  /**
   * Страница для организаторов. Текст держится здесь, а не в компоненте:
   * это редактируемый контент, и он обязан существовать на двух языках.
   */
  partners: {
    title: string;
    lead: string;
    promiseLabel: string;
    promise: string;
    promiseBody: string;
    packLabel: string;
    packTitle: string;
    pack: { title: string; body: string }[];
    whyLabel: string;
    whyTitle: string;
    why: { title: string; body: string }[];
    rightsLabel: string;
    rightsTitle: string;
    rights: string[];
    startLabel: string;
    startTitle: string;
    startBody: string;
    startAction: string;
    /** Полоса на Home: организатор не станет искать раздел в подвале. */
    teaserTitle: string;
    teaserBody: string;
    teaserAction: string;
    /** Подпись и текст рядом с портретом. */
    portraitAlt: string;
    portraitBody: string;
    /** Ссылка-визитка, которую организатор пересылает паре. */
    cardLabel: string;
    cardTitle: string;
    cardBody: string;
    cardAction: string;
    /** Деньги и документы: сказать нужно, выпячивать — нет. */
    termsFee: string;
    termsInvoice: string;
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
    /** Ставки в начале страницы: с них человек и начинает считать. */
    rates: string;
    photographerHour: string;
    videographerHour: string;
    ratesNote: string;
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
    /** Начало письма организатора: он проверяет дату, а не заказывает съёмку. */
    plannerDate: string;
    /** Чем человек интересуется, если он пришёл с Home ветки. */
    directionSubject: { private: string; business: string; production: string };
    subjectPrefix: string;
    packageWord: string;
    serviceWord: string;
    estimatePrefix: string;
  };
  /** Визитка: страница, которую организатор пересылает паре. */
  card: {
    title: string;
    /** Заголовок превью ссылки: имя в нём уже есть, бренд дублировать нельзя. */
    metaTitle: string;
    lead: string;
    portraitAlt: string;
    about: string[];
    includedTitle: string;
    framesTitle: string;
    framesBody: string;
    albumsTitle: string;
    albumsBody: string;
    backstageTitle: string;
    backstageBody: string;
    contactTitle: string;
    contactBody: string;
    siteLink: string;
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
    partners: 'Организаторам',
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
    packages: 'Пакетные предложения',
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
    showMore: 'Показать ещё',
    photos: 'Фото',
    videos: 'Видео',
    reels: 'Reels',
    sectionLegend: 'Что посмотреть',
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
    lead: 'В портфолио — лучшие кадры с разных свадеб. Здесь каждый альбом — одна съёмка от начала до конца: где-то три часа, где-то весь день.',
    promoLabel: 'Полные серии',
    promoTitle: 'Посмотреть съёмку целиком',
    promoBody: 'Ниже — избранные кадры с разных свадеб. Если хотите увидеть съёмку целиком, а не выборку, откройте полный альбом.',
    promoAction: 'Открыть альбомы',
    openGallery: 'Смотреть галерею',
    externalHint: 'откроется в новой вкладке',
    emptyTitle: 'Альбомы скоро появятся',
    emptyBody: 'Полные серии готовятся к публикации. Напишите — пришлю ссылку на подходящую съёмку.',
  },
  partners: {
    title: 'Организаторам',
    lead: 'Страница для тех, кто собирает свадьбу целиком. Здесь про то, что вы получаете со съёмки и в какой срок — без переписки «а можно фото?» через месяц.',
    promiseLabel: 'Главное',
    promise: 'Папка с вашей работой приходит через три дня после свадьбы. Сама, без напоминаний, по договору.',
    promiseBody: 'Тот же срок, что у пары: анонс собирается один раз, и ваша выборка идёт в нём. Через три дня у вас на руках кадры площадки, декора и деталей — пока свадьба ещё свежая и её есть смысл показывать.',
    packLabel: 'Что в папке',
    packTitle: 'Кадры вашей работы, а не только пары',
    pack: [
      {
        title: 'Площадка до гостей',
        body: 'Арка, зал, накрытые столы, рассадка, детали. Я всегда снимаю это за десять-пятнадцать минут до того, как войдут люди: позже такого кадра уже не существует.',
      },
      {
        title: 'Декор крупно',
        body: 'Композиции, флористика, полиграфия, текстиль, свет. То, что вы согласовывали месяцами и что на общем плане не читается.',
      },
      {
        title: 'Вертикальное видео',
        body: 'Короткий ролик площадки под соцсети: вертикальный, без звука, готовый к публикации. Не кадр из фильма через месяц, а отдельный материал в те же три дня.',
      },
      {
        title: 'Зал в работе',
        body: 'Как это выглядит, когда пришли гости: свет, реакция людей, живой вечер. Пустая площадка показывает замысел, полная — что он сработал.',
      },
      {
        title: 'Горизонталь и вертикаль',
        body: 'Ключевые кадры отдаю в двух кадрированиях. Лента и сторис требуют разного, и обрезать чужую фотографию — почти всегда испортить её.',
      },
      {
        title: 'Сет под публикацию',
        body: 'Если подаёте свадьбу в издание — соберу полный набор по их требованиям и пришлю список того, что нужно указать.',
      },
    ],
    whyLabel: 'Почему я',
    whyTitle: 'Отдать фотографии готов почти каждый. Разница в трёх вещах',
    why: [
      {
        title: 'Это обязательство, а не одолжение',
        body: 'Срок и состав папки записаны в договоре со мной. «Пришлю, как разберу» — не то же самое, что дата: вам не придётся напоминать, объяснять срочность и ждать, когда у человека дойдут руки.',
      },
      {
        title: 'Видео, а не только кадры',
        body: 'Фото и видео — из одного источника, поэтому вертикальный ролик площадки не нужно ни у кого выпрашивать и он выйдет в одном цвете с фотографиями. У фотографа без видео его нет вовсе, у видеографа он будет через месяц — и в его цвете, не в вашем.',
      },
      {
        title: 'Школа, которую можно назвать',
        body: 'Личное наставничество у Арсения Прусакова, Serial Killer 3.0 у Артура Погосяна, учился у Игоря Цаплина. Фотограф во втором поколении: отец тоже снимает фото и видео. Срок и папку может пообещать кто угодно, а это — то, что вы скажете клиенту, когда он спросит, кого вы советуете и почему.',
      },
    ],
    rightsLabel: 'Права',
    rightsTitle: 'Что можно делать с кадрами',
    rights: [
      'Публиковать в портфолио, на сайте и в соцсетях — без отдельного запроса каждый раз.',
      'Указывать автора съёмки: имя в подписи или отметка в публикации.',
      'Не перекрашивать и не накладывать фильтры: цвет — часть работы, и в чужой обработке кадр перестаёт быть моим.',
      'Кадрировать под формат площадки можно; ключевые кадры я и так отдаю в двух вариантах.',
      'Использование в платной рекламе обсуждается отдельно — это не запрет, а просто другой разговор.',
    ],
    startLabel: 'Как начать',
    startTitle: 'Проверить дату можно до того, как называть меня клиенту',
    startBody: 'Напишите дату и площадку — отвечу, свободен ли я, и пришлю примеры полных свадеб, а не выборку лучших кадров. Если дата занята, скажу сразу: подставлять вас перед клиентом молчанием — плохая идея.',
    startAction: 'Проверить дату',
    teaserTitle: 'Вы свадебный организатор?',
    teaserBody: 'Через три дня после съёмки вы получаете свою папку — площадка, декор, детали и вертикальное видео. Плюс письменное разрешение публиковать.',
    teaserAction: 'Что вы получаете',
    portraitAlt: 'Никита Соколов',
    cardLabel: 'Ссылка для пары',
    cardTitle: 'Страница, которую можно просто переслать',
    cardBody:
      'Если пара спросит, кого вы советуете, — отправьте эту ссылку. Одна страница без меню и лишних переходов: кто я, что входит в съёмку и кадры. Ничего продающего, чтобы человек мог спокойно посмотреть и решить сам.',
    cardAction: 'Открыть страницу',
    termsFee: 'Организаторское вознаграждение — 10% от суммы съёмки.',
    termsInvoice:
      'Нужен расчёт по счёту — не вопрос: есть ИП и электронный документооборот. Договор, счёт и закрывающие без лишней бумажной возни.',
    portraitBody:
      'Меня зовут Никита Соколов. Камерную свадьбу закрою один, на крупный проект соберу команду: у меня продакшн, и масштаб подбирается под задачу, а не наоборот. Договариваетесь вы в любом случае со мной, и отвечаю за результат тоже я.',
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
    rates: 'Час работы',
    photographerHour: 'Фотограф',
    videographerHour: 'Видеограф',
    ratesNote: 'На свадебной съёмке с четвёртого часа ставка снижается.',
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
    plannerDate:
      'Добрый день! Пишу как свадебный организатор.\nХотелось бы узнать, свободна ли у вас дата:',
    directionSubject: {
      private: 'частная съёмка',
      business: 'съёмка для компании',
      production: 'production-проект',
    },
    subjectPrefix: 'Интересует',
    packageWord: 'пакет',
    serviceWord: 'услуга',
    estimatePrefix: 'Расчёт на сайте —',
  },
  card: {
    title: 'Никита Соколов',
    metaTitle: 'Никита Соколов — свадебный и семейный фотограф',
    lead: 'Свадебный фотограф и видеограф. База — Москва, снимаю по всему миру. Эту страницу вам прислали, чтобы вы могли познакомиться со мной до разговора.',
    portraitAlt: 'Никита Соколов',
    about: [
      'Фотограф во втором поколении: отец тоже снимает фото и видео, и камера была в доме раньше, чем я научился ею пользоваться. Сам снимаю с четырнадцати лет.',
      'Прошёл личное наставничество у Арсения Прусакова, курс Serial Killer 3.0 у Артура Погосяна, учился у Игоря Цаплина.',
      'Снимаю фото и видео сам, за спиной продакшн Lokos.pro. Камерная съёмка остаётся между нами; там, где нужна команда, она собирается под задачу.',
      'Вам не нужно уметь позировать. Это моя работа — подсказать и показать, а ваша — прожить свой день.',
    ],
    includedTitle: 'Что входит в съёмку',
    framesTitle: 'Свадьбы',
    framesBody: 'Кадры, фильмы и вертикальные ролики. Нажмите, чтобы открыть целиком.',
    backstageTitle: 'Как проходит съёмка',
    backstageBody:
      'Кадры с площадки: как это выглядит со стороны. Полезно посмотреть заранее — сразу понятно, много ли фотограф командует и как ведёт себя рядом весь день.',
    albumsTitle: 'Свадьбы целиком',
    albumsBody:
      'Отдельные кадры показывают уровень, целая свадьба — ровность: как снято утро, как справился с тёмным залом, не развалился ли цвет к вечеру. Здесь съёмки от начала до конца, без выборки.',
    contactTitle: 'Если откликнулось',
    contactBody:
      'Скажите об этом вашему организатору — он всё устроит: сверит дату, соберёт смету и назначит разговор.',
    siteLink: 'Посмотреть сайт целиком',
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
    partners: 'For planners',
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
    packages: 'Package offers',
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
    showMore: 'Show more',
    photos: 'Photos',
    videos: 'Video',
    reels: 'Reels',
    sectionLegend: 'What to watch',
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
    lead: 'The portfolio holds the best frames from many weddings. Each album here is one shoot from start to finish — sometimes three hours, sometimes the whole day.',
    promoLabel: 'Full series',
    promoTitle: 'See a whole shoot',
    promoBody: 'Below are selected frames from many weddings. To see a whole shoot rather than a selection, open a complete album.',
    promoAction: 'Open the albums',
    openGallery: 'View the gallery',
    externalHint: 'opens in a new tab',
    emptyTitle: 'Albums are on the way',
    emptyBody: 'Full series are being prepared. Get in touch and I will send a link to a fitting shoot.',
  },
  partners: {
    title: 'For planners',
    lead: 'A page for the people who assemble the whole wedding. What you get from the shoot and how soon — without the "any chance of photos?" exchange a month later.',
    promiseLabel: 'The main thing',
    promise: 'A folder with your work arrives three days after the wedding. By itself, without reminders, by contract.',
    promiseBody: 'The same deadline the couple gets: the preview is put together once, and your selection goes into it. Three days later you have the venue, the decor and the details — while the wedding is still fresh and worth showing.',
    packLabel: 'What is in the folder',
    packTitle: 'Frames of your work, not only of the couple',
    pack: [
      {
        title: 'The venue before the guests',
        body: 'The arch, the hall, the laid tables, the seating, the details. I always shoot this ten or fifteen minutes before people come in: later that frame no longer exists.',
      },
      {
        title: 'Decor up close',
        body: 'Arrangements, flowers, stationery, textiles, lighting. The things you spent months agreeing on and that a wide shot does not read.',
      },
      {
        title: 'Vertical video',
        body: 'A short vertical clip of the venue for social media, silent and ready to post. Not a still from a film a month later, but its own deliverable within the same three days.',
      },
      {
        title: 'The room in use',
        body: 'What it looks like once the guests arrive: the light, the reactions, the evening alive. An empty venue shows the intention; a full one shows that it worked.',
      },
      {
        title: 'Landscape and vertical',
        body: 'Key frames come in two crops. A feed and a story need different shapes, and cropping someone else’s photograph usually spoils it.',
      },
      {
        title: 'A set for submission',
        body: 'If you are submitting the wedding to a publication, I will put together the full set to their requirements and send the credits list.',
      },
    ],
    whyLabel: 'Why me',
    whyTitle: 'Almost anyone will hand over photographs. The difference is in three things',
    why: [
      {
        title: 'It is an obligation, not a favour',
        body: 'The deadline and the contents of the folder are written into my contract. "I will send them once I have sorted through" is not the same as a date: you will not have to remind, explain the urgency and wait for someone to get round to it.',
      },
      {
        title: 'Video, not only stills',
        body: 'Photo and video come from one source, so the vertical clip of the venue does not have to be begged for and it comes graded to match the photographs. A photographer without video does not have it at all; a videographer will deliver it a month later, in their look rather than yours.',
      },
      {
        title: 'A background you can name',
        body: 'Personal mentorship with Arseniy Prusakov, Serial Killer 3.0 with Artur Poghosyan, studies with Igor Tsaplin. A second-generation photographer: my father shoots photo and video too. Anyone can promise a deadline and a folder; this is what you tell a client when they ask who you are recommending and why.',
      },
    ],
    rightsLabel: 'Rights',
    rightsTitle: 'What you may do with the frames',
    rights: [
      'Publish them in your portfolio, on your site and on social media — without asking each time.',
      'Credit the photographer: a name in the caption or a tag in the post.',
      'Do not re-grade them or apply filters: colour is part of the work, and in someone else’s edit the frame stops being mine.',
      'Cropping to fit a platform is fine; key frames come in two crops anyway.',
      'Use in paid advertising is agreed separately — not a refusal, simply a different conversation.',
    ],
    startLabel: 'How to start',
    startTitle: 'Check the date before you name me to a client',
    startBody: 'Send me the date and the venue and I will tell you whether I am free, along with complete weddings rather than a selection of best frames. If the date is taken I will say so straight away: leaving you to find out later in front of a client is a bad idea.',
    startAction: 'Check a date',
    teaserTitle: 'Are you a wedding planner?',
    teaserBody: 'Three days after the shoot you get your own folder — the venue, the decor, the details and a vertical clip. Plus written permission to publish.',
    teaserAction: 'What you receive',
    portraitAlt: 'Nikita Sokolov',
    cardLabel: 'A link for the couple',
    cardTitle: 'A page you can simply forward',
    cardBody:
      'When a couple asks who you recommend, send them this link. One page with no menu and nowhere to wander off to: who I am, what the shoot includes, and the frames. Nothing salesy, so they can look and decide for themselves.',
    cardAction: 'Open the page',
    termsFee: 'The planner’s fee is 10% of the shoot.',
    termsInvoice:
      'Payment by invoice is no problem: sole proprietorship and electronic document exchange. Contract, invoice and closing documents without the paperwork.',
    portraitBody:
      'My name is Nikita Sokolov. A small wedding I cover alone; for a large project I bring a crew — I run a production company, and the scale is matched to the job rather than the other way round. Either way you deal with me, and I am the one answerable for the result.',
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
    rates: 'Hourly rate',
    photographerHour: 'Photographer',
    videographerHour: 'Videographer',
    ratesNote: 'On a wedding shoot the rate drops from the fourth hour.',
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
    plannerDate:
      'Hello! I am a wedding planner.\nI would like to know whether you are free on:',
    directionSubject: {
      private: 'a private shoot',
      business: 'a shoot for a company',
      production: 'a production project',
    },
    subjectPrefix: 'I am interested in',
    packageWord: 'the package',
    serviceWord: 'the service',
    estimatePrefix: 'Website estimate —',
  },
  card: {
    title: 'Nikita Sokolov',
    metaTitle: 'Nikita Sokolov — wedding and family photographer',
    lead: 'Wedding photographer and videographer. Based in Moscow, shooting worldwide. This page was sent to you so you can get to know me before we talk.',
    portraitAlt: 'Nikita Sokolov',
    about: [
      'A second-generation photographer: my father shoots photo and video too, and there was a camera in the house before I knew how to use one. I have been shooting since I was fourteen.',
      'Personal mentorship with Arseniy Prusakov, the Serial Killer 3.0 course with Artur Poghosyan, studies with Igor Tsaplin.',
      'I shoot photo and video myself, with the Lokos.pro production company behind me. An intimate shoot stays between us; where a crew is needed, it is assembled for the job.',
      'You do not need to know how to pose. That is my job — to guide and to show. Yours is to live your day.',
    ],
    includedTitle: 'What the shoot includes',
    framesTitle: 'Weddings',
    framesBody: 'Frames, films and vertical clips. Tap to open in full.',
    backstageTitle: 'How a shoot goes',
    backstageBody:
      'Frames from the day itself: what it looks like from the outside. Worth a look in advance — it shows straight away how much the photographer directs and what they are like to have around all day.',
    albumsTitle: 'Whole weddings',
    albumsBody:
      'Single frames show the level; a whole wedding shows consistency — how the morning was handled, how a dark hall was managed, whether the colour holds together by the evening. These are shoots from start to finish, with nothing left out.',
    contactTitle: 'If this resonates',
    contactBody:
      'Tell your planner — they will take it from there: check the date, put together a quote and set up a conversation.',
    siteLink: 'See the whole site',
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
