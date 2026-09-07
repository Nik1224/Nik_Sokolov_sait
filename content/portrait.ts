/**
 * Портрет автора.
 *
 * Один кадр на три страницы — «О себе», «Организаторам» и «Контакты». Лежал
 * константой в странице для организаторов, и вторая страница, которой он
 * понадобился, скопировала бы его вместе с размерами: разойтись им ничего не
 * мешало бы, а расходятся такие копии молча.
 */

import type { ImageRef } from '@/content/types';

export const PORTRAIT: ImageRef = {
  src: '/media/about/nikita-1200.jpg',
  width: 1200,
  height: 1800,
  sources: [600, 1200].map((width) => ({ width, src: `/media/about/nikita-${width}.jpg` })),
};
