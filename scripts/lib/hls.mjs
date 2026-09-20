/**
 * Кадр из потока Kinescope без скачивания ролика.
 *
 * Сервис отдаёт постером первый кадр, а он часто негодный. Нужный кадр берётся
 * из самого потока: скачивается только начало файла до нужной секунды, а не
 * ролик целиком — у трёхминутного фильма это пара мегабайт вместо сотни.
 *
 * Поток ffmpeg по сети здесь не тянет: через прокси среды запросы рвутся на
 * середине сегмента. Поэтому нужный кусок скачивается curl-ом... точнее,
 * обычным fetch, и ffmpeg получает готовый локальный файл.
 */

import { execFile } from 'node:child_process';
import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { promisify } from 'node:util';

const run = promisify(execFile);

/** Поток собирается из идентификатора: отдельной ссылки хранить не нужно. */
export const masterUrl = (videoId) => `https://kinescope.io/${videoId}/master.m3u8`;

async function text(url) {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`${response.status} ${url}`);
  return response.text();
}

async function bytes(url, range) {
  const response = await fetch(url, range ? { headers: { Range: `bytes=${range}` } } : undefined);
  if (!response.ok) throw new Error(`${response.status} ${url}`);
  return Buffer.from(await response.arrayBuffer());
}

/**
 * Дорожка нужного размера. Берём ближайшую сверху к 1200 — из неё режутся все
 * размеры постера. Гнаться за 4K незачем: лишние мегабайты ради кадра, который
 * всё равно ужмётся.
 */
function pickRendition(master, base) {
  const lines = master.split('\n');
  const options = [];
  for (let i = 0; i < lines.length; i += 1) {
    if (!lines[i].startsWith('#EXT-X-STREAM-INF')) continue;
    const size = /RESOLUTION=(\d+)x(\d+)/.exec(lines[i]);
    const uri = lines[i + 1]?.trim();
    if (!size || !uri || uri.startsWith('#')) continue;
    options.push({ longest: Math.max(+size[1], +size[2]), url: new URL(uri, base).toString() });
  }
  if (options.length === 0) return null;
  options.sort((a, b) => a.longest - b.longest);
  return (options.find((option) => option.longest >= 1200) ?? options[options.length - 1]).url;
}

/** Разбор дорожки: длительности сегментов, диапазоны байт и адреса. */
function parseMedia(playlist, base) {
  const segments = [];
  let duration = null;
  let range = null;
  let init = null;

  for (const line of playlist.split('\n')) {
    const trimmed = line.trim();
    if (trimmed.startsWith('#EXT-X-MAP:')) {
      const uri = /URI="([^"]+)"/.exec(trimmed);
      const byterange = /BYTERANGE="(\d+)@(\d+)"/.exec(trimmed);
      if (uri) {
        init = {
          url: new URL(uri[1], base).toString(),
          range: byterange ? `${byterange[2]}-${+byterange[2] + +byterange[1] - 1}` : null,
        };
      }
    } else if (trimmed.startsWith('#EXTINF:')) {
      duration = Number.parseFloat(trimmed.slice(8));
    } else if (trimmed.startsWith('#EXT-X-BYTERANGE:')) {
      const [length, offset] = trimmed.slice(17).split('@').map(Number);
      range = { length, offset };
    } else if (trimmed && !trimmed.startsWith('#') && duration !== null) {
      segments.push({ duration, range, url: new URL(trimmed, base).toString() });
      duration = null;
      range = null;
    }
  }
  return { init, segments };
}

/** Есть ли в системе ffmpeg: без него кадр из потока не взять. */
export async function hasFfmpeg() {
  try {
    await run('ffmpeg', ['-version']);
    return true;
  } catch {
    return false;
  }
}

/**
 * Кадр ролика на указанной секунде в JPEG. `null`, если дорожки нет или ffmpeg
 * не смог декодировать — вызывающий тогда пробует другую секунду.
 */
export async function frameAt(videoId, seconds) {
  const master = masterUrl(videoId);
  const rendition = pickRendition(await text(master), master);
  if (!rendition) return null;

  const { init, segments } = parseMedia(await text(rendition), rendition);
  if (segments.length === 0) return null;

  // Сегмент, внутрь которого попадает нужная секунда.
  let start = 0;
  let index = 0;
  while (index < segments.length - 1 && start + segments[index].duration <= seconds) {
    start += segments[index].duration;
    index += 1;
  }
  const target = segments[index];

  const directory = await mkdtemp(join(tmpdir(), 'ks-frame-'));
  const source = join(directory, 'clip.mp4');
  try {
    if (target.range) {
      /*
       * Сегменты — диапазоны одного mp4. Берём файл от начала до конца нужного
       * сегмента: получается корректный префикс, по которому ffmpeg умеет
       * перематывать.
       */
      await writeFile(source, await bytes(target.url, `0-${target.range.offset + target.range.length - 1}`));
    } else {
      // Обычный HLS: заголовок дорожки плюс нужный сегмент.
      const head = init ? await bytes(init.url, init.range ?? undefined) : Buffer.alloc(0);
      await writeFile(source, Buffer.concat([head, await bytes(target.url)]));
      // Внутри склейки отсчёт идёт от начала сегмента.
      seconds -= start;
    }

    const output = join(directory, 'frame.jpg');
    await run('ffmpeg', [
      '-nostdin', '-loglevel', 'error',
      '-ss', String(Math.max(0, seconds)),
      '-i', source,
      '-frames:v', '1', '-q:v', '2', '-y', output,
    ]);
    return await readFile(output);
  } catch {
    return null;
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
}
