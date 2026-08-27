'use client';

/**
 * Полный шоурил со звуком (ТЗ §7).
 *
 * Фон на странице идёт без звука и обрезанным, поэтому полную версию
 * открываем по запросу. Плеер стороннего сервиса загружается только после
 * клика, и человек предупреждён об этом заранее.
 *
 * Нативный <dialog> сам удерживает фокус и закрывается по Escape.
 */

import { useEffect, useRef, useState } from 'react';
import { track } from '@/lib/analytics';
import type { Dictionary } from '@/lib/i18n/dictionaries';
import { embedUrl } from '@/lib/media';

type Props = {
  provider: string;
  videoId: string;
  label: string;
  dict: Dictionary;
};

export function ShowreelDialog({ provider, videoId, label, dict }: Props) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [open, setOpen] = useState(false);
  const src = embedUrl(provider, videoId);

  // Закрытие обязано выгружать iframe: иначе видео продолжит играть за кадром.
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    const onClose = () => setOpen(false);
    dialog.addEventListener('close', onClose);
    return () => dialog.removeEventListener('close', onClose);
  }, []);

  if (!src) return null;

  return (
    <>
      <button
        type="button"
        onClick={() => {
          track('video_start', { provider });
          setOpen(true);
          dialogRef.current?.showModal();
        }}
        className="label inline-flex items-center gap-3 border border-line-strong px-6 py-4 text-bone transition-colors hover:border-bone hover:bg-ink/40"
      >
        <span aria-hidden="true" className="text-accent">
          ▶
        </span>
        {label}
      </button>
      <p className="mt-3 text-xs text-bone-faint">{dict.media.videoConsent}</p>

      <dialog
        ref={dialogRef}
        onClick={(event) => {
          if (event.target === dialogRef.current) dialogRef.current?.close();
        }}
        className="m-0 h-full max-h-none w-full max-w-none bg-ink/97 p-0 backdrop:bg-ink/90"
      >
        <div className="flex h-full flex-col">
          <div className="flex items-center justify-between border-b border-line px-4 py-3">
            <p className="label m-0 text-bone-faint">{label}</p>
            <button
              type="button"
              onClick={() => dialogRef.current?.close()}
              className="label px-3 py-2 text-bone-dim transition-colors hover:text-bone"
            >
              {dict.media.closeGallery}
            </button>
          </div>
          <div className="flex min-h-0 flex-1 items-center justify-center p-4">
            {open ? (
              <iframe
                src={src}
                title={label}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; picture-in-picture; fullscreen"
                allowFullScreen
                className="aspect-video h-auto max-h-full w-full max-w-6xl border-0"
              />
            ) : null}
          </div>
        </div>
      </dialog>
    </>
  );
}
