'use client';

/**
 * Лента с прокруткой по горизонтали, управлением и собственным ходом.
 *
 * Обрез у правого края говорит «дальше есть ещё» — но только тому, кто уже
 * понял, что лента листается. Компания, пришедшая выбирать подрядчика, такой
 * догадкой заниматься не станет. Поэтому под лентой стоят три ответа сразу:
 * полоса, показывающая пройденное, стрелки и медленный собственный ход.
 *
 * Ход сделан прокруткой, а не сдвигом дорожки, как у бегущей строки с
 * названиями. Разница принципиальная: там едет копия текста, здесь — настоящий
 * список ссылок. Сдвигать его трансформацией значило бы разойтись с реальным
 * положением прокрутки, сломать и стрелки, и полосу прогресса, и обычное
 * листание пальцем. Двигая `scrollLeft`, лента остаётся обычной прокруткой —
 * просто кто-то её подталкивает.
 *
 * Ход не петля, а маятник: дойдя до края, лента разворачивается. Петля
 * потребовала бы второго комплекта карточек, а это второй комплект настоящих
 * ссылок на те же страницы — и бессмысленная полоса прогресса в придачу.
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import type { Dictionary } from '@/lib/i18n/dictionaries';

type Props = {
  children: ReactNode;
  dict: Dictionary;
  /** Подпись группы для ассистивных технологий. */
  label: string;
};

/**
 * Скорость хода в пикселях за секунду. Медленно настолько, чтобы успевать
 * разглядывать кадр, и не настолько, чтобы движение казалось зависшим.
 */
const SPEED = 18;

/** Сколько лента стоит после того, как её листнули рукой. */
const MANUAL_PAUSE_MS = 3000;

export function Rail({ children, dict, label }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const [state, setState] = useState({ ratio: 1, offset: 0, atStart: true, atEnd: true });
  const [paused, setPaused] = useState(false);

  /**
   * Состояние хода держится в ref: перерисовка кадра анимации не нужна.
   *
   * `position` — собственное дробное положение. Без него ход не работает
   * вовсе: за кадр лента должна сдвинуться на треть пикселя, а `scrollLeft`
   * округляется до целых — каждый такой сдвиг обнулялся, и лента стояла.
   * Поэтому позиция копится здесь, а в прокрутку уходит уже накопленное.
   */
  const motion = useRef({ direction: 1, manualUntil: 0, hovered: false, visible: true, position: 0 });

  const measure = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    const max = el.scrollWidth - el.clientWidth;
    const next = {
      ratio: el.scrollWidth > 0 ? el.clientWidth / el.scrollWidth : 1,
      offset: max > 0 ? el.scrollLeft / el.scrollWidth : 0,
      atStart: el.scrollLeft <= 1,
      // Округление вниз у дробных ширин не даёт доехать до точного максимума.
      atEnd: max <= 1 || el.scrollLeft >= max - 1,
    };
    setState((prev) =>
      // Ход двигает ленту каждый кадр. Перерисовывать управление на каждый
      // пиксель незачем — только когда полоса прогресса заметно сдвинулась.
      Math.abs(prev.offset - next.offset) > 0.002 ||
      prev.atStart !== next.atStart ||
      prev.atEnd !== next.atEnd ||
      Math.abs(prev.ratio - next.ratio) > 0.002
        ? next
        : prev,
    );
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

  /* --- Собственный ход --------------------------------------------------- */

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // Попросили не двигать интерфейс — не двигаем. Лента остаётся обычной
    // прокруткой со стрелками.
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const flags = motion.current;

    // За экраном лента не едет: считать кадры для того, чего не видно, незачем.
    const watcher = new IntersectionObserver(
      ([entry]) => {
        flags.visible = entry.isIntersecting;
      },
      { threshold: 0 },
    );
    watcher.observe(el);

    // Коснулись ленты — ход встаёт сразу, ещё до того как она сдвинулась хоть
    // на пиксель: палец может лечь и не повести.
    const hold = () => {
      flags.manualUntil = performance.now() + MANUAL_PAUSE_MS;
    };
    el.addEventListener('pointerdown', hold);
    el.addEventListener('wheel', hold, { passive: true });
    el.addEventListener('touchstart', hold, { passive: true });

    /*
     * Ход подхватывает ленту там, где её оставили.
     *
     * Раньше положение запоминалось в момент касания, и этого было мало:
     * пока палец тянул, запомненная точка не двигалась, а через три секунды
     * ход возвращал ленту ровно в неё — прокрутка отменялась сама собой.
     *
     * Ловить `touchend` тоже мало: после броска лента едет по инерции ещё
     * секунду, и в момент отпускания она не там, где окажется. Единственное
     * событие, которое знает настоящее положение, — сама прокрутка.
     *
     * Своя прокрутка от чужой отличается без флагов: собственный кадр пишет в
     * `scrollLeft` ровно `flags.position`, поэтому после него расхождение
     * меньше пикселя (браузер округляет дробную позицию). Всё, что больше, —
     * не наше: палец, колесо или инерция.
     */
    const adopt = () => {
      if (Math.abs(el.scrollLeft - flags.position) <= 2) return;
      flags.position = el.scrollLeft;
      // Инерция — продолжение жеста, а не новый: отсчёт паузы начинается
      // заново, и ход не вступает посреди броска.
      flags.manualUntil = performance.now() + MANUAL_PAUSE_MS;
    };
    el.addEventListener('scroll', adopt, { passive: true });

    let frame = 0;
    let previous = 0;

    const step = (time: number) => {
      frame = requestAnimationFrame(step);
      const delta = previous ? Math.min(time - previous, 64) : 0;
      previous = time;

      const max = el.scrollWidth - el.clientWidth;
      if (
        !delta ||
        max <= 1 ||
        paused ||
        flags.hovered ||
        !flags.visible ||
        time < flags.manualUntil ||
        // Фокус внутри — человек листает с клавиатуры, и уезжающая под ним
        // лента этому только мешает.
        el.contains(document.activeElement)
      ) {
        return;
      }

      const next = flags.position + (SPEED * delta * flags.direction) / 1000;
      if (next >= max) {
        flags.position = max;
        flags.direction = -1;
      } else if (next <= 0) {
        flags.position = 0;
        flags.direction = 1;
      } else {
        flags.position = next;
      }
      el.scrollLeft = flags.position;
    };

    frame = requestAnimationFrame(step);
    return () => {
      cancelAnimationFrame(frame);
      watcher.disconnect();
      el.removeEventListener('pointerdown', hold);
      el.removeEventListener('wheel', hold);
      el.removeEventListener('touchstart', hold);
      el.removeEventListener('scroll', adopt);
    };
  }, [paused]);

  /** Шаг листания — ширина одной карточки вместе с зазором. */
  const step = useCallback((direction: 1 | -1) => {
    const el = ref.current;
    if (!el) return;
    const card = el.querySelector('li');
    const width = card ? card.getBoundingClientRect().width + 20 : el.clientWidth * 0.8;

    motion.current.manualUntil = performance.now() + MANUAL_PAUSE_MS;
    motion.current.direction = direction;
    // Ход подхватит ленту там, куда её листнули, а не там, где она была.
    motion.current.position = Math.max(
      0,
      Math.min(el.scrollWidth - el.clientWidth, el.scrollLeft + width * direction),
    );
    el.scrollBy({
      left: width * direction,
      behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth',
    });
  }, []);

  const scrollable = state.ratio < 0.999;
  const control =
    'label flex h-11 w-11 items-center justify-center border border-line text-bone transition-colors hover:border-bone disabled:opacity-30 disabled:hover:border-line';

  return (
    <div
      role="group"
      aria-label={label}
      onMouseEnter={() => {
        motion.current.hovered = true;
      }}
      onMouseLeave={() => {
        motion.current.hovered = false;
      }}
    >
      <div ref={ref} className="rail overflow-x-auto overscroll-x-contain">
        {children}
      </div>

      {scrollable ? (
        <div className="container-wide mt-8 flex items-center gap-8 lg:mt-10">
          {/*
           * Полоса — дорожка во всю ширину и бегунок по ней. Не индикатор
           * загрузки: она показывает положение, поэтому и живёт под лентой.
           */}
          <div aria-hidden="true" className="relative h-px flex-1 bg-line">
            <span
              className="absolute inset-y-0 bg-bone"
              style={{ left: `${state.offset * 100}%`, width: `${state.ratio * 100}%` }}
            />
          </div>

          <div className="flex shrink-0 items-center gap-2">
            <button
              type="button"
              onClick={() => setPaused((value) => !value)}
              aria-pressed={paused}
              aria-label={paused ? dict.media.resume : dict.media.pause}
              className={control}
            >
              <span aria-hidden="true" className="label-fine">
                {paused ? '▶' : '❙❙'}
              </span>
            </button>
            <button
              type="button"
              onClick={() => step(-1)}
              disabled={state.atStart}
              aria-label={dict.media.previous}
              className={control}
            >
              <span aria-hidden="true">←</span>
            </button>
            <button
              type="button"
              onClick={() => step(1)}
              disabled={state.atEnd}
              aria-label={dict.media.next}
              className={control}
            >
              <span aria-hidden="true">→</span>
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
