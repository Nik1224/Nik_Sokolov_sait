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

const CASE = 'epica-training';

function shot(
  id: string,
  widths: number[],
  width: number,
  height: number,
  altRu: string,
  altEn: string,
  caption?: { ru: string; en: string },
): MediaAsset {
  const base = `/media/cases/${CASE}`;
  return {
    _key: id,
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
  id: string,
  videoId: string,
  durationSeconds: number,
  altRu: string,
  altEn: string,
  caption?: { ru: string; en: string },
): MediaAsset {
  const base = `/media/cases/${CASE}`;
  const sizes = [600, 1200, 1800];
  return {
    _key: id,
    type: 'video',
    provider: 'kinescope',
    videoId,
    rights: 'owned',
    durationSeconds,
    alt: { ru: altRu, en: altEn },
    caption,
    poster: {
      src: `${base}/${id}-1800.jpg`,
      width: 1800,
      height: 1012,
      sources: sizes.map((size) => ({ width: size, src: `${base}/${id}-${size}.jpg` })),
    },
  };
}

/**
 * Обучающие ролики EPICA Professional.
 *
 * Восемнадцать роликов по продукту для внутреннего обучения: два дня технологи,
 * третий — менеджеры. Съёмка 2024 года.
 */
export const businessCases: Project[] = [
  {
    _id: 'case.epica-training',
    slug: 'in-house-training-videos',
    status: 'published',
    directions: ['business'],
    categorySlugs: ['education'],
    year: 2024,
    featured: true,
    order: 1,
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
    cover: shot(
      '205552b56890',
      [600, 720],
      720,
      1280,
      'Съёмочная площадка: спикер за белым столом под софтбоксом',
      'The set: a speaker at a white table under a softbox',
    ),
    media: [
      // Результат идёт первым: за ним человек и пришёл, кадры с площадки —
      // объяснение, как он получился. Кадр постера — 60-я секунда.
      clip(
        'oxy-active-poster',
        'rGZYpW7Ecp4tA9VG7CVpkz',
        90,
        'Кадр из обучающего ролика: спикер и слайд об окисляющих эмульсиях',
        'Frame from a training video: a speaker and a slide about oxidising emulsions',
        {
          ru: 'Один из восемнадцати роликов: слайд на экране, спикер в кадре.',
          en: 'One of the eighteen videos: a slide on screen, a speaker on camera.',
        },
      ),
      shot(
        'dd6e9b03c67d',
        [600, 720],
        720,
        1280,
        'Оператор снимает спикера на площадке',
        'Camera operator filming a speaker on set',
      ),
      shot(
        'af21c67866e7',
        [600, 720],
        720,
        1280,
        'Общий план площадки: свет, стол и камера',
        'Wide shot of the set: light, table and camera',
      ),
      shot(
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
        'ad45be5e9bff',
        [600, 720],
        720,
        1280,
        'Спикеры между дублями',
        'Speakers between takes',
      ),
      shot(
        '72a858263dfe',
        [600, 1200],
        1200,
        800,
        'Портрет спикера за столом',
        'Portrait of a speaker at the table',
      ),
      shot(
        'dd7e87bf60ac',
        [600, 1200],
        1200,
        800,
        'Портрет второго спикера',
        'Portrait of the second speaker',
      ),
      shot(
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
    ],
    formatSlugs: ['photo-video'],
    credits: [],
  },
];
