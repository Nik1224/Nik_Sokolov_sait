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
import { embedUrl } from '@/lib/media';
import type { Locale } from '@/lib/site';
import { Picture } from './Picture';

type Props = {
  media: Extract<MediaAsset, { type: 'video' }>;
  locale: Locale;
  dict: Dictionary;
  sizes?: string;
  priority?: boolean;
  /**
   * Пропорции рамки, если они должны отличаться от пропорций постера. Нужны
   * ленте кадров на странице работы: там все плитки одного размера, иначе
   * вертикальный ролик и вертикальный кадр в одном ряду разной высоты.
   */
  ratio?: number;
  /**
   * Не показывать строку про сторонний плеер под этим роликом. Нужно ленте
   * кадров: там роликов несколько, и одна и та же фраза повторялась бы под
   * каждым. Предупреждение в этом случае печатает сама лента — один раз.
   */
  hideConsent?: boolean;
};

export function VideoFacade({
  media,
  locale,
  dict,
  sizes = '100vw',
  priority = false,
  ratio,
  hideConsent = false,
}: Props) {
  const [playing, setPlaying] = useState(false);

  const alt = localizedString(media.alt, locale);
  const caption = localizedString(media.caption, locale);
  const isThirdParty = media.provider !== 'file';
  const src = media.videoId ? embedUrl(media.provider, media.videoId) : null;
  const playable = Boolean(src) || Boolean(media.url);

  function start() {
    track('video_start', { provider: media.provider });
    setPlaying(true);
  }

  return (
    <figure className="m-0">
      <div
        className="relative overflow-hidden bg-ink-raised"
        style={{ aspectRatio: String(ratio ?? (media.poster.width / media.poster.height || 16 / 9)) }}
      >
        {playing && src ? (
          <iframe
            src={src}
            title={alt || dict.media.playVideo}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; picture-in-picture"
            allowFullScreen
            className="absolute inset-0 h-full w-full border-0"
          />
        ) : playing && media.url ? (
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
            {/*
             * Вуаль поверх постера — едва заметная. Плотная заливка делала
             * светлый кадр выцветшим; контраст кнопки держит она сама: тёмный
             * диск со светлым треугольником читается и на белом слайде, и на
             * тёмной площадке.
             */}
            <div className="absolute inset-0 bg-ink/10" aria-hidden="true" />

            <button
              type="button"
              onClick={start}
              disabled={!playable}
              className="group absolute inset-0 flex items-center justify-center disabled:cursor-not-allowed"
            >
              {/* Предупреждение о стороннем плеере не дублируем: оно стоит
                  отдельной строкой сразу после кнопки и читается один раз. */}
              <span className="sr-only">
                {dict.media.playVideo}
                {alt ? `: ${alt}` : ''}
              </span>
              <span
                aria-hidden="true"
                className="flex h-14 w-14 items-center justify-center rounded-full border border-bone/25 bg-ink/70 backdrop-blur-sm transition-transform duration-[var(--duration-base)] ease-[var(--ease-out-soft)] group-hover:scale-110 group-focus-visible:scale-110"
              >
                <svg viewBox="0 0 24 24" className="ml-0.5 h-5 w-5 fill-bone">
                  <path d="M8 5v14l11-7z" />
                </svg>
              </span>
            </button>
          </>
        )}
      </div>

      {/*
       * Подпись и служебные строки живут под кадром, а не поверх него.
       *
       * Раньше предупреждение о стороннем плеере лежало полосой по низу постера:
       * на светлом слайде серый текст по градиенту не читался вовсе, а сам кадр
       * оказывался наполовину закрыт служебной фразой. Кадр теперь чистый —
       * на нём только кнопка.
       *
       * Хайрлайн сверху связывает строки с кадром: это подпись к нему, а не
       * следующий блок страницы.
       */}
      {caption || (isThirdParty && !hideConsent) ? (
        <figcaption className="mt-4 border-t border-line pt-3">
          {/*
           * Ни хронометража, ни имени сервиса. Это техника, а не содержание:
           * человек смотрит работу, а не выбирает файл по длительности.
           * Остаётся только предупреждение — оно обязано быть видно до нажатия.
           */}
          {caption ? <span className="block text-sm text-bone-dim">{caption}</span> : null}
          {/* Предупреждение видно ДО клика: это и есть осознанное согласие (§7).
              Отдельный экран подтверждения только добавлял бы второй клик. */}
          {isThirdParty && !hideConsent ? (
            <span className="mt-2 block text-xs text-bone-faint">{dict.media.videoConsent}</span>
          ) : null}
        </figcaption>
      ) : null}
    </figure>
  );
}
