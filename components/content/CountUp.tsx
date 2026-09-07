'use client';

/**
 * Число, которое отсчитывается от нуля при появлении (M4).
 *
 * Только на странице стоимости и только на часовых ставках: цифра здесь и есть
 * главный герой экрана, за ней и приходят. Повторять приём где-то ещё нельзя —
 * тогда он перестанет что-либо значить.
 *
 * На сервере и без скрипта сразу стоит итоговое значение: отсчёт — украшение,
 * а цена должна быть видна всегда. При «уменьшить движение» отсчёта нет.
 */

import { useEffect, useMemo, useRef, useState } from 'react';
import { moneyFormat } from '@/lib/pricing/money';
import type { Locale } from '@/lib/site';

type Props = {
  value: number;
  /*
   * Язык и валюта, а не готовая функция форматирования: функцию нельзя
   * передать из серверного компонента в клиентский — она не сериализуется.
   */
  locale: Locale;
  currency?: string;
  /** Шаг округления на ходу: единицы в разряде тысяч только рябят. */
  step?: number;
  className?: string;
};

const DURATION_MS = 900;

export function CountUp({ value, locale, currency, step = 100, className }: Props) {
  const [shown, setShown] = useState(value);
  const ref = useRef<HTMLSpanElement>(null);
  const money = useMemo(() => moneyFormat(locale, currency), [locale, currency]);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    let frame = 0;
    let start: number | null = null;

    const run = (now: number) => {
      if (start === null) start = now;
      const progress = Math.min((now - start) / DURATION_MS, 1);
      // Быстрый разгон и мягкая остановка: у счётчика важен конец, а не начало.
      const eased = 1 - Math.pow(1 - progress, 3);
      setShown(progress < 1 ? Math.round((value * eased) / step) * step : value);
      if (progress < 1) frame = requestAnimationFrame(run);
    };

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        // Один раз за визит: цифра, отсчитывающаяся при каждой прокрутке мимо,
        // превращается из акцента в мельтешение.
        observer.disconnect();
        setShown(0);
        frame = requestAnimationFrame(run);
      },
      { threshold: 0.6 },
    );

    observer.observe(el);
    return () => {
      observer.disconnect();
      cancelAnimationFrame(frame);
    };
  }, [value, step]);

  return (
    <span ref={ref} className={className}>
      {money.format(shown)}
    </span>
  );
}
