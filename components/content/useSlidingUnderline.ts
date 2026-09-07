'use client';

/**
 * Линия, которая переезжает под выбранный пункт (M5).
 *
 * Мгновенная перекраска текста в акцент не говорит, откуда и куда переключили.
 * Одна линия на весь ряд, которая едет к новому пункту, — говорит.
 *
 * Линия — усиление. Выбранный пункт отличается ещё и цветом, поэтому без
 * скрипта ряд остаётся понятным: пока линия не поставлена, у неё нулевая
 * ширина, и её просто не видно.
 */

import { useCallback, useLayoutEffect, useRef, useState } from 'react';

export function useSlidingUnderline<Container extends HTMLElement = HTMLDivElement>(
  activeKey: string | undefined,
) {
  const containerRef = useRef<Container | null>(null);
  const barRef = useRef<HTMLSpanElement | null>(null);
  const items = useRef(new Map<string, HTMLElement>());
  /** Пока линия не измерена, переход выключен: иначе она приедет из угла. */
  const [placed, setPlaced] = useState(false);

  const setItem = useCallback(
    (key: string) => (el: HTMLElement | null) => {
      if (el) items.current.set(key, el);
      else items.current.delete(key);
    },
    [],
  );

  useLayoutEffect(() => {
    const bar = barRef.current;
    const container = containerRef.current;
    const active = activeKey ? items.current.get(activeKey) : undefined;
    if (!bar || !container) return;

    if (!active) {
      // Ничего не выбрано — линии нет. Например, «Смотреть все» в листинге.
      bar.style.width = '0px';
      return;
    }

    let alive = true;
    const place = () => {
      // Элемент могли размонтировать, пока мы ждали шрифты: у оторванного от
      // документа узла все смещения нулевые, и линия уехала бы в угол.
      if (!alive || !active.isConnected) return;
      bar.style.width = `${active.offsetWidth}px`;
      bar.style.transform = `translate(${active.offsetLeft}px, ${active.offsetTop + active.offsetHeight}px)`;
      setPlaced(true);
    };

    place();

    // Ряд переносится и меняет ширины вместе с окном.
    const observer = new ResizeObserver(place);
    observer.observe(container);
    // И ещё раз — когда доедет шрифт: до этого ширины считаны по запасному.
    void document.fonts?.ready.then(place).catch(() => undefined);

    return () => {
      alive = false;
      observer.disconnect();
    };
  }, [activeKey]);

  return { containerRef, barRef, setItem, placed };
}
