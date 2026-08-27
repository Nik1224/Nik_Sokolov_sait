'use client';

/**
 * Слой перехода: краска льётся сверху, стекает подтёками и закрывает экран.
 * Смена страницы происходит уже под ней.
 *
 * Живёт в общем layout — только он переживает смену маршрута. Компонент внутри
 * страницы размонтировался бы вместе с ней, и анимация обрывалась бы.
 *
 * Анимация идёт через Web Animations API, а не CSS-переходом по смене
 * состояния: переход зависел от того, когда React успеет отрисовать кадр,
 * из-за чего заливка стартовала с опозданием и адрес менялся раньше, чем
 * экран закрывался.
 *
 * Каждая струйка анимируется отдельно и со своей скоростью — иначе край
 * выглядит нарисованной волной, а не текущей краской. Двигаются только
 * transform: масса, струйки и капли не трогают раскладку.
 */

import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useMemo, useRef, useState } from 'react';
import { PAINT_EVENT, type PaintRequest } from '@/lib/transition';
import { buildDrips, buildDroplets, buildEdgePath } from './paint-drips';

const POUR_MS = 620;
const DRAIN_MS = 380;
/** Струйки живут дольше массы: она уже встала, а они ещё бегут. */
const DRIP_MS = 900;
/** Если маршрут почему-то не сменился, краску всё равно нужно убрать. */
const SAFETY_MS = 2500;

/** Масса разгоняется под тяжестью и не тормозит — её ход обрывает край экрана. */
const MASS_EASE = 'cubic-bezier(0.5, 0, 0.85, 0.55)';

export function PaintTransition() {
  const router = useRouter();
  const pathname = usePathname();

  const layerRef = useRef<HTMLDivElement>(null);
  const sheetRef = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  const [color, setColor] = useState('#08080a');

  const targetRef = useRef<string | null>(null);
  const safetyRef = useRef<number | null>(null);

  const drips = useMemo(() => buildDrips(), []);
  const droplets = useMemo(() => buildDroplets(), []);
  const edgePath = useMemo(() => buildEdgePath(), []);

  useEffect(() => {
    async function onRequest(event: Event) {
      const { href, colorVar } = (event as CustomEvent<PaintRequest>).detail;
      const sheet = sheetRef.current;
      const layer = layerRef.current;
      if (!sheet || !layer) {
        router.push(href);
        return;
      }

      const resolved = getComputedStyle(document.documentElement)
        .getPropertyValue(colorVar)
        .trim();
      setColor(resolved || '#08080a');
      setVisible(true);

      layer.getAnimations({ subtree: true }).forEach((animation) => animation.cancel());
      await new Promise((resolve) => requestAnimationFrame(resolve));

      // Масса краски.
      const pour = sheet.animate(
        [{ transform: 'translateY(-100%)' }, { transform: 'translateY(0%)' }],
        { duration: POUR_MS, easing: MASS_EASE, fill: 'forwards' },
      );

      // Струйки: у каждой своя скорость, задержка и кривая разгона.
      layer.querySelectorAll<HTMLElement>('[data-drip-column]').forEach((column) => {
        const speed = Number(column.dataset.speed ?? 1);
        const delay = Number(column.dataset.delay ?? 0);
        const ease = column.dataset.ease ?? MASS_EASE;
        column.animate([{ transform: 'scaleY(0)' }, { transform: 'scaleY(1)' }], {
          duration: DRIP_MS * speed,
          delay: POUR_MS * delay,
          easing: ease,
          fill: 'forwards',
        });
      });

      layer.querySelectorAll<HTMLElement>('[data-drip-bulb]').forEach((bulb) => {
        const speed = Number(bulb.dataset.speed ?? 1);
        const delay = Number(bulb.dataset.delay ?? 0);
        const length = Number(bulb.dataset.length ?? 0);
        const ease = bulb.dataset.ease ?? MASS_EASE;
        bulb.animate(
          [{ transform: 'translate(-50%, 0px)' }, { transform: `translate(-50%, ${length}px)` }],
          { duration: DRIP_MS * speed, delay: POUR_MS * delay, easing: ease, fill: 'forwards' },
        );
      });

      // Оторвавшиеся капли убегают вперёд массы.
      layer.querySelectorAll<HTMLElement>('[data-droplet]').forEach((droplet) => {
        const speed = Number(droplet.dataset.speed ?? 1);
        const delay = Number(droplet.dataset.delay ?? 0);
        const fall = Number(droplet.dataset.fall ?? 0);
        droplet.animate(
          [
            { transform: 'translate(-50%, 0px)', opacity: 1 },
            { transform: `translate(-50%, ${fall}px)`, opacity: 1, offset: 0.85 },
            { transform: `translate(-50%, ${fall * 1.1}px)`, opacity: 0 },
          ],
          { duration: DRIP_MS * speed, delay: POUR_MS * delay, easing: MASS_EASE, fill: 'forwards' },
        );
      });

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
      [{ transform: 'translateY(0%)' }, { transform: 'translateY(105%)' }],
      { duration: DRAIN_MS, easing: 'cubic-bezier(0.35, 0, 0.2, 1)', fill: 'forwards' },
    );

    // Анимацию не отменяем: она держит краску за нижним краем (fill: forwards).
    // Позицию сбросит следующий запуск — перед началом заливки.
    out.finished.then(() => setVisible(false)).catch(() => setVisible(false));
  }

  // Новая страница отрисовалась — отпускаем краску вниз.
  useEffect(() => {
    if (!targetRef.current || !pathname.startsWith(targetRef.current)) return;
    drain();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  /**
   * Блик вдоль струйки: без него краска выглядит матовой наклейкой.
   * На тонких струйках и мелких каплях градиент всё равно не читается, а
   * отрисовка десятков градиентов разом роняла кадры — там оставляем заливку.
   */
  const gloss =
    'linear-gradient(90deg, rgba(255,255,255,0) 8%, rgba(255,255,255,0.26) 30%, rgba(255,255,255,0.05) 52%, rgba(0,0,0,0.14) 96%)';
  const GLOSS_MIN_WIDTH = 9;

  return (
    <div
      ref={layerRef}
      aria-hidden="true"
      data-paint-layer=""
      className="pointer-events-none fixed inset-0 z-[100] overflow-hidden"
      style={{ visibility: visible ? 'visible' : 'hidden' }}
    >
      <div
        ref={sheetRef}
        className="absolute inset-x-0 top-0 h-full"
        style={{ backgroundColor: color, transform: 'translateY(-100%)' }}
      >
        {/* Рваная кромка: ровная линия читается как прямоугольник. */}
        <svg
          viewBox="0 0 1200 60"
          preserveAspectRatio="none"
          className="absolute inset-x-0 top-full h-11 w-full"
        >
          <path d={edgePath} fill={color} />
        </svg>

        {/* Струйки висят на нижней кромке массы и растут вниз. */}
        <div className="absolute inset-x-0 top-full h-0">
          {drips.map((drip, index) => (
            <div
              key={index}
              className="absolute top-0"
              style={{ left: `${drip.left}%`, width: drip.width, transform: 'translateX(-50%)' }}
            >
              <div
                data-drip-column=""
                data-speed={drip.speed}
                data-delay={drip.delay}
                data-ease={drip.ease}
                className="absolute left-0 top-0 w-full origin-top"
                style={{
                  height: drip.length,
                  backgroundColor: color,
                  backgroundImage: drip.width >= GLOSS_MIN_WIDTH ? gloss : undefined,
                  borderRadius: `0 0 ${drip.width}px ${drip.width}px`,
                  transform: 'scaleY(0)',
                }}
              />
              <div
                data-drip-bulb=""
                data-speed={drip.speed}
                data-delay={drip.delay}
                data-length={drip.length}
                data-ease={drip.ease}
                className="absolute left-1/2 top-0 rounded-full"
                style={{
                  width: drip.bulb,
                  height: drip.bulb * 1.08,
                  marginTop: -drip.bulb * 0.55,
                  backgroundColor: color,
                  backgroundImage: drip.bulb >= GLOSS_MIN_WIDTH ? gloss : undefined,
                  transform: 'translate(-50%, 0px)',
                }}
              />
            </div>
          ))}

          {droplets.map((droplet, index) => (
            <div
              key={`d${index}`}
              data-droplet=""
              data-speed={droplet.speed}
              data-delay={droplet.delay}
              data-fall={droplet.fall}
              className="absolute top-0 rounded-full"
              style={{
                left: `${droplet.left}%`,
                width: droplet.size,
                height: droplet.size * 1.25,
                backgroundColor: color,
                transform: 'translate(-50%, 0px)',
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
