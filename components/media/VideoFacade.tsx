'use client';

/**
 * Видео с постером и явным согласием (ТЗ §7, §10).
 *
 * Тяжёлый плеер не грузится, пока пользователь не выразил намерение. Для
 * стороннего сервиса перед загрузкой показывается предупреждение: iframe
 * получит данные браузера, и решать это пользователю.
 */

import { useState } from 'react';
import type { MediaAsset } from '@/content/types';
import { track } from '@/lib/analytics';
import type { Dictionary } from '@/lib/i18n/dictionaries';
import { localizedString } from '@/lib/i18n/localize';
import { embedUrl, formatDuration } from '@/lib/media';
import type { Locale } from '@/lib/site';
import { Picture } from './Picture';

type Props = {
  media: Extract<MediaAsset, { type: 'video' }>;
  locale: Locale;
  dict: Dictionary;
  sizes?: string;
  priority?: boolean;
};

export function VideoFacade({ media, locale, dict, sizes = '100vw', priority = false }: Props) {
  const [stage, setStage] = useState<'poster' | 'consent' | 'playing'>('poster');

  const alt = localizedString(media.alt, locale);
  const caption = localizedString(media.caption, locale);
  const isThirdParty = media.provider === 'youtube' || media.provider === 'vimeo';
  const src = media.videoId ? embedUrl(media.provider, media.videoId) : null;
  const duration = formatDuration(media.durationSeconds);
  const playable = Boolean(src) || Boolean(media.url);

  function start() {
    track('video_start', { provider: media.provider });
    setStage(isThirdParty ? 'consent' : 'playing');
  }

  return (
    <figure className="m-0">
      <div
        className="relative overflow-hidden bg-ink-raised"
        style={{ aspectRatio: String(media.poster.width / media.poster.height || 16 / 9) }}
      >
        {stage === 'playing' && src ? (
          <iframe
            src={src}
            title={alt || dict.media.playVideo}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; picture-in-picture"
            allowFullScreen
            className="absolute inset-0 h-full w-full border-0"
          />
        ) : stage === 'playing' && media.url ? (
          // eslint-disable-next-line jsx-a11y/media-has-caption -- субтитры добавляются вместе с реальными роликами (§11)
          <video
            src={media.url}
            controls
            autoPlay
            playsInline
            poster={media.poster.src}
            className="absolute inset-0 h-full w-full object-cover"
          />
        ) : (
          <>
            <Picture
              image={media.poster}
              alt={alt}
              sizes={sizes}
              priority={priority}
              className="absolute inset-0 h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-ink/35" aria-hidden="true" />

            {stage === 'consent' ? (
              <div className="absolute inset-0 flex items-center justify-center p-6">
                <div className="max-w-sm bg-ink/90 p-6 text-center backdrop-blur">
                  <p className="text-sm text-bone-dim">{dict.media.videoConsent}</p>
                  <button
                    type="button"
                    onClick={() => setStage('playing')}
                    className="mt-4 inline-flex items-center gap-2 bg-bone px-5 py-2.5 text-sm font-medium text-ink transition-colors hover:bg-accent"
                  >
                    {dict.media.videoConsentAction}
                  </button>
                </div>
              </div>
            ) : (
              <button
                type="button"
                onClick={start}
                disabled={!playable}
                className="group absolute inset-0 flex items-center justify-center disabled:cursor-not-allowed"
              >
                <span className="sr-only">
                  {dict.media.playVideo}
                  {alt ? `: ${alt}` : ''}
                </span>
                <span
                  aria-hidden="true"
                  className="flex h-16 w-16 items-center justify-center rounded-full border border-bone/50 bg-ink/40 backdrop-blur transition-transform duration-[var(--duration-base)] ease-[var(--ease-out-soft)] group-hover:scale-110 group-focus-visible:scale-110"
                >
                  <svg viewBox="0 0 24 24" className="ml-1 h-6 w-6 fill-bone">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                </span>
                {duration ? (
                  <span aria-hidden="true" className="label absolute bottom-4 right-4 text-bone/70">
                    {duration}
                  </span>
                ) : null}
              </button>
            )}
          </>
        )}
      </div>

      {caption ? (
        <figcaption className="mt-3 text-sm text-bone-faint">{caption}</figcaption>
      ) : null}
    </figure>
  );
}
