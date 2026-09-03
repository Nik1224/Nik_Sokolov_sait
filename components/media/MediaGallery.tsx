'use client';

/**
 * Галерея фото и видео с лайтбоксом (ТЗ §7).
 *
 * Лайтбокс — нативный <dialog>: он сам удерживает фокус внутри, закрывается
 * по Escape и делает фон недоступным для ассистивных технологий. Никакой
 * собственной ловушки фокуса писать не нужно.
 *
 * Две раскладки. `feature` — кадры на странице работы: широкие ложатся полосой
 * во всю ширину, вертикальные встают сеткой — по три на компьютере, по две на
 * телефоне. Одна колонка на телефоне давала кадр в полный экран: чтобы дойти до
 * следующего, приходилось прокручивать страницу целиком. `masonry` — портфолио на
 * десятки кадров: колонки, в которых вертикальные и горизонтальные снимки лежат
 * в своих пропорциях и не обрезаются.
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import type { MediaAsset } from '@/content/types';
import type { Dictionary } from '@/lib/i18n/dictionaries';
import { localizedString } from '@/lib/i18n/localize';
import type { Locale } from '@/lib/site';
import { imageSrc, imageSrcSet } from '@/lib/media';
import { Picture } from './Picture';
import { VideoFacade } from './VideoFacade';

/** Насколько нужно смахнуть, чтобы жест сработал, а не был случайным. */
const SWIPE_DISTANCE = 48;
/** Пропорции вертикальной плитки в сетке работы: 2:3. */
const TILE_RATIO = 2 / 3;
const CLOSE_DISTANCE = 96;

type Props = {
  items: MediaAsset[];
  locale: Locale;
  dict: Dictionary;
  layout?: 'feature' | 'masonry' | 'rail';
  /**
   * Сколько кадров показать сразу. Остальные открываются кнопкой: две сотни
   * снимков разом — это бесконечная страница, по которой нечем ориентироваться.
   */
  initialCount?: number;
};

export function MediaGallery({
  items,
  locale,
  dict,
  layout = 'feature',
  initialCount,
}: Props) {
  const [shown, setShown] = useState(initialCount ?? items.length);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  /**
   * Текущий жест. Ось определяется по первому заметному движению и дальше не
   * меняется: иначе диагональное смахивание одновременно листало бы кадры и
   * закрывало просмотр.
   */
  const gesture = useRef<{ x: number; y: number; axis: 'none' | 'x' | 'y' } | null>(null);
  /** Смещение кадра за пальцем при закрывающем жесте. */
  const [dragY, setDragY] = useState(0);
  /** Откуда приезжает новый кадр: подсказывает, в какую сторону листают. */
  const [slide, setSlide] = useState<'in' | 'next' | 'prev'>('in');

  const images = items.filter((item): item is Extract<MediaAsset, { type: 'image' }> => item.type === 'image');

  const open = useCallback((index: number) => {
    setOpenIndex(index);
    setDragY(0);
    setSlide('in');
    dialogRef.current?.showModal();
  }, []);

  const close = useCallback(() => {
    dialogRef.current?.close();
    setOpenIndex(null);
    setDragY(0);
  }, []);

  const step = useCallback(
    (delta: number) => {
      setDragY(0);
      setSlide(delta > 0 ? 'next' : 'prev');
      setOpenIndex((current) => {
        if (current === null) return current;
        return (current + delta + images.length) % images.length;
      });
    },
    [images.length],
  );

  useEffect(() => {
    if (openIndex === null) return;
    function onKey(event: KeyboardEvent) {
      if (event.key === 'ArrowRight') step(1);
      if (event.key === 'ArrowLeft') step(-1);
    }
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [openIndex, step]);

  useEffect(() => {
    if (openIndex === null || images.length < 2) return;
    /*
     * Соседние кадры подгружаются заранее: без этого на перелистывании виден
     * провал в пустоту, пока грузится следующий файл. srcset и sizes те же,
     * что у видимого кадра, поэтому браузер выбирает и кэширует ровно тот
     * вариант, который потом покажет.
     */
    for (const delta of [1, -1]) {
      const neighbour = images[(openIndex + delta + images.length) % images.length];
      const preload = new window.Image();
      preload.sizes = '100vw';
      preload.srcset = imageSrcSet(neighbour.image) ?? '';
      preload.src = imageSrc(neighbour.image, 1800);
    }
  }, [openIndex, images]);

  if (items.length === 0) return null;

  const active = openIndex !== null ? images[openIndex] : null;

  /*
   * Предупреждение о стороннем плеере печатается один раз на всю ленту.
   * Под каждым роликом это была одна и та же фраза подряд шесть раз — она
   * переставала читаться и превращалась в шум.
   */
  const hasThirdPartyVideo = items.some(
    (item) => item.type === 'video' && item.provider !== 'file',
  );

  /*
   * Порции — каждая своей сеткой. У колонок высоты выравниваются по всему
   * содержимому: если досыпать кадры в общую сетку, она перекладывает и уже
   * показанные, и снимки разбегаются вверх и в середину.
   */
  const batchSize = layout === 'masonry' && initialCount ? initialCount : items.length;
  const visible = items.slice(0, shown);
  const batches: MediaAsset[][] = [];
  for (let start = 0; start < visible.length; start += batchSize || visible.length) {
    batches.push(visible.slice(start, start + (batchSize || visible.length)));
  }
  if (batches.length === 0) batches.push([]);

  return (
    <>
      {batches.map((batch, batchIndex) => (
      <ul
        key={batchIndex}
        className={
          layout === 'masonry'
            ? 'masonry m-0 list-none p-0'
            : layout === 'rail'
              ? 'm-0 grid list-none grid-cols-2 gap-3 p-0 sm:gap-4 lg:grid-cols-3'
              : 'm-0 grid list-none grid-cols-2 gap-3 p-0 sm:gap-4 lg:grid-cols-3 lg:gap-6'
        }
      >
        {batch.map((item, indexInBatch) => {
          const position = batchIndex * batchSize + indexInBatch;
          const alt = localizedString(item.alt, locale);
          const caption = localizedString(item.caption, locale);

          if (item.type === 'video') {
            /*
             * Вертикальный ролик — такая же плитка, как вертикальный кадр.
             * Раньше полосу во всю ширину занимал любой ролик, и четыре рилса
             * подряд растягивали страницу на четыре экрана.
             */
            const videoIsWide = item.poster.width >= item.poster.height;
            return (
              <li
                key={item._key}
                className={
                  layout === 'masonry'
                    ? 'mb-4 break-inside-avoid lg:mb-6'
                    : videoIsWide
                      ? 'col-span-2 lg:col-span-3'
                      : ''
                }
              >
                <VideoFacade
                  media={item}
                  locale={locale}
                  dict={dict}
                  ratio={layout !== 'masonry' && !videoIsWide ? TILE_RATIO : undefined}
                  hideConsent={hasThirdPartyVideo}
                  sizes={
                    layout === 'masonry'
                      ? '(min-width: 1024px) 33vw, 50vw'
                      : layout === 'rail'
                        ? videoIsWide
                          ? '(min-width: 1024px) 45rem, 100vw'
                          : '(min-width: 1024px) 15rem, 50vw'
                        : '100vw'
                  }
                />
              </li>
            );
          }

          const imageIndex = images.indexOf(item);
          const isWide = item.image.width >= item.image.height;
          /*
           * В сетке страницы работы вертикальные плитки одного размера: иначе
           * ряд равняется по самой высокой, а под остальными висит пустота.
           * Пропорции 2:3 — те же, что у кадров с телефона, поэтому фотографии
           * не режутся вовсе, а вертикальному ролику отрезает по чуть-чуть
           * сверху и снизу.
           */
          const ratio =
            layout === 'masonry' || isWide ? item.image.width / item.image.height : TILE_RATIO;

          return (
            <li
              key={item._key}
              className={
                layout === 'masonry'
                  ? 'mb-4 break-inside-avoid lg:mb-6'
                  : isWide
                    ? 'col-span-2 lg:col-span-3'
                    : ''
              }
            >
              {/*
               * Горизонтальный кадр в ленте работы ограничен по ширине: во всю
               * ширину колонки портрет человека превращается в баннер и спорит
               * с роликом, ради которого страницу открыли.
               */}
              <figure className={layout === 'feature' && isWide ? 'mx-auto m-0 max-w-4xl' : 'm-0'}>
                <button
                  type="button"
                  onClick={() => open(imageIndex)}
                  className="group block w-full cursor-zoom-in overflow-hidden bg-ink-raised"
                  style={{ aspectRatio: String(ratio) }}
                >
                  <span className="sr-only">{dict.media.openGallery}</span>
                  <Picture
                    image={item.image}
                    alt={alt}
                    // Первые кадры видны сразу — их незачем откладывать.
                    priority={layout === 'masonry' && position < 4}
                    sizes={
                      layout === 'masonry'
                        ? '(min-width: 1024px) 33vw, 50vw'
                        : layout === 'rail'
                          ? '(min-width: 1024px) 15rem, 50vw'
                          : isWide
                            ? '(min-width: 1024px) 56rem, 100vw'
                            : '(min-width: 1024px) 25rem, 50vw'
                    }
                    className="h-full w-full object-cover transition-transform duration-[var(--duration-slow)] ease-[var(--ease-out-soft)] group-hover:scale-[1.02]"
                  />
                </button>
                {caption ? (
                  <figcaption className="mt-3 text-sm text-bone-faint">{caption}</figcaption>
                ) : null}
              </figure>
            </li>
          );
        })}
      </ul>
      ))}

      {hasThirdPartyVideo ? (
        <p className="mt-4 text-xs text-bone-faint">{dict.media.videoConsent}</p>
      ) : null}

      {shown < items.length ? (
        <div className="mt-10 flex flex-col items-center gap-3">
          <button
            type="button"
            onClick={() => setShown((current) => current + (initialCount ?? items.length))}
            className="label border border-line px-7 py-4 text-bone transition-colors hover:border-line-strong hover:bg-ink-raised"
          >
            {dict.media.showMore}
          </button>
          <p className="label m-0 text-bone-faint">
            {shown} {dict.media.imageOf} {items.length}
          </p>
        </div>
      ) : null}

      <dialog
        ref={dialogRef}
        onClose={() => setOpenIndex(null)}
        onClick={(event) => {
          // Клик по любому свободному месту закрывает просмотр. Исключение —
          // сам кадр и кнопки: иначе просмотр захлопывался бы при листании.
          const target = event.target as HTMLElement | null;
          if (target?.closest('img, button')) return;
          close();
        }}
        className="lightbox m-0 h-full max-h-none w-full max-w-none p-0 backdrop:bg-black/90"
      >
        {active ? (
          <div className="flex h-full flex-col">
            <div className="flex items-center justify-between border-b border-line px-4 py-3">
              <p className="label text-bone-faint">
                {(openIndex ?? 0) + 1} {dict.media.imageOf} {images.length}
              </p>
              <button
                type="button"
                onClick={close}
                className="label px-3 py-2 text-bone-dim transition-colors hover:text-bone"
              >
                {dict.media.closeGallery}
              </button>
            </div>

            <div
              // touch-action: none — жесты обрабатываем сами, иначе браузер
              // перехватит их прокруткой и «потянуть, чтобы обновить».
              className="relative flex min-h-0 flex-1 touch-none items-center justify-center px-4 py-4 sm:px-24"
              onTouchStart={(event) => {
                const touch = event.touches[0];
                gesture.current = { x: touch.clientX, y: touch.clientY, axis: 'none' };
              }}
              onTouchMove={(event) => {
                const from = gesture.current;
                if (!from) return;
                const touch = event.touches[0];
                const dx = touch.clientX - from.x;
                const dy = touch.clientY - from.y;

                if (from.axis === 'none' && (Math.abs(dx) > 10 || Math.abs(dy) > 10)) {
                  from.axis = Math.abs(dy) > Math.abs(dx) ? 'y' : 'x';
                }
                // Кадр идёт за пальцем: жест видно, и понятно, что он делает.
                if (from.axis === 'y') setDragY(dy);
              }}
              onTouchEnd={(event) => {
                const from = gesture.current;
                gesture.current = null;
                if (!from) return;

                if (from.axis === 'y') {
                  // Закрывает движение в любую сторону: вверх ждут не реже.
                  if (Math.abs(dragY) > CLOSE_DISTANCE) close();
                  else setDragY(0);
                  return;
                }

                if (images.length < 2) return;
                const dx = event.changedTouches[0].clientX - from.x;
                if (Math.abs(dx) > SWIPE_DISTANCE) step(dx < 0 ? 1 : -1);
              }}
            >
              {/* Сцена сжимается по кадру, поэтому стрелки стоят рядом с ним,
                  а не у краёв экрана. */}
              <div className="lightbox-stage">
                <div
                  className={dragY === 0 ? 'lightbox-frame is-settling' : 'lightbox-frame'}
                  style={{
                    transform: `translateY(${dragY}px)`,
                    // Чем дальше кадр от центра, тем прозрачнее: жест сообщает,
                    // что просмотр вот-вот закроется.
                    opacity: 1 - Math.min(Math.abs(dragY) / 520, 0.55),
                  }}
                >
                  <div key={openIndex} className={`lightbox-slide is-${slide}`}>
                    <Picture
                      image={active.image}
                      alt={localizedString(active.alt, locale)}
                      sizes="100vw"
                      priority
                      className="max-h-full w-auto max-w-full object-contain"
                    />
                  </div>
                </div>

                {images.length > 1 ? (
                  <>
                    <button
                      type="button"
                      onClick={() => step(-1)}
                      aria-label={dict.media.previous}
                      className="lightbox-arrow"
                      data-side="prev"
                    >
                      <svg aria-hidden="true" viewBox="0 0 24 24" focusable="false">
                        <path d="M15 5 8 12l7 7" />
                      </svg>
                    </button>
                    <button
                      type="button"
                      onClick={() => step(1)}
                      aria-label={dict.media.next}
                      className="lightbox-arrow"
                      data-side="next"
                    >
                      <svg aria-hidden="true" viewBox="0 0 24 24" focusable="false">
                        <path d="m9 5 7 7-7 7" />
                      </svg>
                    </button>
                  </>
                ) : null}
              </div>
            </div>
          </div>
        ) : null}
      </dialog>
    </>
  );
}
