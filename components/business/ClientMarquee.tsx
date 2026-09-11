'use client';

/**
 * Бегущая строка заказчиков.
 *
 * Сеткой этот список занимал три ряда и треть экрана ради десяти названий —
 * непропорционально тому, что он сообщает. Полоса говорит то же самое одной
 * строкой, а движение делает её заметной без увеличения.
 *
 * Петля собрана из двух одинаковых дорожек: пока первая уезжает влево на всю
 * свою ширину, вторая занимает её место, и шва не видно. Вторая дорожка —
 * копия, поэтому она скрыта от ассистивных технологий: озвучивать список
 * дважды незачем.
 *
 * Движение, которое начинается само и длится дольше пяти секунд, обязано
 * иметь способ остановки (WCAG 2.2.2). Наведения для этого мало: на сенсорном
 * экране его нет, а с клавиатуры до полосы не добраться — внутри нет ни одной
 * ссылки. Поэтому рядом с подписью стоит кнопка. При «уменьшить движение»
 * полоса не едет вовсе и листается пальцем.
 */

import { useState } from 'react';
import type { LocaleString } from '@/content/types';
import type { Dictionary } from '@/lib/i18n/dictionaries';
import { localizedString } from '@/lib/i18n/localize';
import type { Locale } from '@/lib/site';

type Client = {
  name: string;
  note?: LocaleString;
  logo?: { src: string; width: number; height: number };
};

export function ClientMarquee({
  clients,
  locale,
  dict,
}: {
  clients: Client[];
  locale: Locale;
  dict: Dictionary;
}) {
  const [paused, setPaused] = useState(false);

  const track = (hidden: boolean) => (
    <ul className="marquee-track" aria-hidden={hidden || undefined}>
      {clients.map((client) => (
        <li key={client.name} className="flex shrink-0 items-baseline">
          {client.logo ? (
              <img
                src={client.logo.src}
                alt={client.name}
                width={client.logo.width}
                height={client.logo.height}
                loading="lazy"
                className="block w-auto"
                style={{ height: `${client.logo.height}px` }}
              />
          ) : (
            <span className="text-lead whitespace-nowrap text-bone">{client.name}</span>
          )}
        </li>
      ))}
    </ul>
  );

  return (
    <>
      {/*
       * Подпись и кнопка — одной строкой: отдельный ряд под полосой стоил бы
       * ещё сорока пикселей высоты, а весь смысл замены сетки на строку был в
       * том, чтобы блок перестал занимать треть экрана.
       *
       * Кнопка без надписи: пауза — знак, который читается без слов, а её имя
       * для ассистивных технологий берётся из `aria-label`. Зона нажатия
       * держит норму для пальца, хотя сам знак мелкий.
       */}
      <div className="container-wide flex items-center justify-between gap-6">
        <p data-reveal className="label-fine m-0 text-bone-faint">
          {dict.common.clients}
        </p>
        <button
          type="button"
          onClick={() => setPaused((value) => !value)}
          aria-pressed={paused}
          aria-label={paused ? dict.media.resume : dict.media.pause}
          className="-my-3 flex min-h-11 min-w-11 shrink-0 items-center justify-center text-bone-faint transition-colors hover:text-bone"
        >
          <span aria-hidden="true" className="label-fine">
            {paused ? '▶' : '❙❙'}
          </span>
        </button>
      </div>

      <div
        className="marquee mt-5"
        data-paused={paused || undefined}
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
      >
        {track(false)}
        {track(true)}
      </div>
    </>
  );
}
