'use client';

/**
 * Галерея фото и видео с лайтбоксом (ТЗ §7).
 *
 * Лайтбокс — нативный <dialog>: он сам удерживает фокус внутри, закрывается
 * по Escape и делает фон недоступным для ассистивных технологий. Никакой
 * собственной ловушки фокуса писать не нужно.
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import type { MediaAsset } from '@/content/types';
import type { Dictionary } from '@/lib/i18n/dictionaries';
import { localizedString } from '@/lib/i18n/localize';
import type { Locale } from '@/lib/site';
import { Picture } from './Picture';
import { VideoFacade } from './VideoFacade';

type Props = {
  items: MediaAsset[];
  locale: Locale;
  dict: Dictionary;
};

export function MediaGallery({ items, locale, dict }: Props) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const images = items.filter((item): item is Extract<MediaAsset, { type: 'image' }> => item.type === 'image');

  const open = useCallback((index: number) => {
    setOpenIndex(index);
    dialogRef.current?.showModal();
  }, []);

  const close = useCallback(() => {
    dialogRef.current?.close();
    setOpenIndex(null);
  }, []);

  const step = useCallback(
    (delta: number) => {
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

  if (items.length === 0) return null;

  const active = openIndex !== null ? images[openIndex] : null;

  return (
    <>
      <ul className="grid list-none grid-cols-1 gap-4 p-0 sm:grid-cols-2 lg:gap-6">
        {items.map((item) => {
          const alt = localizedString(item.alt, locale);
          const caption = localizedString(item.caption, locale);

          if (item.type === 'video') {
            return (
              <li key={item._key} className="sm:col-span-2">
                <VideoFacade media={item} locale={locale} dict={dict} sizes="(min-width: 640px) 100vw, 100vw" />
              </li>
            );
          }

          const imageIndex = images.indexOf(item);
          const isWide = item.image.width >= item.image.height;

          return (
            <li key={item._key} className={isWide ? 'sm:col-span-2' : ''}>
              <figure className="m-0">
                <button
                  type="button"
                  onClick={() => open(imageIndex)}
                  className="group block w-full cursor-zoom-in overflow-hidden bg-ink-raised"
                  style={{ aspectRatio: String(item.image.width / item.image.height) }}
                >
                  <span className="sr-only">{dict.media.openGallery}</span>
                  <Picture
                    image={item.image}
                    alt={alt}
                    sizes={isWide ? '(min-width: 1024px) 78rem, 100vw' : '(min-width: 640px) 39rem, 100vw'}
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

      <dialog
        ref={dialogRef}
        onClose={() => setOpenIndex(null)}
        onClick={(event) => {
          if (event.target === dialogRef.current) close();
        }}
        className="m-0 h-full max-h-none w-full max-w-none bg-ink/97 p-0 backdrop:bg-ink/90"
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

            <div className="flex min-h-0 flex-1 items-center justify-center p-4">
              <Picture
                image={active.image}
                alt={localizedString(active.alt, locale)}
                sizes="100vw"
                priority
                className="max-h-full w-auto max-w-full object-contain"
              />
            </div>

            {images.length > 1 ? (
              <div className="flex items-center justify-center gap-2 border-t border-line px-4 py-3">
                <button
                  type="button"
                  onClick={() => step(-1)}
                  className="label border border-line px-4 py-2 text-bone-dim transition-colors hover:border-line-strong hover:text-bone"
                >
                  {dict.media.previous}
                </button>
                <button
                  type="button"
                  onClick={() => step(1)}
                  className="label border border-line px-4 py-2 text-bone-dim transition-colors hover:border-line-strong hover:text-bone"
                >
                  {dict.media.next}
                </button>
              </div>
            ) : null}
          </div>
        ) : null}
      </dialog>
    </>
  );
}
