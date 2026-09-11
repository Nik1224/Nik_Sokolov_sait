'use client';

/**
 * Отзывы клиентов (ТЗ §5.2: «отзывы только подтверждённые»).
 *
 * Показываются те, что клиенты оставили публично. Имя обязательно: отзыв без
 * автора ничего не подтверждает.
 *
 * На экране всегда один отзыв, крупно. Шесть блоков серого текста одинакового
 * веса читались стеной: глазу не за что зацепиться, и в итоге не читался ни
 * один. Чем больше отзывов показать разом, тем меньше им верят.
 *
 * Отзывы сменяются сами, но смена — не условие: любой можно выбрать штрихом
 * под цитатой, а при «уменьшить движение» автосмена не запускается вовсе.
 * Пока на блоке курсор или фокус, отзыв не меняется: читающего нельзя
 * перебивать.
 */

import { useEffect, useRef, useState } from 'react';
import type { Testimonial } from '@/content/types';
import { hasTranslation, localizedString } from '@/lib/i18n/localize';
import type { Dictionary } from '@/lib/i18n/dictionaries';
import type { Locale } from '@/lib/site';

type Props = { items: Testimonial[]; locale: Locale; dict: Dictionary };

/** Сколько отзыв стоит на экране. Меньше — не успеть дочитать длинный. */
const HOLD_MS = 7000;

export function Testimonials({ items, locale, dict }: Props) {
  const [index, setIndex] = useState(0);
  const [held, setHeld] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (items.length < 2 || held) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    /*
     * Смена идёт только пока блок на экране. Иначе к моменту, когда до него
     * долистают, отзывы успеют прокрутиться по кругу и человек попадёт на
     * середину набора без всякой причины.
     */
    const el = rootRef.current;
    if (!el) return;

    let timer: number | undefined;
    const observer = new IntersectionObserver(
      ([entry]) => {
        window.clearInterval(timer);
        if (entry.isIntersecting) {
          timer = window.setInterval(
            () => setIndex((current) => (current + 1) % items.length),
            HOLD_MS,
          );
        }
      },
      { threshold: 0.4 },
    );

    observer.observe(el);
    return () => {
      window.clearInterval(timer);
      observer.disconnect();
    };
  }, [items.length, held]);

  if (items.length === 0) return null;

  const current = items[Math.min(index, items.length - 1)];
  const text = localizedString(current.text, locale);
  const isFallback = !hasTranslation(current.text, locale);

  return (
    <div
      ref={rootRef}
      onMouseEnter={() => setHeld(true)}
      onMouseLeave={() => setHeld(false)}
      onFocusCapture={() => setHeld(true)}
      onBlurCapture={() => setHeld(false)}
    >
      <figure className="m-0 max-w-3xl">
        {/*
          key — чтобы проявление проигрывалось на каждой смене: без него React
          переиспользует узел, и текст просто подменяется на месте.
        */}
        <blockquote key={current._id} className="quote m-0 text-h2 text-balance text-bone">
          {text}
        </blockquote>
        <figcaption className="mt-8 flex flex-wrap items-center gap-3">
          <span className="label text-bone-faint">{current.author}</span>
          {isFallback ? (
            <span lang="en" className="label border border-line px-2 py-0.5 text-bone-faint">
              {dict.fallback.short}
            </span>
          ) : null}
        </figcaption>
      </figure>

      {items.length > 1 ? (
        <ul className="m-0 mt-10 flex list-none flex-wrap gap-2 p-0">
          {items.map((item, position) => (
            <li key={item._id} className="m-0">
              <button
                type="button"
                onClick={() => setIndex(position)}
                aria-current={position === index ? 'true' : undefined}
                /*
                 * Имя автора — единственная осмысленная подпись у штриха:
                 * «отзыв 3 из 6» ничего не говорит о том, куда ведёт.
                 */
                aria-label={item.author}
                className="group block cursor-pointer py-3"
              >
                <span
                  className={`block h-px w-8 transition-colors ${
                    position === index ? 'bg-accent' : 'bg-line-strong group-hover:bg-bone-faint'
                  }`}
                />
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
