'use client';

/**
 * Короткие петли на плитках и карточках: когда их показывать и когда грузить.
 *
 * Раньше адрес ролика подставлялся в момент наведения — и человек ждал, пока
 * полтора мегабайта доедут по сети: пять, десять секунд. Наведение при этом
 * уже кончалось. Смысл петли в том, что она отвечает сразу, иначе её лучше бы
 * не было вовсе.
 *
 * Теперь ролик греется заранее — когда блок появился на экране, — а к моменту
 * наведения он уже в кэше и стартует мгновенно. Осторожность, ради которой всё
 * откладывалось, осталась: при «экономии трафика» и «уменьшить движение» не
 * грузится по-прежнему ничего, а за пределами экрана прогрев не начинается.
 *
 * Соседи стартуют не разом, а по очереди: пять файлов, выехавших в сеть
 * одновременно, делят канал и приезжают все вместе и одинаково поздно.
 */

import { useCallback, useEffect, useState } from 'react';

export type LoopMode = 'none' | 'hover' | 'always';

/** Разбежка между соседями. Первый в ряду греется сразу — на него и наводят. */
const STAGGER_MS = 350;
/** Насколько заранее до появления в кадре начинать. */
const MARGIN = '400px';

/**
 * Как показывать петли: наведением, самостоятельно или никак.
 *
 * Условия одинаковы для всего списка, поэтому решение принимается один раз на
 * компонент, а не по подписке на каждую плитку.
 */
export function useLoopMode(): LoopMode {
  const [mode, setMode] = useState<LoopMode>('none');

  useEffect(() => {
    const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const hover = window.matchMedia('(hover: hover)');

    const update = () => {
      // Экономия трафика — осознанный выбор человека, и он важнее украшений.
      const connection = (navigator as { connection?: { saveData?: boolean } }).connection;
      if (motion.matches || connection?.saveData) {
        setMode('none');
        return;
      }
      setMode(hover.matches ? 'hover' : 'always');
    };

    update();
    motion.addEventListener('change', update);
    hover.addEventListener('change', update);
    return () => {
      motion.removeEventListener('change', update);
      hover.removeEventListener('change', update);
    };
  }, []);

  return mode;
}

type Options = {
  /** Элемент, по видимости которого решается, пора ли греть. */
  target: React.RefObject<HTMLElement | null>;
  loopSrc: string | undefined;
  mode: LoopMode;
  /** Место в ряду: задаёт задержку старта, чтобы соседи не делили канал. */
  order?: number;
};

export function useLoopPreload({ target, loopSrc, mode, order = 0 }: Options) {
  /** Адрес появляется только когда решено грузить: без него `<video>` молчит. */
  const [source, setSource] = useState<string | null>(null);
  /** Ролик добрал столько, что может играть без паузы на буферизацию. */
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const el = target.current;
    if (!el || !loopSrc || mode === 'none') return;

    let timer: number | null = null;
    let scheduled = false;
    let observer: IntersectionObserver | null = null;

    const watch = () => {
      observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            // Один раз за жизнь элемента: дальше загрузку ведёт сам браузер.
            if (scheduled) return;
            scheduled = true;
            timer = window.setTimeout(() => setSource(loopSrc), order * STAGGER_MS);
            return;
          }

          // Ушёл с экрана, не дождавшись своей очереди, — греть незачем.
          if (timer !== null) {
            window.clearTimeout(timer);
            timer = null;
            scheduled = false;
          }
        },
        { rootMargin: MARGIN },
      );

      observer.observe(el);
    };

    /*
     * Прогрев начинается после того, как страница догрузилась.
     *
     * Плитки стоят сразу под первым экраном и попадают в поле зрения
     * наблюдателя ещё до того, как человек тронул колесо, — а мегабайты петель,
     * выехавшие вместе с обложкой и кадрами, отбирают канал у того, что человек
     * видит прямо сейчас. Петля нужна к наведению, а не к первой секунде.
     */
    if (document.readyState === 'complete') {
      watch();
      return () => {
        observer?.disconnect();
        if (timer !== null) window.clearTimeout(timer);
      };
    }

    window.addEventListener('load', watch, { once: true });
    return () => {
      window.removeEventListener('load', watch);
      observer?.disconnect();
      if (timer !== null) window.clearTimeout(timer);
    };
  }, [target, loopSrc, mode, order]);

  // Сменили режим на «не показывать» — забываем и адрес: у `<video>` без
  // источника нет и загрузки.
  useEffect(() => {
    if (mode !== 'none') return;
    setSource(null);
    setReady(false);
  }, [mode]);

  /*
   * Навели раньше, чем очередь дошла до этой плитки, — грузим немедленно.
   *
   * Без этого запасного пути наведение в первые секунды не давало ничего
   * вовсе: прогрев ещё не начался, а подставить адрес было больше некому.
   */
  const warmNow = useCallback(() => {
    if (!loopSrc || mode === 'none') return;
    setSource((current) => current ?? loopSrc);
  }, [loopSrc, mode]);

  return { source, ready, warmNow, markReady: () => setReady(true) };
}
