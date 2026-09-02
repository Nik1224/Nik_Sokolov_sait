'use client';

/**
 * Плитки категорий портфолио на Home ветки PRIVATE (ТЗ §5.2, §7).
 *
 * При наведении плитка показывает короткую петлю со съёмки этой категории.
 * Видео — усиление, а не условие: название и переход работают всегда, и без
 * ролика плитка выглядит ровно так же, как выглядела.
 *
 * Наведение — единственный запуск. Там, где мыши нет, движения не будет
 * совсем: пять роликов, играющих одновременно на телефоне, — это трафик и
 * шум вместо помощи. Список категорий там и так читается.
 */

import Link from 'next/link';
import { useCallback, useEffect, useRef, useState } from 'react';
import type { Category } from '@/content/types';
import { localizedString } from '@/lib/i18n/localize';
import { href } from '@/lib/routing';
import type { Direction, Locale } from '@/lib/site';

type Props = {
  categories: Category[];
  locale: Locale;
  direction: Direction;
};

export function CategoryTiles({ categories, locale, direction }: Props) {
  /*
   * Показывать ли петли вообще. Решается один раз на весь список: условия
   * одинаковые для всех плиток, и пять одинаковых подписок на media query
   * ничего не добавляют.
   */
  const [plays, setPlays] = useState(false);

  useEffect(() => {
    const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const hover = window.matchMedia('(hover: hover)');

    const update = () => {
      // Экономия трафика — осознанный выбор человека, и он важнее украшений.
      const connection = (navigator as { connection?: { saveData?: boolean } }).connection;
      setPlays(hover.matches && !motion.matches && !connection?.saveData);
    };

    update();
    motion.addEventListener('change', update);
    hover.addEventListener('change', update);
    return () => {
      motion.removeEventListener('change', update);
      hover.removeEventListener('change', update);
    };
  }, []);

  return (
    <ul className="m-0 grid list-none gap-px bg-line p-0 sm:grid-cols-2 lg:grid-cols-3">
      {categories.map((category) => (
        <li key={category._id} className="bg-ink">
          <Tile category={category} locale={locale} direction={direction} plays={plays} />
        </li>
      ))}
    </ul>
  );
}

function Tile({
  category,
  locale,
  direction,
  plays,
}: {
  category: Category;
  locale: Locale;
  direction: Direction;
  plays: boolean;
}) {
  const linkRef = useRef<HTMLAnchorElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [active, setActive] = useState(false);
  /*
   * Две высоты плитки, обе в пикселях: без числа с обеих сторон переход не
   * анимируется, а «по содержимому» числом не является.
   *
   * Сложенная измеряется у самой плитки, а не задаётся константой: она зависит
   * от кегля и отступов, и стоит им поменяться — плитка дёрнется на первом же
   * наведении. Раскрытая считается от ширины колонки, чтобы кадр встал целиком,
   * а не полосой из середины. Потолок в 80vh нужен на низких экранах: строка
   * выше экрана — это уже не превью.
   */
  const [collapsed, setCollapsed] = useState<number | null>(null);
  const [expanded, setExpanded] = useState<number | null>(null);
  /*
   * Адрес подставляется только при первом наведении. Иначе пять роликов
   * поехали бы за человеком по сети ещё до того, как он на них посмотрел.
   */
  const [source, setSource] = useState<string | null>(null);

  const loop = category.preview?.type === 'video' ? category.preview : null;
  const shows = Boolean(loop?.loopSrc) && plays;

  const ratio = loop ? loop.poster.height / loop.poster.width : 0;

  useEffect(() => {
    const el = linkRef.current;
    if (!el || !shows || !ratio) return;

    const fit = () =>
      setExpanded(Math.round(Math.min(el.clientWidth * ratio, window.innerHeight * 0.8)));

    fit();
    // Ширина колонки и высота экрана меняются вместе с окном. Заодно
    // сбрасываем измеренную сложенную высоту: с новой шириной заголовок может
    // переноситься иначе, и старое число уже не про эту плитку.
    const onResize = () => {
      setCollapsed(null);
      fit();
    };
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, [shows, ratio]);

  /*
   * Сложенную высоту измеряем ровно в тот момент, когда она ещё своя: до того,
   * как мы сами её проставили, и не во время раскрытия — иначе в неё попадёт
   * промежуточный кадр анимации и плитка «усохнет» до него.
   */
  useEffect(() => {
    const el = linkRef.current;
    if (!el || !shows || active || collapsed !== null) return;
    setCollapsed(el.getBoundingClientRect().height);
  }, [shows, active, collapsed]);

  const activate = useCallback(() => {
    if (!shows || !loop?.loopSrc) return;
    setSource((current) => current ?? loop.loopSrc ?? null);
    setActive(true);
  }, [shows, loop]);

  const deactivate = useCallback(() => setActive(false), []);

  /*
   * Запуск живёт в эффекте, а не в обработчике наведения. При первом
   * наведении адрес только попадает в состояние, и в этот момент у элемента
   * ещё нет источника: вызванный тут же play() не находит, что играть, и
   * ролик молча остаётся на нулевой секунде.
   */
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    if (active && source) {
      void video.play().catch(() => {
        /* автозапуск может быть запрещён — плитка работает и без видео */
      });
      return;
    }

    video.pause();
    // С начала: иначе при следующем наведении кадр продолжится с середины.
    video.currentTime = 0;
  }, [active, source]);

  return (
    <Link
      href={`${href({ locale, direction, section: 'portfolio' })}?category=${category.slug}`}
      onMouseEnter={activate}
      onMouseLeave={deactivate}
      onFocus={activate}
      onBlur={deactivate}
      ref={linkRef}
      /*
       * Сама плитка в потоке не меняется никогда — раскрывается только слой с
       * кадром, поверх страницы. Пробовали растить плитку: тогда растёт строка
       * сетки, а с ней уезжает вниз всё, что ниже, — нижний ряд плиток на
       * шестьсот с лишним пикселей. Ради превью двигать полстраницы нельзя.
       */
      style={{ minHeight: collapsed ?? undefined }}
      /*
       * Название прижато к верхнему краю и стоит выше слоя с кадром: раскрытие
       * его не трогает. В сложенном виде `items-start` ничего не меняет —
       * содержимое и так занимало всю высоту между отступами.
       *
       * Плитка тянется на всю высоту своей ячейки (`h-full`), чтобы нажимать
       * на неё можно было по всей площади.
       */
      className={`group relative flex h-full items-start justify-between p-6 lg:p-8 ${
        active ? 'z-10' : ''
      }`}
    >
      {shows && loop ? (
        /*
         * Слой с кадром. Растёт вниз за пределы плитки и накрывает то, что под
         * ней, — поэтому у раскрытой плитки поднят z-index. Пропорции слоя
         * повторяют пропорции ролика, поэтому object-cover ничего не срезает.
         */
        <span
          style={{ height: (active ? expanded : collapsed) ?? undefined }}
          className="absolute inset-x-0 top-0 block overflow-hidden bg-ink transition-[height] duration-[var(--duration-slow)] ease-[var(--ease-out-soft)]"
        >
          {/* Постер стоит здесь же: пока грузится первый кадр, плитка не
              мигает пустотой. */}
          <video
            ref={videoRef}
            src={source ?? undefined}
            poster={loop.poster.src}
            muted
            loop
            playsInline
            preload="none"
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 h-full w-full object-cover opacity-0 transition-opacity duration-[var(--duration-slow)] ease-[var(--ease-out-soft)] group-hover:opacity-100 group-focus-visible:opacity-100"
          />
          {/*
           * Вуаль цветом фона сверху вниз: название стоит на верхнем крае и
           * должно читаться при любом кадре. Ниже она сходит почти на нет —
           * закрывать ради одной строки весь кадр незачем. Цвет берётся из
           * токена, поэтому в светлой теме PRIVATE вуаль светлая, а в тёмных
           * ветках была бы тёмной.
           */}
          <span
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 bg-gradient-to-b from-ink from-16% via-ink/35 via-38% to-ink/5 opacity-0 transition-opacity duration-[var(--duration-slow)] group-hover:opacity-100 group-focus-visible:opacity-100"
          />
        </span>
      ) : null}

      <span className="text-h3 relative text-bone transition-colors group-hover:text-accent">
        {localizedString(category.title, locale)}
      </span>
      <span
        aria-hidden="true"
        className="label relative text-bone-faint transition-transform group-hover:translate-x-1"
      >
        →
      </span>
    </Link>
  );
}
