'use client';

/**
 * Появление блоков при прокрутке и признак прокрученной страницы (ветка BUSINESS).
 *
 * Один наблюдатель на всю страницу вместо обёртки вокруг каждого блока: за что
 * следить, разметка говорит сама — атрибутами `data-reveal` и
 * `data-reveal-media`. Компоненты остаются серверными и ничего не знают про
 * анимацию, а в бандл уезжает один небольшой файл.
 *
 * Порядок действий в эффекте важен. Сначала помечаем показанным всё, что уже в
 * первом экране, и только потом ставим на документ признак готовности, по
 * которому CSS прячет непоказанное. Наоборот — и содержимое первого экрана
 * мигнёт, спрятавшись на кадр после гидратации.
 *
 * Не выполнился скрипт вовсе — признак не появится, и страница останется
 * показанной целиком. Анимация здесь украшение, а не условие читаемости.
 */

import { useEffect } from 'react';

export function Reveal() {
  useEffect(() => {
    const root = document.documentElement;

    /*
     * Шапка становится плотной, как только страница сдвинулась. На первом
     * экране она прозрачная и лежит поверх кадра — там ей плотность не нужна,
     * а тонкая линия под ней разрезала бы разворот пополам.
     */
    const onScroll = () => {
      if (window.scrollY > 24) root.dataset.scrolled = '';
      else delete root.dataset.scrolled;
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });

    const targets = document.querySelectorAll<HTMLElement>('[data-reveal], [data-reveal-media]');

    // Человек попросил не двигать интерфейс — не двигаем. Признак готовности
    // не ставится, и ни один блок не прячется.
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return () => window.removeEventListener('scroll', onScroll);
    }

    const hidden: HTMLElement[] = [];
    for (const el of targets) {
      if (el.getBoundingClientRect().top < window.innerHeight * 0.92) el.dataset.revealed = '';
      else hidden.push(el);
    }

    root.dataset.revealReady = '';

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          (entry.target as HTMLElement).dataset.revealed = '';
          // Показанное остаётся показанным: обратного хода у этой анимации нет.
          observer.unobserve(entry.target);
        }
      },
      { rootMargin: '0px 0px -10% 0px', threshold: 0.06 },
    );

    for (const el of hidden) observer.observe(el);

    return () => {
      window.removeEventListener('scroll', onScroll);
      observer.disconnect();
      delete root.dataset.revealReady;
      delete root.dataset.scrolled;
    };
  }, []);

  return null;
}
