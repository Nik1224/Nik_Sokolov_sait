/**
 * Постеры роликов Kinescope на свой домен.
 *
 * Постер рисуется до нажатия «play», поэтому адрес на стороннем CDN означал бы
 * обращение к сервису без согласия посетителя (§7). Файлы складываются в
 * public/media/kinescope и пережимаются в те же ширины, что и остальное
 * портфолио: 600 для телефона, 1200 для сетки, 1800 для полного экрана.
 *
 * Сервис отдаёт первый кадр ролика, а первый кадр часто негодный: белый лист
 * перед проявкой, пустой зал, смаз на движении. Такие постеры не сохраняются
 * вовсе — они перечисляются в манифесте списком `weak`, и ролик до замены
 * кадра на сайт не идёт. Показать смазанное превью хуже, чем не показать
 * ничего: по такой плитке судят о съёмке.
 *
 * Резкость меряется дисперсией лапласиана. Порог подобран глазами по
 * контрольному листу: ниже него кадр читается как пятно, выше — как картинка.
 *
 * Чтобы вернуть ролик, достаточно положить свой кадр рядом файлами
 * `<videoId>-600.jpg` и `<videoId>-1200.jpg`: скрипт видит готовые файлы,
 * меряет их и больше не трогает.
 *
 * Сам ролик не скачивается — только кадр постера.
 *
 * Запуск: node scripts/kinescope-posters.mjs
 */

import { createHash } from 'node:crypto';
import { access, mkdir, readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const ROOT = new URL('../', import.meta.url);
const CATALOG = new URL('content/kinescope-catalog.json', ROOT);
const MAP = new URL('content/seed/kinescope-map.ts', ROOT);
const OUT_DIR = new URL('public/media/kinescope/', ROOT);
const MANIFEST = new URL('posters.json', OUT_DIR);

const WIDTHS = [600, 1200, 1800];
const QUALITY = 78;

/**
 * Отбраковка кадра идёт по двум числам, и оба подобраны глазами по контрольному
 * листу, а не выведены из теории:
 *
 * `SHARPNESS_MIN` — дисперсия лапласиана. Ниже сорока в кадре нет ни одной
 * резкой границы: это смаз на движении илибелый лист перед проявкой.
 *
 * Вторая пара ловит случай, который одна резкость пропускает: тёмный кадр с
 * ярким краем даёт высокую дисперсию на этой границе, а смотреть в нём не на
 * что. Поэтому кадр отбраковывается и тогда, когда он одновременно беден
 * содержанием (энтропия) и мягок по деталям.
 *
 * Числа — не истина, а сито: они убирают заведомо негодное. Выбрать кадр,
 * который представляет съёмку, может только автор.
 */
const SHARPNESS_MIN = 40;
const FLAT_ENTROPY = 5.2;
const FLAT_SHARPNESS = 150;

/**
 * Дисперсия лапласиана по уменьшенной копии в оттенках серого. Резких границ
 * в кадре мало — значение низкое; пустой или смазанный кадр даёт почти ноль.
 */
async function laplacianVariance(buffer) {
  const { data, info } = await sharp(buffer)
    .greyscale()
    .resize({ width: 320, fit: 'inside' })
    .raw()
    .toBuffer({ resolveWithObject: true });

  const { width, height } = info;
  let sum = 0;
  let sumSquares = 0;
  let count = 0;
  for (let y = 1; y < height - 1; y += 1) {
    for (let x = 1; x < width - 1; x += 1) {
      const i = y * width + x;
      const laplacian =
        4 * data[i] - data[i - 1] - data[i + 1] - data[i - width] - data[i + width];
      sum += laplacian;
      sumSquares += laplacian * laplacian;
      count += 1;
    }
  }
  const mean = sum / count;
  return Math.round(sumSquares / count - mean * mean);
}

/** Резкость и содержательность кадра плюс приговор: годится он в постер или нет. */
async function grade(buffer) {
  const sharpness = await laplacianVariance(buffer);
  const { entropy } = await sharp(buffer).stats();
  const flat = entropy < FLAT_ENTROPY && sharpness < FLAT_SHARPNESS;
  return { sharpness, entropy: Math.round(entropy * 100) / 100, usable: sharpness >= SHARPNESS_MIN && !flat };
}

/**
 * Названия проектов из таблицы соответствия. Читаются из самого файла, а не
 * дублируются здесь: разошедшиеся списки означали бы, что часть постеров
 * качается впустую, а часть роликов остаётся без картинки.
 */
async function mappedProjects() {
  const source = await readFile(fileURLToPath(MAP), 'utf8');
  const body = source.slice(source.indexOf('KINESCOPE_CATEGORIES'));
  return new Set(
    [...body.matchAll(/^ {2}(?:'([^']+)'|([\p{L}\w]+)):\s*\{/gmu)].map((m) => m[1] ?? m[2]),
  );
}

async function exists(url) {
  try {
    await access(fileURLToPath(url));
    return true;
  } catch {
    return false;
  }
}

async function fetchPoster(url) {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`${response.status} ${url}`);
  return Buffer.from(await response.arrayBuffer());
}

/** Пережать исходник в набор ширин и записать файлы. Крупнее исходника не растягиваем. */
async function writeVariants(videoId, source, width, height) {
  const longest = Math.max(width, height);
  const sizes = WIDTHS.filter((size) => size <= longest);
  if (sizes.length === 0) sizes.push(longest);

  let largest = { width, height };
  for (const size of sizes) {
    const { data, info } = await source
      .clone()
      .resize({ [width >= height ? 'width' : 'height']: size, withoutEnlargement: true })
      // Метаданные снимаются: в EXIF кадра может стоять геометка съёмки.
      .jpeg({ quality: QUALITY, mozjpeg: true })
      .toBuffer({ resolveWithObject: true });
    await writeFile(new URL(`${videoId}-${size}.jpg`, OUT_DIR), data);
    if (size === sizes[sizes.length - 1]) largest = { width: info.width, height: info.height };
  }
  return { ...largest, sizes };
}

const catalog = JSON.parse(await readFile(fileURLToPath(CATALOG), 'utf8'));
const projects = await mappedProjects();
await mkdir(fileURLToPath(OUT_DIR), { recursive: true });

let previous = { posters: {} };
try {
  previous = JSON.parse(await readFile(fileURLToPath(MANIFEST), 'utf8'));
} catch {
  // Первый запуск — манифеста ещё нет.
}

const posters = {};
const weak = [];
const failed = [];
let fetched = 0;
let reused = 0;
let adopted = 0;

for (const project of catalog.categories) {
  if (!projects.has(project.name)) continue;

  for (const video of project.videos) {
    if (!video.poster) continue;

    // Отпечаток адреса ловит случай, когда постер у ролика сменили в кабинете.
    const fingerprint = createHash('sha1').update(video.poster).digest('hex').slice(0, 12);
    const known = previous.posters?.[video.videoId];
    const smallest = new URL(`${video.videoId}-${WIDTHS[0]}.jpg`, OUT_DIR);

    if (known && known.fingerprint === fingerprint && (await exists(smallest))) {
      posters[video.videoId] = known;
      reused += 1;
      continue;
    }

    try {
      // Файл на месте, а в манифесте его нет: кадр положили руками. Такой
      // постер не перетираем — он заведомо лучше первого кадра от сервиса.
      if (await exists(smallest)) {
        const sizes = [];
        for (const size of WIDTHS) {
          if (await exists(new URL(`${video.videoId}-${size}.jpg`, OUT_DIR))) sizes.push(size);
        }
        // Размеры берутся у самого крупного файла: он же стоит в src постера.
        const largestFile = new URL(`${video.videoId}-${sizes[sizes.length - 1]}.jpg`, OUT_DIR);
        const { width, height } = await sharp(await readFile(largestFile)).metadata();
        // Приговор сита к своему кадру не применяется: его выбрал автор.
        const { usable: _usable, ...score } = await grade(await readFile(smallest));
        posters[video.videoId] = { width, height, sizes, ...score, source: 'hand' };
        adopted += 1;
        continue;
      }

      const buffer = await fetchPoster(video.poster);
      const source = sharp(buffer, { failOn: 'error' });
      const { width, height } = await source.metadata();
      const { usable, ...score } = await grade(buffer);

      if (!usable) {
        weak.push({ project: project.name, title: video.title, videoId: video.videoId, ...score });
        continue;
      }

      posters[video.videoId] = {
        ...(await writeVariants(video.videoId, source, width, height)),
        ...score,
        fingerprint,
      };
      fetched += 1;
    } catch (error) {
      failed.push(`${project.name} / ${video.title}: ${error.message}`);
    }
  }
}

weak.sort((a, b) => a.sharpness - b.sharpness);

await writeFile(
  fileURLToPath(MANIFEST),
  `${JSON.stringify(
    {
      generatedAt: new Date().toISOString().replace(/\.\d{3}Z$/, 'Z'),
      thresholds: { sharpnessMin: SHARPNESS_MIN, flatEntropy: FLAT_ENTROPY, flatSharpness: FLAT_SHARPNESS },
      posters,
      weak,
    },
    null,
    2,
  )}\n`,
);

console.log(
  `постеров: ${Object.keys(posters).length} (скачано ${fetched}, оставлено ${reused}, своих ${adopted})`,
);
console.log(`без годного кадра: ${weak.length} — перечислены в posters.json, на сайт не идут`);
if (failed.length) {
  console.warn(`не получилось (${failed.length}):`);
  for (const line of failed) console.warn(`  ${line}`);
}
