/**
 * Преобразование ответов Sanity в контентные типы приложения.
 *
 * Компоненты не должны знать про `asset->`, hotspot и метаданные — вся эта
 * специфика заканчивается здесь.
 */

import type { ImageRef, MediaAsset, MediaRights, VideoProvider } from '../types';

type RawImage = {
  hotspot?: { x: number; y: number } | null;
  asset?: {
    url?: string;
    metadata?: { dimensions?: { width: number; height: number }; lqip?: string };
  } | null;
} | null;

export function mapImage(raw: RawImage): ImageRef | null {
  const asset = raw?.asset;
  if (!asset?.url) return null;

  const dimensions = asset.metadata?.dimensions;
  return {
    // Базовый URL без параметров: размеры и формат подставит lib/media.
    src: asset.url,
    width: dimensions?.width ?? 0,
    height: dimensions?.height ?? 0,
    lqip: asset.metadata?.lqip,
    focalPoint: raw?.hotspot ? { x: raw.hotspot.x, y: raw.hotspot.y } : undefined,
  };
}

type RawMedia = {
  _key?: string;
  type?: 'image' | 'video';
  decorative?: boolean;
  alt?: { ru?: string; en?: string } | null;
  caption?: { ru?: string; en?: string } | null;
  credit?: string | null;
  rights?: MediaRights | null;
  provider?: VideoProvider | null;
  videoId?: string | null;
  url?: string | null;
  durationSeconds?: number | null;
  image?: RawImage;
  poster?: RawImage;
} | null;

export function mapMedia(raw: RawMedia): MediaAsset | null {
  if (!raw) return null;

  // Декоративное изображение получает пустой alt: assistive tech его пропустит.
  const alt = raw.decorative ? { ru: '', en: '' } : (raw.alt ?? { ru: '' });
  const common = {
    _key: raw._key ?? 'media',
    alt,
    caption: raw.caption ?? undefined,
    credit: raw.credit ?? undefined,
    rights: raw.rights ?? 'pending',
  };

  if (raw.type === 'video') {
    const poster = mapImage(raw.poster ?? null);
    // Без постера видео не отдаём: это требование §10, а не косметика.
    if (!poster) return null;
    return {
      ...common,
      type: 'video',
      provider: raw.provider ?? 'file',
      videoId: raw.videoId ?? undefined,
      url: raw.url ?? undefined,
      poster,
      durationSeconds: raw.durationSeconds ?? undefined,
    };
  }

  const image = mapImage(raw.image ?? null);
  if (!image) return null;
  return { ...common, type: 'image', image };
}

export function mapMediaList(raw: RawMedia[] | null | undefined): MediaAsset[] {
  if (!raw) return [];
  return raw.map(mapMedia).filter((item): item is MediaAsset => item !== null);
}

/** Отбрасывает пустые ссылки: удалённая запись не должна ломать связь. */
export function compactSlugs(raw: (string | null)[] | null | undefined): string[] {
  return (raw ?? []).filter((slug): slug is string => Boolean(slug));
}
