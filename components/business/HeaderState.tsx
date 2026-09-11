'use client';

/**
 * Признак прокрученной страницы для шапки ветки BUSINESS.
 *
 * На первом экране шапка прозрачная и лежит поверх кадра: тонкая линия под ней
 * разрезала бы разворот пополам. Подложка и линия появляются, как только
 * страница поехала и шапка начала накрывать содержимое.
 *
 * Появлением блоков занимается общий скрипт из `lib/reveal.ts` — здесь только
 * одно состояние, которого у него нет.
 */

import { useEffect } from 'react';

export function HeaderState() {
  useEffect(() => {
    const root = document.documentElement;
    const update = () => {
      if (window.scrollY > 24) root.dataset.scrolled = '';
      else delete root.dataset.scrolled;
    };

    update();
    window.addEventListener('scroll', update, { passive: true });
    return () => {
      window.removeEventListener('scroll', update);
      delete root.dataset.scrolled;
    };
  }, []);

  return null;
}
