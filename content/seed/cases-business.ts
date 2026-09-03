/**
 * Кейсы ветки BUSINESS — настоящие проекты, не demo.
 *
 * Кадры лежат в `public/media/cases/<slug>` в двух размерах: 600 для телефона
 * и исходная ширина для сетки. Третьего размера (1800) у фотографий нет
 * намеренно — исходники пришли с телефона, шире 1280 их не существует, и
 * растягивать вверх значит утяжелять файл без прибавки в качестве. У постера
 * ролика все три размера: он снят с видео 1920×1080.
 *
 * Имя клиента и цифры результата — только подтверждённые (ТЗ §1.2, §5.5).
 */

import type { MediaAsset, Project } from '../types';
import { blocks } from './helpers';

function shot(
  folder: string,
  id: string,
  widths: number[],
  width: number,
  height: number,
  altRu: string,
  altEn: string,
  caption?: { ru: string; en: string },
): MediaAsset {
  const base = `/media/cases/${folder}`;
  return {
    _key: `${folder}-${id}`,
    type: 'image',
    rights: 'owned',
    alt: { ru: altRu, en: altEn },
    caption,
    image: {
      src: `${base}/${id}-${width}.jpg`,
      width,
      height,
      sources: widths.map((size) => ({ width: size, src: `${base}/${id}-${size}.jpg` })),
    },
  };
}

/**
 * Готовый ролик с Kinescope.
 *
 * Своим файлом такое не отдаётся: исходник — 142 МБ, и в репозитории он дал бы
 * этот вес каждой сборке навсегда, без перемотки и без подстройки под скорость
 * сети. То же правило, что у бэкстейджа.
 *
 * Постер снят с исходника, а не взят у сервиса: тот подставляет первый кадр,
 * а там ещё пустой стол. Секунда записана здесь же — чтобы поменять кадр,
 * ролик разбирать заново не нужно.
 */
function clip(
  folder: string,
  id: string,
  videoId: string,
  durationSeconds: number,
  poster: { widths: number[]; width: number; height: number },
  altRu: string,
  altEn: string,
  caption?: { ru: string; en: string },
): MediaAsset {
  const base = `/media/cases/${folder}`;
  return {
    _key: `${folder}-${id}`,
    type: 'video',
    provider: 'kinescope',
    videoId,
    rights: 'owned',
    durationSeconds,
    alt: { ru: altRu, en: altEn },
    caption,
    poster: {
      src: `${base}/${id}-${poster.width}.jpg`,
      width: poster.width,
      height: poster.height,
      sources: poster.widths.map((size) => ({ width: size, src: `${base}/${id}-${size}.jpg` })),
    },
  };
}

/**
 * Кейсы идут в порядке `order`: свежий сверху.
 *
 * Обучающие ролики EPICA Professional.
 *
 * Восемнадцать роликов по продукту для внутреннего обучения: два дня технологи,
 * третий — менеджеры. Съёмка 2024 года.
 */
export const businessCases: Project[] = [
  {
    _id: 'case.sesderma-anniversary',
    slug: 'brand-anniversary-evening',
    status: 'published',
    directions: ['business'],
    categorySlugs: ['conference'],
    year: 2025,
    featured: true,
    order: 1,
    client: 'Sesderma',
    title: { ru: 'Десять лет бренда: вечер на 300 гостей', en: 'Ten years of the brand: an evening for 300' },
    role: {
      ru: 'Фотограф, сбор и координация съёмочной группы',
      en: 'Photographer, assembling and running the crew',
    },
    lead: {
      ru: 'Восемь часов программы, группа из девяти человек, фотографии у заказчика на следующий день.',
      en: 'Eight hours of programme, a crew of nine, photographs delivered to the client the next day.',
    },
    /*
     * Цифры из брифа и с площадки: число гостей и часов — от заказчика,
     * размер группы и объём выдачи — свои.
     */
    figures: [
      { value: { ru: '300+', en: '300+' }, label: { ru: 'гостей', en: 'guests' } },
      { value: { ru: '8 часов', en: '8 hours' }, label: { ru: 'съёмки', en: 'of shooting' } },
      { value: { ru: '9', en: '9' }, label: { ru: 'человек в группе', en: 'in the crew' } },
      { value: { ru: '1000+', en: '1000+' }, label: { ru: 'фотографий', en: 'photographs' } },
    ],
    challenge: {
      ru: blocks(
        'Десятилетие компании: больше трёхсот гостей и восемь часов непрерывной программы. Фотозона, ужин, сцена — ведущие Антон Лаврентьев и Алина Астровская, артисты, выступление президента корпорации Габриэля Серрано, — и танцпол до ночи. У такого вечера нет второго дубля: что не снято, того не было.',
        'Снимать нужно было одновременно фото и видео и в нескольких точках сразу. Пока на сцене идёт номер, у фотозоны стоит очередь, а в зале происходит то, ради чего люди и приходят на юбилей, — разговоры.',
      ),
      en: blocks(
        'The company turned ten: more than three hundred guests and eight hours of uninterrupted programme. A photo zone, dinner, a stage — hosts Anton Lavrentyev and Alina Astrovskaya, performers, a speech by the corporation president Gabriel Serrano — and a dance floor until the small hours. An evening like this has no second take: whatever is not filmed did not happen.',
        'Photo and video had to run at once, in several places at once. While a number is on stage, there is a queue at the photo zone, and in the room the thing people actually come for is happening — conversation.',
      ),
    },
    solution: {
      ru: blocks(
        'Собрал группу из девяти человек — тех, с кем работал раньше. На такой площадке дороже резюме стоит слаженность: объяснять что-то по ходу вечера уже некогда.',
        'Зоны разделили заранее: фотозона, зал, сцена, танцпол — у каждого свой участок и своя задача. Группа работала на связи, в гарнитурах, чтобы перестроиться, не собираясь вместе.',
        'Фото и видео шли параллельно с первой минуты, поэтому к концу вечера материал был не грудой карт памяти, а разобранным по блокам программы.',
      ),
      en: blocks(
        'I put together a crew of nine — people I had worked with before. On a night like this, being in sync beats any CV: there is no time to explain anything once the evening starts.',
        'Zones were divided in advance: photo zone, room, stage, dance floor — each person with their own area and their own task. The crew stayed on headsets, so it could regroup without gathering in one place.',
        'Photo and video ran in parallel from the first minute, so by the end of the night the material was not a pile of memory cards but footage already sorted by blocks of the programme.',
      ),
    },
    result: {
      ru: blocks(
        'Больше тысячи фотографий в цветокоррекции и ретуши — переданы на следующий день. Тогда же ушли четыре вертикальных ролика: юбилей попал в соцсети, пока он ещё новость.',
        'Итоговое видео — клип и полный фильм о вечере — заказчик получил через две недели.',
      ),
      en: blocks(
        'More than a thousand photographs, colour-graded and retouched, were handed over the next day. Four vertical videos went out the same day, so the anniversary reached social media while it was still news.',
        'The finished video — a short cut and a full film of the evening — was delivered two weeks later.',
      ),
    },
    cover: shot(
      'sesderma-anniversary',
      '4fa2dbe953db',
      [600, 1200],
      1200,
      800,
      'Танцпол во время программы: гости, свет и фонтаны искр',
      'The dance floor during the programme: guests, lights and sparks',
    ),
    media: [
      clip(
        'sesderma-anniversary',
        'clip-poster',
        '5j2CWcjbWFdPBp5K6QaQMS',
        106,
        { widths: [600, 1200, 1800], width: 1800, height: 1012 },
        'Кадр из клипа о вечере',
        'Frame from the film about the evening',
        {
          ru: 'Клип о вечере. Полный фильм остаётся у заказчика.',
          en: 'The short cut. The full film stays with the client.',
        },
      ),
      // Четыре вертикальных ролика — та самая выдача следующего дня.
      clip('sesderma-anniversary', 'reel-1-poster', 'nymKFh14h466KSStHx8zYW', 34, { widths: [600, 1080], width: 1080, height: 1920 }, 'Вертикальный ролик с вечера', 'Vertical video from the evening'),
      clip('sesderma-anniversary', 'reel-2-poster', 'vmwXTC6jWn8NLNGFbZLguY', 34, { widths: [600, 1080], width: 1080, height: 1920 }, 'Вертикальный ролик с вечера', 'Vertical video from the evening'),
      clip('sesderma-anniversary', 'reel-3-poster', 'ahUBooxgkdJ4ErDvQihLCC', 38, { widths: [600, 1080], width: 1080, height: 1920 }, 'Вертикальный ролик с вечера', 'Vertical video from the evening'),
      clip('sesderma-anniversary', 'reel-4-poster', '4iDyL7xFCANnaqByzQhxLa', 30, { widths: [600, 1080], width: 1080, height: 1920 }, 'Вертикальный ролик с вечера', 'Vertical video from the evening'),
      shot('sesderma-anniversary', 'e4eb297f42ce', [600, 853], 853, 1280, 'Выступление президента корпорации Габриэля Серрано', 'A speech by the corporation president Gabriel Serrano'),
      shot('sesderma-anniversary', 'eeb807ffab58', [600, 853], 853, 1280, 'Ведущие вечера Антон Лаврентьев и Алина Астровская', 'Hosts of the evening Anton Lavrentyev and Alina Astrovskaya'),
      shot('sesderma-anniversary', 'ddb91d924060', [600, 853], 853, 1280, 'Артистка во время номера', 'A performer during a number'),
      shot('sesderma-anniversary', '72d155755700', [600, 1200], 1200, 2133, 'Съёмочная группа целиком', 'The full crew'),
      shot('sesderma-anniversary', '8dcec0ddcc18', [600, 853], 853, 1280, 'Операторы в зале во время программы', 'Camera operators in the room during the programme'),
      // Бэкстейдж закрывает ленту: до этого — что получилось, здесь — как это делалось.
      clip(
        'sesderma-anniversary',
        'backstage-poster',
        'icVNyHgNDnZYjHSupUrDeq',
        67,
        { widths: [600, 1200, 1800], width: 1800, height: 1012 },
        'Кадр из бэкстейджа: группа за работой в зале',
        'Frame from the backstage film: the crew working in the room',
        {
          ru: 'Бэкстейдж: как группа работала в зале все восемь часов.',
          en: 'Backstage: how the crew worked the room for all eight hours.',
        },
      ),
    ],
    formatSlugs: ['photo-video', 'team'],
    credits: [],
  },
  {
    _id: 'case.epica-training',
    slug: 'in-house-training-videos',
    status: 'published',
    directions: ['business'],
    categorySlugs: ['education'],
    year: 2024,
    featured: true,
    order: 2,
    client: 'EPICA Professional',
    title: { ru: 'Обучающие ролики для сотрудников', en: 'In-house training videos' },
    role: { ru: 'Съёмка, монтаж, подготовка графики', en: 'Filming, editing, graphics preparation' },
    lead: {
      ru: '18 роликов общей длительностью 14,5 часа: технолог в кадре, презентация на экране.',
      en: 'Eighteen videos, 14.5 hours in total: a specialist on camera, slides on screen.',
    },
    challenge: {
      ru: blocks(
        'Компании нужна была своя система обучения: восемнадцать роликов по продукту — колористика, уход, химическая завивка, техническая линия — отдельно для технологов и отдельно для менеджеров. В сумме 14,5 часа готового материала.',
        'Это не одна смена. Человека нельзя держать в кадре восемь часов подряд, а выглядеть всё должно одинаково от первого ролика до восемнадцатого: тот же свет, тот же звук, тот же фон.',
        'Отдельная сложность пришла из презентации: присланный заказчиком PDF рассыпался в монтажной программе, и подложить его в ролики как есть было нельзя.',
      ),
      en: blocks(
        'The company needed its own training system: eighteen product videos — colouring, care, perming, the technical line — for technologists and, separately, for managers. Fourteen and a half hours of finished material in total.',
        'That is not one shooting day. Nobody can sit on camera for eight hours straight, yet everything has to look the same from the first video to the eighteenth: the same light, the same sound, the same background.',
        'The presentation brought a difficulty of its own: the PDF sent by the client fell apart in the editing software and could not be dropped into the videos as it was.',
      ),
    },
    solution: {
      ru: blocks(
        'Съёмку разложили на три дня примерно по пять-шесть часов — с перерывами и временем на перестановку техники. Два дня занимало обучение технологов, третий — обучение менеджеров, спикеры менялись по расписанию.',
        'Снимали на две камеры, свет выставили один раз на всю серию. Звук писали на два микрофона: второй страховал первый — переснять полуторачасовой доклад из-за одного пропавшего канала невозможно.',
        'Слайды собрали заново: около ста картинок в высоком разрешении вместо нерабочего PDF.',
        'Визажист работал на площадке все смены, поэтому спикеры выходили в кадр по очереди и весь день выглядели одинаково.',
      ),
      en: blocks(
        'The shoot was split into three days of roughly five to six hours each, with breaks and time to move the gear. Two days covered training for technologists, the third for managers, with speakers rotating on a schedule.',
        'Two cameras, one lighting setup for the whole series. Sound was recorded on two microphones, the second backing up the first — you cannot reshoot a ninety-minute talk because one channel dropped out.',
        'The slides were rebuilt from scratch: around a hundred high-resolution images in place of the broken PDF.',
        'A make-up artist stayed on set for every day, so speakers could step in one after another and look the same throughout.',
      ),
    },
    result: {
      ru: blocks(
        'Восемнадцать роликов, 14,5 часа. Монтаж занял месяц: подрезка заминок, цветокоррекция, работа со звуком.',
        'Бонусом в перерывах сняты портреты спикеров — в задаче их не было.',
      ),
      en: blocks(
        'Eighteen videos, fourteen and a half hours. The edit took a month: trimming the stumbles, colour grading, sound work.',
        'Portraits of the speakers were shot in the breaks as a bonus — they were not part of the brief.',
      ),
    },
    /*
     * Обложка горизонтальная, хотя площадка снята вертикально. Вертикальный
     * кадр в шапке кейса встаёт колонной во весь экран и отодвигает задачу с
     * решением ниже сгиба; горизонтальный ложится полосой и оставляет текст
     * на первом экране. Сама площадка показана ниже, в галерее.
     */
    /*
     * Цифры только подтверждённые: количество роликов и хронометраж — из
     * задачи заказчика, три дня и две камеры — с самой съёмки.
     */
    figures: [
      { value: { ru: '18', en: '18' }, label: { ru: 'роликов', en: 'videos' } },
      { value: { ru: '14,5 часа', en: '14.5 hours' }, label: { ru: 'материала', en: 'of material' } },
      { value: { ru: '3 дня', en: '3 days' }, label: { ru: 'съёмки', en: 'of shooting' } },
      { value: { ru: '2', en: '2' }, label: { ru: 'камеры', en: 'cameras' } },
    ],
    cover: shot(
      'epica-training',
      '72a858263dfe',
      [600, 1200],
      1200,
      800,
      'Спикер за столом на съёмочной площадке',
      'A speaker at the table on set',
    ),
    media: [
      // Результат идёт первым: за ним человек и пришёл, кадры с площадки —
      // объяснение, как он получился. Кадр постера — 60-я секунда.
      clip(
        'epica-training',
        'oxy-active-poster',
        'rGZYpW7Ecp4tA9VG7CVpkz',
        90,
        { widths: [600, 1200, 1800], width: 1800, height: 1012 },
        'Кадр из обучающего ролика: спикер и слайд об окисляющих эмульсиях',
        'Frame from a training video: a speaker and a slide about oxidising emulsions',
        {
          ru: 'Один из восемнадцати роликов: слайд на экране, спикер в кадре.',
          en: 'One of the eighteen videos: a slide on screen, a speaker on camera.',
        },
      ),
      shot(
        'epica-training',
        '205552b56890',
        [600, 720],
        720,
        1280,
        'Съёмочная площадка: спикер за белым столом под софтбоксом',
        'The set: a speaker at a white table under a softbox',
      ),
      shot(
        'epica-training',
        'dd6e9b03c67d',
        [600, 720],
        720,
        1280,
        'Оператор снимает спикера на площадке',
        'Camera operator filming a speaker on set',
      ),
      shot(
        'epica-training',
        'af21c67866e7',
        [600, 720],
        720,
        1280,
        'Общий план площадки: свет, стол и камера',
        'Wide shot of the set: light, table and camera',
      ),
      shot(
        'epica-training',
        '9748951065e6',
        [600, 720],
        720,
        1280,
        'Проверка кадра перед съёмкой',
        'Checking the frame before a take',
        {
          ru: 'Свет выставлен один раз — дальше менялись только спикеры и темы.',
          en: 'The light was set once — after that only the speakers and topics changed.',
        },
      ),
      shot(
        'epica-training',
        'ad45be5e9bff',
        [600, 720],
        720,
        1280,
        'Спикеры между дублями',
        'Speakers between takes',
      ),
      shot(
        'epica-training',
        'cf5ac70a97c0',
        [600, 853],
        853,
        1280,
        'Спикеры вдвоём',
        'Both speakers together',
        {
          ru: 'Портреты сняли в перерывах между блоками съёмки.',
          en: 'The portraits were taken during breaks between shooting blocks.',
        },
      ),
      // Горизонтальный кадр идёт последним: шесть вертикальных до него
      // укладываются в два ровных ряда, а он закрывает ленту полосой.
      shot(
        'epica-training',
        'dd7e87bf60ac',
        [600, 1200],
        1200,
        800,
        'Портрет второго спикера',
        'Portrait of the second speaker',
      ),
    ],
    formatSlugs: ['photo-video'],
    credits: [],
  },
];
