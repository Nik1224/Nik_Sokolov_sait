'use client';

/**
 * Слой перехода: краска заливается сверху, закрывает экран, и уже под ней
 * происходит смена страницы.
 *
 * Живёт в общем layout — только он переживает смену маршрута. Компонент внутри
 * страницы размонтировался бы вместе с ней, и анимация обрывалась бы.
 *
 * Анимация управляется напрямую через Web Animations API, а не CSS-переходом
 * по смене состояния: переход зависел от того, когда React успеет отрисовать
 * кадр, из-за чего заливка стартовала с опозданием и адрес менялся раньше,
 * чем экран закрывался — был виден скачок.
 */

import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { PAINT_EVENT, type PaintRequest } from '@/lib/transition';

const POUR_MS = 380;
const DRAIN_MS = 340;
/** Если маршрут почему-то не сменился, краску всё равно нужно убрать. */
const SAFETY_MS = 2500;

/** Неровный нижний край: краска бежит вперёд неровными языками. */
const DRIP_PATH =
  'M0,0 Q66,58 133,0 Q200,112 266,0 Q333,34 400,0 Q466,88 533,0 Q600,46 666,0 ' +
  'Q733,124 800,0 Q866,52 933,0 Q1000,96 1066,0 Q1133,38 1200,0 L1200,-24 L0,-24 Z';

export function PaintTransition() {
  const router = useRouter();
  const pathname = usePathname();

  const sheetRef = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  const [color, setColor] = useState('#08080a');

  const targetRef = useRef<string | null>(null);
  const safetyRef = useRef<number | null>(null);

  useEffect(() => {
    async function onRequest(event: Event) {
      const { href, colorVar } = (event as CustomEvent<PaintRequest>).detail;
      const sheet = sheetRef.current;
      if (!sheet) {
        router.push(href);
        return;
      }

      const resolved = getComputedStyle(document.documentElement)
        .getPropertyValue(colorVar)
        .trim();
      setColor(resolved || '#08080a');
      setVisible(true);

      sheet.getAnimations().forEach((animation) => animation.cancel());
      // Кадр на применение цвета и видимости — дальше анимация идёт сама.
      await new Promise((resolve) => requestAnimationFrame(resolve));

      const pour = sheet.animate(
        [{ transform: 'translateY(-110%)' }, { transform: 'translateY(0%)' }],
        { duration: POUR_MS, easing: 'cubic-bezier(0.45, 0, 0.7, 0)', fill: 'forwards' },
      );

      // Адрес меняем только когда экран закрыт целиком: иначе виден скачок.
      await pour.finished.catch(() => undefined);

      targetRef.current = href;
      if (safetyRef.current) window.clearTimeout(safetyRef.current);
      safetyRef.current = window.setTimeout(() => drain(), SAFETY_MS);

      router.push(href);
    }

    window.addEventListener(PAINT_EVENT, onRequest);
    return () => window.removeEventListener(PAINT_EVENT, onRequest);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router]);

  function drain() {
    targetRef.current = null;
    if (safetyRef.current) {
      window.clearTimeout(safetyRef.current);
      safetyRef.current = null;
    }

    const sheet = sheetRef.current;
    if (!sheet) {
      setVisible(false);
      return;
    }

    const out = sheet.animate(
      [{ transform: 'translateY(0%)' }, { transform: 'translateY(110%)' }],
      { duration: DRAIN_MS, easing: 'cubic-bezier(0.3, 0, 0.2, 1)', fill: 'forwards' },
    );

    // Анимацию не отменяем: она держит краску за нижним краем (fill: forwards).
    // Сброс наверх здесь давал кадр, где слой ещё виден, но уже перепрыгнул.
    // Позицию сбросит следующий запуск — перед началом заливки.
    out.finished.then(() => setVisible(false)).catch(() => setVisible(false));
  }

  // Новая страница отрисовалась — отпускаем краску вниз.
  useEffect(() => {
    if (!targetRef.current || !pathname.startsWith(targetRef.current)) return;
    drain();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  return (
    <div
      aria-hidden="true"
      data-paint-layer=""
      className="pointer-events-none fixed inset-0 z-[100]"
      style={{ visibility: visible ? 'visible' : 'hidden' }}
    >
      <div
        ref={sheetRef}
        className="absolute inset-0"
        style={{ backgroundColor: color, transform: 'translateY(-110%)' }}
      >
        <svg
          viewBox="0 0 1200 130"
          preserveAspectRatio="none"
          className="absolute left-0 top-full h-[9vh] w-full"
        >
          <path d={DRIP_PATH} fill={color} />
        </svg>
      </div>
    </div>
  );
}
