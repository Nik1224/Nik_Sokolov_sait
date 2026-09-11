/**
 * Общие детали журнальной вёрстки ветки BUSINESS.
 *
 * Живут отдельно от компонентов остальных веток намеренно: у BUSINESS своя
 * тональная лестница, свой масштаб типографики и своя сетка, и попытка выразить
 * это вариантами общих компонентов кончилась бы флагами `variant` во всех
 * шаблонах сайта. Здесь же ничего чужого не задевается вовсе.
 */

import Link from 'next/link';
import type { CSSProperties, ReactNode } from 'react';

/** Ступень тональной лестницы ветки. */
export type Tone =
  | 'ink'
  | 'graphite'
  | 'warm-graphite'
  | 'stone-dark'
  | 'stone'
  | 'warm-grey'
  | 'paper'
  | 'ivory';

/**
 * Вертикальный ритм. Одинаковый отступ во всех блоках и есть та «лента
 * компонентов», от которой уходим: полосе нужно то сжиматься, то дышать.
 */
const SPACE = {
  tight: 'py-[clamp(3.5rem,6vw,6rem)]',
  normal: 'py-[clamp(5rem,9vw,10rem)]',
  wide: 'py-[clamp(6.5rem,12vw,14rem)]',
} as const;

type BandProps = {
  /** Тон, которым закончилась полоса выше. Стык получается точным, а не похожим. */
  from: Tone;
  /** Тон самой полосы: на нём стоит содержимое. */
  core: Tone;
  /** Тон, которым начнётся полоса ниже. */
  to: Tone;
  /** Светлое поле или тёмное: от этого зависит, каким становится текст. */
  mode?: 'light' | 'dark';
  /**
   * Ровный тон до самого края вместо перехода. Нужен там, где полоса делает
   * шаг через всю лестницу: сойтись мягко из бумаги в тёмное невозможно —
   * переход пройдёт через мёртвую середину шкалы и станет размывом.
   */
  cut?: boolean;
  space?: keyof typeof SPACE;
  id?: string;
  children: ReactNode;
  className?: string;
};

/**
 * Стили полосы для блоков со своей раскладкой — тех, что не помещаются в
 * `Band`. Поле у них то же самое, поэтому и границы задаются так же.
 */
export function bandField(from: Tone, core: Tone, to: Tone): CSSProperties {
  return {
    '--band-from': `var(--t-${from})`,
    '--band-core': `var(--t-${core})`,
    '--band-to': `var(--t-${to})`,
  } as CSSProperties;
}

export function Band({
  from,
  core,
  to,
  mode = 'light',
  cut = false,
  space = 'normal',
  id,
  children,
  className = '',
}: BandProps) {
  return (
    <section
      id={id}
      className={`band ${cut ? 'band-cut' : ''} ${mode === 'dark' ? 'band-dark' : 'band-light'} ${SPACE[space]} ${className}`}
      style={
        {
          '--band-from': `var(--t-${from})`,
          '--band-core': `var(--t-${core})`,
          '--band-to': `var(--t-${to})`,
        } as CSSProperties
      }
    >
      <div className="container-wide">{children}</div>
    </section>
  );
}

/**
 * Заголовок полосы.
 *
 * Без номера. Нумерация имеет право стоять там, где порядок — часть смысла:
 * у шагов работы, которые идут один за другим, и у карточек ленты, где номер
 * работает в паре с полосой прокрутки. Разделы страницы последовательностью не
 * являются: «03» перед словом «Кейсы» не сообщает ничего, зато отодвигает
 * заголовок на двести пикселей вправо и оставляет дыру, которую глаз каждый
 * раз перепрыгивает.
 */
export function BandHead({
  title,
  lead,
  action,
}: {
  title: string;
  lead?: string;
  action?: { label: string; href: string };
}) {
  return (
    <header data-reveal className="border-t border-line pt-6">
      <div className="editorial-grid items-baseline gap-y-6">
        <h2 className="text-h2 col-span-12 m-0 uppercase text-balance lg:col-span-8">{title}</h2>
        {action ? (
          <p className="col-span-12 m-0 lg:col-span-4 lg:justify-self-end">
            <Link
              href={action.href}
              className="label group inline-flex items-center gap-3 text-bone-dim transition-colors hover:text-bone"
            >
              {action.label}
              <span aria-hidden="true" className="transition-transform group-hover:translate-x-1">
                →
              </span>
            </Link>
          </p>
        ) : null}
      </div>
      {lead ? (
        <p className="mt-8 max-w-[46ch] text-lead text-bone-dim lg:mt-10">{lead}</p>
      ) : null}
    </header>
  );
}

/**
 * Кнопка. Прямоугольная и ровно одной высоты во всех видах: скруглённая или
 * разной высоты она сразу читается как элемент приложения, а не полосы.
 */
export function Cta({
  href,
  children,
  variant = 'solid',
  className = '',
}: {
  href: string;
  children: ReactNode;
  variant?: 'solid' | 'outline' | 'bare';
  className?: string;
}) {
  /*
   * Заливка наезжает снизу, а не меняется скачком. Цвет наезда у сплошной и
   * обведённой кнопки разный: сплошная уходит в бронзу, обведённая заливается
   * основным тоном текста и выворачивает надпись.
   */
  /*
   * На наведении кнопки меняются местами: сплошная становится обведённой,
   * обведённая — сплошной. Раньше сплошная заливалась акцентом, но акцент на
   * светлом поле почти совпадает с её собственной плашкой, и наведения не было
   * видно вовсе. Обмен ролями виден всегда и объясняет пару: это одно действие
   * в двух весах, а не две разные кнопки.
   *
   * Рамка у сплошной есть с самого начала — просто цветом плашки. На
   * наведении плашка уходит, рамка остаётся.
   */
  const look =
    variant === 'solid'
      ? 'border border-bone bg-bone text-ink hover:text-bone [--btn-wipe:var(--band-core)]'
      : variant === 'outline'
        ? 'border border-line-strong text-bone hover:text-ink [--btn-wipe:var(--color-bone)]'
        : 'text-bone hover:text-accent';

  return (
    <Link href={href} className={`btn label rounded-none transition-colors ${look} ${className}`}>
      <span className="btn-label">{children}</span>
      <span aria-hidden="true" className="btn-arrow">
        →
      </span>
    </Link>
  );
}

/**
 * Строка, выезжающая из-под обреза.
 *
 * Обёртка режет, содержимое едет. Разделение обязательно: анимировать сам
 * текст без обрезающего родителя — значит показать его в пути, а весь смысл
 * приёма в том, что до своего места строка не видна.
 */
export function Rise({
  delay = 0,
  className = '',
  children,
}: {
  /** Задержка в миллисекундах: строки выходят друг за другом, а не разом. */
  delay?: number;
  className?: string;
  children: ReactNode;
}) {
  return (
    <div className={`rise ${className}`} style={{ '--rise-delay': `${delay}ms` } as CSSProperties}>
      <div>{children}</div>
    </div>
  );
}

/** Строка технических подписей: формат, город, год. Разделитель — не запятая. */
export function FineRow({ items, className = '' }: { items: (string | undefined)[]; className?: string }) {
  const visible = items.filter(Boolean) as string[];
  if (visible.length === 0) return null;

  return (
    <p className={`label-fine m-0 flex flex-wrap items-center gap-x-3 gap-y-2 ${className}`}>
      {visible.map((item, index) => (
        <span key={item} className="flex items-center gap-x-3">
          {index > 0 ? (
            <span aria-hidden="true" className="inline-block h-px w-4 bg-line-strong" />
          ) : null}
          {item}
        </span>
      ))}
    </p>
  );
}
