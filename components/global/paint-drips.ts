/**
 * Форма подтёков краски.
 *
 * Капли задаются один раз детерминированным генератором: сервер и клиент
 * должны нарисовать одинаковую разметку, иначе React ругается на расхождение.
 * Случайность здесь нужна для естественности, а не для непредсказуемости.
 */

export type Drip = {
  /** Положение по ширине экрана, %. */
  left: number;
  /** Толщина струйки, px. */
  width: number;
  /** Насколько далеко убежит, px. */
  length: number;
  /** Диаметр набухшего кончика, px. */
  bulb: number;
  /** Доля от общей длительности: одни капли текут быстрее других. */
  speed: number;
  /** Задержка старта, доля длительности. */
  delay: number;
  /** Своя кривая разгона: одинаковая на всех выдаёт анимацию. */
  ease: string;
};

export type Droplet = { left: number; size: number; fall: number; speed: number; delay: number };

/** Простой генератор с фиксированным зерном — одинаковый на сервере и клиенте. */
function seeded(seed: number): () => number {
  let value = seed;
  return () => {
    value = (value * 1664525 + 1013904223) % 4294967296;
    return value / 4294967296;
  };
}

/**
 * Кривые разгона. Краска сперва держится за счёт вязкости, потом срывается
 * и ускоряется — поэтому все варианты начинаются полого. Одинаковая кривая
 * на всех струйках сразу выдаёт анимацию.
 */
const EASINGS = [
  'cubic-bezier(0.55, 0, 0.85, 0.45)',
  'cubic-bezier(0.7, 0, 0.9, 0.35)',
  'cubic-bezier(0.4, 0, 0.75, 0.6)',
  'cubic-bezier(0.8, 0.02, 0.95, 0.5)',
];

export function buildDrips(count = 30, seed = 20260827): Drip[] {
  const random = seeded(seed);
  const drips: Drip[] = [];

  for (let index = 0; index < count; index++) {
    // Позиции разбросаны по ячейкам: так капли не сбиваются в кучу.
    const cell = (index + random() * 0.9) / count;

    // Толщина: много тонких, редкие толстые.
    const thickness = random() ** 2.2;
    const width = 2 + thickness * 22;

    // Толстая струйка несёт больше краски и убегает дальше — связь не
    // строгая, иначе получается закономерность, заметная глазу.
    const reach = (thickness * 0.65 + random() * 0.5) ** 1.4;

    drips.push({
      left: cell * 100,
      width,
      length: 26 + reach * 520,
      // Кончик набухает тем заметнее, чем тоньше струйка.
      bulb: width * (1.6 - thickness * 0.35 + random() * 0.35),
      speed: 0.5 + random() * 0.55,
      delay: random() ** 1.6 * 0.34,
      ease: EASINGS[Math.floor(random() * EASINGS.length)],
    });
  }

  return drips;
}

/**
 * Рваная кромка самой массы. Ровная линия читается как прямоугольник,
 * а не как налитая краска.
 */
export function buildEdgePath(seed = 77123, steps = 26, depth = 46): string {
  const random = seeded(seed);
  const width = 1200;
  const step = width / steps;

  let path = 'M0,0';
  for (let index = 0; index < steps; index++) {
    const x = (index + 1) * step;
    const dip = (0.25 + random() ** 1.5) * depth;
    path += ` Q${(x - step / 2).toFixed(1)},${dip.toFixed(1)} ${x.toFixed(1)},${(random() * depth * 0.35).toFixed(1)}`;
  }
  return `${path} L${width},-40 L0,-40 Z`;
}

/** Отдельные капли, оторвавшиеся от массы и убежавшие вперёд. */
export function buildDroplets(count = 7, seed = 31415): Droplet[] {
  const random = seeded(seed);
  const droplets: Droplet[] = [];

  for (let index = 0; index < count; index++) {
    droplets.push({
      left: ((index + random() * 0.7) / count) * 100,
      size: 5 + random() * 8,
      fall: 220 + random() * 460,
      speed: 0.5 + random() * 0.35,
      delay: random() * 0.2,
    });
  }

  return droplets;
}
