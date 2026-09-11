'use client';

/**
 * Лента с прокруткой по горизонтали и управлением к ней.
 *
 * Обрез у правого края говорит «дальше есть ещё» — но только тому, кто уже
 * понял, что лента листается. Компания, пришедшая выбирать подрядчика, такой
 * догадкой заниматься не станет: она увидит четыре карточки и пойдёт дальше.
 * Поэтому под лентой стоят два ответа сразу — полоса, показывающая, сколько
 * пройдено, и стрелки, которыми листают без мыши с колесом.
 *
 * Полоса не декоративная: её длина — доля видимого в общей ширине ленты. Пока
 * лента помещается целиком, ни полосы, ни стрелок нет — управлять нечем.
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import type { ReactNode } from 'react';

type Props = {
  children: ReactNode;
  /** Подпись группы для ассистивных технологий. */
  label: string;
  previousLabel: string;
  nextLabel: string;
};

export function Rail({ children, label, previousLabel, nextLabel }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const [state, setState] = useState({ ratio: 1, offset: 0, atStart: true, atEnd: true });

  const measure = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    const max = el.scrollWidth - el.clientWidth;
    setState({
      ratio: el.scrollWidth > 0 ? el.clientWidth / el.scrollWidth : 1,
      offset: max > 0 ? el.scrollLeft / el.scrollWidth : 0,
      atStart: el.scrollLeft <= 1,
      // Округление вниз у дробных ширин не даёт доехать до точного максимума.
      atEnd: max <= 1 || el.scrollLeft >= max - 1,
    });
  }, []);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    measure();
    el.addEventListener('scroll', measure, { passive: true });
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    return () => {
      el.removeEventListener('scroll', measure);
      observer.disconnect();
    };
  }, [measure]);

  /** Шаг листания — ширина одной карточки вместе с зазором. */
  const step = useCallback((direction: 1 | -1) => {
    const el = ref.current;
    if (!el) return;
    const card = el.querySelector('li');
    const width = card ? card.getBoundingClientRect().width + 20 : el.clientWidth * 0.8;
    el.scrollBy({
      left: width * direction,
      behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth',
    });
  }, []);

  const scrollable = state.ratio < 0.999;

  return (
    <div role="group" aria-label={label}>
      <div ref={ref} className="rail overflow-x-auto overscroll-x-contain">
        {children}
      </div>

      {scrollable ? (
        <div className="container-wide mt-8 flex items-center gap-8 lg:mt-10">
          {/*
           * Полоса — дорожка во всю ширину и бегунок по ней. Не индикатор
           * загрузки: она показывает положение, поэтому и живёт под лентой,
           * а не над ней.
           */}
          <div aria-hidden="true" className="relative h-px flex-1 bg-line">
            <span
              className="absolute inset-y-0 bg-bone transition-[left,width] duration-[var(--duration-base)] ease-[var(--ease-out-soft)]"
              style={{ left: `${state.offset * 100}%`, width: `${state.ratio * 100}%` }}
            />
          </div>

          <div className="flex shrink-0 items-center gap-2">
            <button
              type="button"
              onClick={() => step(-1)}
              disabled={state.atStart}
              aria-label={previousLabel}
              className="label flex h-11 w-11 items-center justify-center border border-line text-bone transition-colors hover:border-bone disabled:opacity-30 disabled:hover:border-line"
            >
              <span aria-hidden="true">←</span>
            </button>
            <button
              type="button"
              onClick={() => step(1)}
              disabled={state.atEnd}
              aria-label={nextLabel}
              className="label flex h-11 w-11 items-center justify-center border border-line text-bone transition-colors hover:border-bone disabled:opacity-30 disabled:hover:border-line"
            >
              <span aria-hidden="true">→</span>
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
