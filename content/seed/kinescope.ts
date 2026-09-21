/**
 * Ролики Kinescope как медиа сайта.
 *
 * Идентификаторы не переносятся руками: раскладка в кабинете живёт своей
 * жизнью — проекты переименовывают, ролики переносят между ними. Поэтому
 * категория берётся из выгрузки `content/kinescope-catalog.json`, а её связь
 * с категорией сайта описана в kinescope-map.ts. Обновить контент значит
 * перевыгрузить каталог, а не править список в коде.
 *
 * Постеры обязаны лежать на своём домене (§7): постер рисуется до согласия, и
 * адрес на стороннем CDN означал бы, что браузер посетителя сходил к сервису
 * ещё до нажатия «play». Их готовит scripts/kinescope-posters.mjs, а размеры
 * записаны в манифесте рядом с файлами. Ролик без постера в контент не
 * попадает: схема медиа без постера запись не публикует (§8.1, §10).
 */

import catalog from '@/content/kinescope-catalog.json';
import posterManifest from '@/public/media/kinescope/posters.json';
import type { ImageRef, MediaAsset } from '@/content/types';
import {
  KINESCOPE_CATEGORIES,
  KINESCOPE_HAND_PICKED,
  KINESCOPE_NOT_PUBLISHED,
  type KinescopeBucket,
} from './kinescope-map';

type CatalogVideo = {
  title: string;
  videoId: string;
  durationSeconds: number | null;
  resolution: string | null;
  createdAt: string;
};

type PosterEntry = { width: number; height: number; sizes: number[] };

const posters = posterManifest.posters as Record<string, PosterEntry | undefined>;

const POSTER_DIR = '/media/kinescope';

/**
 * Постер по готовым файлам. В имени стоит длинная сторона, а srcset требует
 * ширину: у вертикального ролика это разные числа, и объявить файл `-1200`
 * шириной 1200 значит заставить браузер взять вариант мельче нужного.
 */
function poster(videoId: string, entry: PosterEntry): ImageRef {
  const longest = Math.max(entry.width, entry.height);
  const largest = entry.sizes[entry.sizes.length - 1];
  return {
    src: `${POSTER_DIR}/${videoId}-${largest}.jpg`,
    width: entry.width,
    height: entry.height,
    sources: entry.sizes.map((size) => ({
      width: Math.round((size * entry.width) / longest),
      src: `${POSTER_DIR}/${videoId}-${size}.jpg`,
    })),
  };
}

/** Вертикальный ролик идёт во вкладку «Вертикальные», горизонтальный — в «Ролики». */
function bucketOf(video: CatalogVideo): KinescopeBucket {
  const [width, height] = (video.resolution ?? '').split('x').map(Number);
  return Number.isFinite(width) && Number.isFinite(height) && height > width ? 'reels' : 'videos';
}

function asset(
  video: CatalogVideo,
  entry: PosterEntry,
  alt: { ru: string; en: string },
): MediaAsset {
  return {
    _key: `ks-${video.videoId}`,
    type: 'video',
    provider: 'kinescope',
    videoId: video.videoId,
    // Ролики сняты владельцем и лежат в его кабинете.
    rights: 'owned',
    // Рабочее имя ролика у сервиса наружу не выносится: описание даёт категория.
    alt,
    poster: poster(video.videoId, entry),
    durationSeconds: video.durationSeconds ?? undefined,
  };
}

type Collected = { videos: MediaAsset[]; reels: MediaAsset[] };

function collect(): { byCategory: Map<string, Collected>; skipped: Map<string, number> } {
  const byCategory = new Map<string, Collected>();
  const skipped = new Map<string, number>();

  for (const project of catalog.categories) {
    const rule = KINESCOPE_CATEGORIES[project.name];
    if (!rule) {
      // Про проекты, которые решено не показывать, спрашивать больше не нужно.
      if (!KINESCOPE_NOT_PUBLISHED.has(project.name)) skipped.set(project.name, project.count);
      continue;
    }

    // Свежие работы впереди: портфолио читают сверху, и первым должен стоять
    // сегодняшний уровень, а не то, с чего всё начиналось.
    // Ролики, которые владелец попросил поставить первыми, идут в его порядке.
    const first = rule.first ?? [];
    const rank = (video: CatalogVideo) => {
      const index = first.indexOf(video.videoId);
      return index === -1 ? first.length : index;
    };
    const ordered = [...(project.videos as CatalogVideo[])].sort(
      (a, b) => rank(a) - rank(b) || b.createdAt.localeCompare(a.createdAt),
    );

    for (const video of ordered) {
      // Ролик, уже подобранный руками, второй раз не показываем.
      if (KINESCOPE_HAND_PICKED.has(video.videoId)) continue;

      const entry = posters[video.videoId];
      if (!entry) continue;

      const bucket = bucketOf(video);
      const alt = bucket === 'reels' ? rule.reel : rule.video;
      // У проекта может не быть описания для вертикальных: значит вертикальные
      // из него на сайт не идут.
      if (!alt) continue;

      const target = byCategory.get(rule.categorySlug) ?? { videos: [], reels: [] };
      target[bucket].push(asset(video, entry, alt));
      byCategory.set(rule.categorySlug, target);
    }
  }

  return { byCategory, skipped };
}

const collected = collect();

/** Ролики категории. Пусто — вкладка не показывается, это нормальное состояние. */
export function kinescopeVideos(categorySlug: string): MediaAsset[] {
  return collected.byCategory.get(categorySlug)?.videos ?? [];
}

/** Вертикальные ролики категории. */
export function kinescopeReels(categorySlug: string): MediaAsset[] {
  return collected.byCategory.get(categorySlug)?.reels ?? [];
}

/**
 * Проекты Kinescope, про которые решение ещё не принято, и сколько в них
 * роликов. Нужны тесту и отчёту: молча потерянный проект заметить нельзя.
 * Проекты из KINESCOPE_NOT_PUBLISHED сюда не попадают — по ним решение есть.
 */
export const kinescopeUnmapped: { name: string; count: number }[] = [...collected.skipped]
  .map(([name, count]) => ({ name, count }))
  .sort((a, b) => b.count - a.count);
