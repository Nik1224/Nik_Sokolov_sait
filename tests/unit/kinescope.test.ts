/**
 * Ролики Kinescope в контенте (§7, §8.1, §10).
 *
 * Раскладка приезжает из кабинета владельца и меняется без участия кода,
 * поэтому проверяется не список роликов, а правила: постер лежит на своём
 * домене и существует файлом, один ролик не показывается дважды, а проект,
 * которому не нашлось категории, виден и не теряется молча.
 */

import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { categories } from '@/content/seed';
import { kinescopeUnmapped, kinescopeReels, kinescopeVideos } from '@/content/seed/kinescope';
import { KINESCOPE_CATEGORIES, KINESCOPE_HAND_PICKED } from '@/content/seed/kinescope-map';
import catalog from '@/content/kinescope-catalog.json';
import posterManifest from '@/public/media/kinescope/posters.json';
import type { MediaAsset } from '@/content/types';

const PUBLIC_DIR = join(import.meta.dirname, '..', '..', 'public');

/** Все видео во вкладках «Ролики» и «Вертикальные» всех категорий. */
const published: MediaAsset[] = categories.flatMap((category) => [
  ...(category.videos ?? []),
  ...(category.reels ?? []),
]);

const fromKinescope = published.filter(
  (media): media is Extract<MediaAsset, { type: 'video' }> =>
    media.type === 'video' && media._key.startsWith('ks-'),
);

describe('ролики из каталога Kinescope', () => {
  it('в контент попал хотя бы один ролик', () => {
    // Пустая выгрузка означала бы, что каталог или манифест постеров разъехались
    // с кодом, а страницы просто молча опустели.
    expect(fromKinescope.length).toBeGreaterThan(0);
  });

  it('постеры лежат на своём домене и существуют файлами', () => {
    for (const media of fromKinescope) {
      // Адрес на CDN сервиса означал бы обращение к нему до согласия (§7).
      expect(media.poster.src.startsWith('/media/kinescope/')).toBe(true);

      // Битый путь даёт пустое место вместо превью и прыжок вёрстки.
      const files = [media.poster.src, ...(media.poster.sources ?? []).map((s) => s.src)];
      for (const file of files) {
        expect(existsSync(join(PUBLIC_DIR, file)), `нет файла ${file}`).toBe(true);
      }
    }
  });

  it('размеры постера известны: без них страница прыгает при загрузке (§10)', () => {
    for (const media of fromKinescope) {
      expect(media.poster.width).toBeGreaterThan(0);
      expect(media.poster.height).toBeGreaterThan(0);
    }
  });

  it('один ролик не показывается дважды', () => {
    const ids = published
      .filter((media): media is Extract<MediaAsset, { type: 'video' }> => media.type === 'video')
      .map((media) => media.videoId)
      .filter((id): id is string => Boolean(id));

    expect(new Set(ids).size).toBe(ids.length);
  });

  it('описание ролика не выносит наружу рабочее имя файла', () => {
    for (const media of fromKinescope) {
      expect(media.alt.ru?.trim()).toBeTruthy();
      // Рабочие имена у сервиса такие: «Rolik_11.09.24», «Kollekciya_2025_Gotov».
      expect(media.alt.ru).not.toMatch(/[_\d]{4,}/);
    }
  });

  it('вертикальные ролики лежат во вкладке вертикальных, а не вперемешку', () => {
    for (const category of categories) {
      for (const media of category.videos ?? []) {
        if (media.type !== 'video' || !media._key.startsWith('ks-')) continue;
        expect(media.poster.width >= media.poster.height).toBe(true);
      }
      for (const media of category.reels ?? []) {
        if (media.type !== 'video' || !media._key.startsWith('ks-')) continue;
        expect(media.poster.height > media.poster.width).toBe(true);
      }
    }
  });

  it('каждая категория из таблицы соответствия существует на сайте', () => {
    const slugs = new Set(categories.map((category) => category.slug));
    for (const rule of Object.values(KINESCOPE_CATEGORIES)) {
      expect(slugs.has(rule.categorySlug), `нет категории ${rule.categorySlug}`).toBe(true);
    }
  });

  it('пустая категория объяснена, а не просто пуста', () => {
    /*
     * Категория из таблицы может остаться без единого ролика: так вышло с
     * предметной съёмкой, где сервис отдаёт первый кадр, а там белый лист
     * перед проявкой. Это допустимо, но должно быть объяснимо — каждый её
     * ролик обязан быть в списке негодных кадров. Иначе ролики пропали бы
     * молча, и понять почему было бы нельзя.
     */
    // Список пуст, пока у всех роликов есть кадр: тип у пустого массива в JSON
    // выводится как never, поэтому форма записи описана явно.
    const weak = posterManifest.weak as { videoId: string }[];
    const weakIds = new Set(weak.map((entry) => entry.videoId));
    const catalogOf = (name: string) =>
      catalog.categories.find((project) => project.name === name)?.videos ?? [];

    for (const [project, rule] of Object.entries(KINESCOPE_CATEGORIES)) {
      const total =
        kinescopeVideos(rule.categorySlug).length + kinescopeReels(rule.categorySlug).length;
      if (total > 0) continue;

      const videos = catalogOf(project);
      expect(videos.length, `проекта ${project} нет в выгрузке`).toBeGreaterThan(0);
      for (const video of videos) {
        expect(
          weakIds.has(video.videoId) || KINESCOPE_HAND_PICKED.has(video.videoId),
          `ролик ${video.videoId} из «${project}» пропал без объяснения`,
        ).toBe(true);
      }
    }
  });

  it('у каждого сохранённого постера отмечено, насколько кадр читается', () => {
    // Число рядом с постером говорит, какой кадр менять первым.
    for (const entry of Object.values(posterManifest.posters)) {
      expect(typeof entry.sharpness).toBe('number');
      expect(typeof entry.entropy).toBe('number');
    }
  });

  it('проекты без категории на сайте перечислены явно', () => {
    // Не ошибка: у владельца есть съёмки, которым на сайте пока нет вкладки.
    // Важно, чтобы они были видны списком, а не пропадали молча.
    for (const project of kinescopeUnmapped) {
      expect(project.name).toBeTruthy();
      expect(project.count).toBeGreaterThan(0);
      expect(KINESCOPE_CATEGORIES[project.name]).toBeUndefined();
    }
  });
});
