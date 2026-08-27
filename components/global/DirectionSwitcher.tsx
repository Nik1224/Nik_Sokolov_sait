'use client';

/**
 * Переключатель направления (ТЗ §4, §17).
 *
 * Реализован как disclosure: кнопка с `aria-expanded` + `aria-controls` и
 * список направлений. Нативный <details> здесь не подошёл — браузеры
 * экспонируют его как `group`, и ассистивные технологии не сообщают, что
 * элемент раскрывается.
 *
 * Активное направление помечено `aria-current` и продублировано текстом для
 * скринридера. Переход ведёт на Home выбранной ветки; «Все направления» —
 * на START (§4).
 */

import Link from 'next/link';
import { useEffect, useId, useRef, useState } from 'react';
import { track } from '@/lib/analytics';
import type { Dictionary } from '@/lib/i18n/dictionaries';
import { directionHomeHref, startHref } from '@/lib/routing';
import type { Direction, Locale } from '@/lib/site';

type Props = {
  locale: Locale;
  current: Direction;
  directions: { key: Direction; label: string }[];
  dict: Dictionary;
};

export function DirectionSwitcher({ locale, current, directions, dict }: Props) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const panelId = useId();

  useEffect(() => {
    if (!open) return;

    function onPointerDown(event: MouseEvent) {
      if (!containerRef.current?.contains(event.target as Node)) setOpen(false);
    }
    function onKeyDown(event: KeyboardEvent) {
      if (event.key !== 'Escape') return;
      setOpen(false);
      // Возвращаем фокус на кнопку: иначе он «повисает» в закрытой панели.
      buttonRef.current?.focus();
    }

    document.addEventListener('pointerdown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('pointerdown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [open]);

  const currentLabel = directions.find((item) => item.key === current)?.label ?? current;

  return (
    <div ref={containerRef} className="relative">
      <button
        ref={buttonRef}
        type="button"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((value) => !value)}
        className="label flex items-center gap-2 text-bone"
      >
        <span className="sr-only">{dict.common.chooseDirection}: </span>
        {currentLabel}
        <span aria-hidden="true" className="text-accent">
          ↓
        </span>
      </button>

      <div
        id={panelId}
        hidden={!open}
        className="absolute left-0 top-full z-50 mt-3 min-w-56 border border-line bg-ink-raised py-2 shadow-2xl"
      >
        <ul className="m-0 list-none p-0">
          {directions.map((item) => {
            const isCurrent = item.key === current;
            return (
              <li key={item.key}>
                <Link
                  href={directionHomeHref(locale, item.key)}
                  aria-current={isCurrent ? 'true' : undefined}
                  onClick={() => {
                    if (!isCurrent) track('direction_switch', { from: current, to: item.key });
                    setOpen(false);
                  }}
                  className={`label block px-4 py-3 transition-colors ${
                    isCurrent ? 'text-accent' : 'text-bone-dim hover:text-bone'
                  }`}
                >
                  {item.label}
                  {isCurrent ? <span className="sr-only"> — {dict.common.currentDirection}</span> : null}
                </Link>
              </li>
            );
          })}
          <li className="mt-2 border-t border-line pt-2">
            <Link
              href={startHref(locale)}
              onClick={() => setOpen(false)}
              className="label block px-4 py-3 text-bone-faint transition-colors hover:text-bone"
            >
              {dict.common.allDirections}
            </Link>
          </li>
        </ul>
      </div>
    </div>
  );
}
