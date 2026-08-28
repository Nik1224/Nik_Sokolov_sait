/**
 * Свадебное портфолио: 74 кадра с реальных съёмок.
 *
 * Файлы лежат в public/media/portfolio/wedding в трёх размерах: 600 для сетки
 * на телефоне, 1200 для сетки на компьютере, 1800 для полного экрана. EXIF
 * снят при пережатии — модель камеры и софт в вебе не нужны.
 *
 * Список собран из имён файлов, поэтому добавление кадра сводится к пережатию
 * и одной строке здесь. После подключения CMS галерея переедет в неё целиком.
 */

import type { MediaAsset } from '@/content/types';

const BASE = '/media/portfolio/wedding';
const WIDTHS = [600, 1200, 1800] as const;

/**
 * Описания у кадров пока порядковые: придумывать за фотографа, что происходит
 * на чужой свадьбе, нельзя. Настоящие подписи заводятся в CMS по кадру.
 */
function photo(id: string, width: number, height: number, index: number): MediaAsset {
  return {
    _key: `wedding-${id}`,
    type: 'image',
    rights: 'owned',
    alt: {
      ru: `Свадебная съёмка, кадр ${index}`,
      en: `Wedding photography, frame ${index}`,
    },
    image: {
      src: `${BASE}/${id}-1800.jpg`,
      width,
      height,
      sources: WIDTHS.map((size) => ({ width: size, src: `${BASE}/${id}-${size}.jpg` })),
    },
  };
}

export const weddingGallery: MediaAsset[] = [
  photo('043ab851db24', 1200, 1800, 1),
  photo('0b5fcd8a6f02', 1800, 1200, 2),
  photo('0b71f19bd5ef', 1200, 1800, 3),
  photo('0cd7cd9a515c', 1200, 1800, 4),
  photo('0cdf50b6db7f', 1200, 1800, 5),
  photo('0d4ee9379232', 1200, 1800, 6),
  photo('0f6466a2f101', 1800, 1200, 7),
  photo('1205ef22e0bf', 1200, 1800, 8),
  photo('1a28a0f4633c', 1200, 1800, 9),
  photo('25267d78fc9c', 1200, 1800, 10),
  photo('2b36b8fc8532', 1200, 1800, 11),
  photo('2e32bc3ab590', 1800, 864, 12),
  photo('3872070d435f', 1200, 1800, 13),
  photo('3d8994e89cbb', 1800, 1200, 14),
  photo('42d3aca7a703', 1200, 1800, 15),
  photo('46d1cdb18e34', 1200, 1800, 16),
  photo('472f9e95bc4f', 1200, 1800, 17),
  photo('485d0086a323', 1200, 1800, 18),
  photo('4f9d100241c7', 1200, 1800, 19),
  photo('536c2c27f2be', 1200, 1800, 20),
  photo('567511a76175', 1200, 1800, 21),
  photo('56eb532b3a93', 1200, 1800, 22),
  photo('573203cc3e04', 1200, 1800, 23),
  photo('5c5604513913', 1200, 1800, 24),
  photo('5e13330e927b', 1800, 1200, 25),
  photo('5e49fd331464', 1200, 1800, 26),
  photo('632f746a0870', 1200, 1800, 27),
  photo('69f1005a96e9', 1200, 1800, 28),
  photo('6bb6f6cb7d63', 1200, 1800, 29),
  photo('6c304e98b844', 1200, 1800, 30),
  photo('71422e0dd72b', 1200, 1800, 31),
  photo('7194caff605d', 1200, 1800, 32),
  photo('7ba0e3286597', 1200, 1800, 33),
  photo('7c10ab616f95', 1200, 1800, 34),
  photo('7c70d61d9560', 1200, 1800, 35),
  photo('7e707e936820', 1200, 1800, 36),
  photo('800694d451c5', 1200, 1800, 37),
  photo('8042eb48dba8', 1200, 1800, 38),
  photo('872ac3c132ed', 1200, 1800, 39),
  photo('88b2261d1941', 1200, 1800, 40),
  photo('8d37613bafbb', 1200, 1800, 41),
  photo('8d82b45a0d23', 1200, 1800, 42),
  photo('914836e27cf0', 1800, 1710, 43),
  photo('97f0d4aa54e3', 1200, 1800, 44),
  photo('9b26a9180f0c', 1200, 1800, 45),
  photo('a0e2f358aa13', 1200, 1800, 46),
  photo('a23cf24446a9', 1200, 1800, 47),
  photo('a243e4705814', 1200, 1800, 48),
  photo('ad1372e6a3bd', 1800, 1200, 49),
  photo('afc64d33432d', 1200, 1800, 50),
  photo('b1d6cf507091', 1200, 1800, 51),
  photo('b3d2a2f4ff67', 1800, 1200, 52),
  photo('badffd58c872', 1038, 1800, 53),
  photo('c3fb3a38f7bb', 1200, 1800, 54),
  photo('c4d8e6cf5cb4', 1200, 1800, 55),
  photo('c4e6dab2869b', 1200, 1800, 56),
  photo('c8eb87f1fe03', 1200, 1800, 57),
  photo('ca2430af6d29', 1200, 1800, 58),
  photo('cb208f9800eb', 1200, 1800, 59),
  photo('cc9a35e985c8', 1800, 1200, 60),
  photo('d63e0a81ecdf', 1200, 1800, 61),
  photo('d872c731a3b9', 1200, 1800, 62),
  photo('df5ccc05d36e', 1200, 1800, 63),
  photo('df7f789dfbed', 1200, 1800, 64),
  photo('e11c24d0c2d5', 1200, 1800, 65),
  photo('e778a086f77a', 1200, 1800, 66),
  photo('ea398d9eaf79', 1200, 1800, 67),
  photo('ecdfad79a73f', 1200, 1800, 68),
  photo('edd0311df86d', 1200, 1800, 69),
  photo('f03de2ec9f6b', 1200, 1800, 70),
  photo('fd9a7f453cf5', 1200, 1800, 71),
  photo('fe6668450a4f', 1200, 1800, 72),
  photo('fecda185b7eb', 1200, 1800, 73),
  photo('ff041ab71ec4', 1200, 1800, 74),
];
