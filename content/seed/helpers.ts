/**
 * Хелперы для seed-данных. Все записи помечены `isDemo: true` (ТЗ §15.2):
 * это кандидаты на замену реальным контентом, а не готовый материал.
 */

import type { Blocks, ImageRef, LocaleBlocks, MediaAsset } from '../types';

/** Детерминированный ключ: одинаков на сервере и клиенте, без коллизий. */
function keyFrom(seed: string): string {
  let hash = 5381;
  for (let i = 0; i < seed.length; i++) hash = ((hash << 5) + hash + seed.charCodeAt(i)) | 0;
  return 'k' + Math.abs(hash).toString(36);
}

export function blocks(...paragraphs: string[]): Blocks {
  return paragraphs.map((text, index) => ({
    _type: 'block',
    _key: keyFrom(`${index}:${text}`),
    style: 'normal',
    markDefs: [],
    children: [{ _type: 'span', _key: keyFrom(`s${index}:${text}`), text, marks: [] }],
  }));
}

/** Тело только на русском — EN-версия появится, когда её напишут (§4.1). */
export function bodyRu(...paragraphs: string[]): LocaleBlocks {
  return { ru: blocks(...paragraphs) };
}

/** Тело в обоих языках. */
export function bodyRuEn(ruParagraphs: string[], enParagraphs: string[]): LocaleBlocks {
  return { ru: blocks(...ruParagraphs), en: blocks(...enParagraphs) };
}

const SIZES = {
  wide: { width: 1920, height: 1080 },
  still: { width: 2000, height: 1333 },
  tall: { width: 1200, height: 1600 },
  square: { width: 1400, height: 1400 },
} as const;

type Shape = keyof typeof SIZES;

export function img(shape: Shape, index: number, focalPoint?: { x: number; y: number }): ImageRef {
  const n = ((index - 1) % 6) + 1;
  return { src: `/placeholders/${shape}-${n}.svg`, ...SIZES[shape], focalPoint };
}

export function image(
  id: string,
  shape: Shape,
  index: number,
  altRu: string,
  altEn: string,
  caption?: { ru: string; en: string },
): MediaAsset {
  return {
    _key: keyFrom(id),
    type: 'image',
    image: img(shape, index),
    alt: { ru: altRu, en: altEn },
    caption,
    rights: 'owned',
  };
}

/** Декоративное изображение: пустой alt — ассистивные технологии его пропустят (§11). */
export function decorative(id: string, shape: Shape, index: number): MediaAsset {
  return {
    _key: keyFrom(id),
    type: 'image',
    image: img(shape, index),
    alt: { ru: '', en: '' },
    rights: 'owned',
  };
}

/**
 * Демо-видео без стороннего провайдера: постер есть, воспроизведение
 * недоступно до подключения реального видеохостинга (этап 4).
 */
export function video(
  id: string,
  posterIndex: number,
  altRu: string,
  altEn: string,
  durationSeconds?: number,
): MediaAsset {
  return {
    _key: keyFrom(id),
    type: 'video',
    provider: 'file',
    poster: img('wide', posterIndex),
    alt: { ru: altRu, en: altEn },
    rights: 'owned',
    durationSeconds,
  };
}
