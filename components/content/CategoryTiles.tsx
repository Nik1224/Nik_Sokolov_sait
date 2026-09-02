'use client';

/**
 * Плитки категорий портфолио на Home ветки PRIVATE (ТЗ §5.2, §7).
 *
 * При наведении плитка показывает короткую петлю со съёмки этой категории.
 * Видео — усиление, а не условие: название и переход работают всегда, и без
 * ролика плитка выглядит ровно так же, как выглядела.
 *
 * Две подачи одного и того же, как у карточек направлений на START:
 *  • где есть мышь — плитка при наведении раскрывается кадром поверх страницы;
 *  • на сенсорных экранах наведения не существует, поэтому вертикальный кадр
 *    просто стоит справа в плитке и играет, пока она на экране.
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

type Mode = 'none' | 'hover' | 'always';

export function CategoryTiles({ categories, locale, direction }: Props) {
  /*
   * Как показывать петли. Решается один раз на весь список: условия одинаковые
   * для всех плиток, и пять одинаковых подписок на media query ничего не
   * добавляют.
   */
  const [mode, setMode] = useState<Mode>('none');

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

  /*
   * Сколько колонок сейчас в сетке. Нужно, чтобы понять, в каком ряду плитка:
   * верхние раскрываются вверх, нижние вниз. Число колонок задано брейкпойнтами
   * (1 / 2 / 3), поэтому читаем его у самой сетки, а не повторяем в коде — иначе
   * при правке класса они разойдутся молча.
   */
  const gridRef = useRef<HTMLUListElement>(null);
  const [columns, setColumns] = useState(1);

  useEffect(() => {
    const el = gridRef.current;
    if (!el) return;

    const count = () =>
      setColumns(getComputedStyle(el).gridTemplateColumns.split(' ').filter(Boolean).length || 1);

    count();
    const observer = new ResizeObserver(count);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const lastRow = Math.floor((categories.length - 1) / columns);

  return (
    <ul ref={gridRef} className="m-0 grid list-none gap-px bg-line p-0 sm:grid-cols-2 lg:grid-cols-3">
      {categories.map((category, index) => (
        <li key={category._id} className="bg-ink">
          <Tile
            category={category}
            locale={locale}
            direction={direction}
            mode={mode}
            // Нижний ряд раскрывается вниз и отодвигает то, что под сеткой.
            // Остальные — вверх, в воздух над плитками.
            growsDown={Math.floor(index / columns) === lastRow}
          />
        </li>
      ))}
    </ul>
  );
}

function Tile({
  category,
  locale,
  direction,
  mode,
  growsDown,
}: {
  category: Category;
  locale: Locale;
  direction: Direction;
  mode: Mode;
  growsDown: boolean;
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
  const shows = Boolean(loop?.loopSrc) && mode !== 'none';
  const standing = shows && mode === 'always';

  const ratio = loop ? loop.poster.height / loop.poster.width : 0;

  useEffect(() => {
    const el = linkRef.current;
    if (!el || mode !== 'hover' || !shows || !ratio) return;

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
  }, [mode, shows, ratio]);

  /*
   * Сложенную высоту измеряем ровно в тот момент, когда она ещё своя: до того,
   * как мы сами её проставили, и не во время раскрытия — иначе в неё попадёт
   * промежуточный кадр анимации и плитка «усохнет» до него.
   */
  useEffect(() => {
    const el = linkRef.current;
    if (!el || mode !== 'hover' || !shows || active || collapsed !== null) return;
    setCollapsed(el.getBoundingClientRect().height);
  }, [mode, shows, active, collapsed]);

  const activate = useCallback(() => {
    if (mode !== 'hover' || !loop?.loopSrc) return;
    setSource((current) => current ?? loop.loopSrc ?? null);
    setActive(true);
  }, [mode, loop]);

  const deactivate = useCallback(() => setActive(false), []);

  /*
   * Запуск живёт в эффекте, а не в обработчике наведения. При первом
   * наведении адрес только попадает в состояние, и в этот момент у элемента
   * ещё нет источника: вызванный тут же play() не находит, что играть, и
   * ролик молча остаётся на нулевой секунде.
   */
  useEffect(() => {
    const video = videoRef.current;
    if (!video || standing) return;

    if (active && source) {
      void video.play().catch(() => {
        /* автозапуск может быть запрещён — плитка работает и без видео */
      });
      return;
    }

    video.pause();
    // С начала: иначе при следующем наведении кадр продолжится с середины.
    video.currentTime = 0;
  }, [standing, active, source]);

  /*
   * Без наведения кадр живёт по видимости плитки: играет, пока она на экране,
   * и стоит, когда ушла. Простого autoplay мало — браузер не запускает ролик,
   * который в момент загрузки был за пределами экрана, и после прокрутки он
   * так и остаётся на паузе.
   */
  useEffect(() => {
    const el = linkRef.current;
    if (!el || !standing || !loop?.loopSrc) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        const video = videoRef.current;
        if (entry.isIntersecting) {
          setSource((current) => current ?? loop.loopSrc ?? null);
          void video?.play().catch(() => {
            /* автозапуск может быть запрещён — плитка работает и без видео */
          });
        } else {
          video?.pause();
        }
      },
      { threshold: 0.25 },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [standing, loop]);

  return (
    <Link
      href={`${href({ locale, direction, section: 'portfolio' })}?category=${category.slug}`}
      onMouseEnter={activate}
      onMouseLeave={deactivate}
      onFocus={activate}
      onBlur={deactivate}
      ref={linkRef}
      /*
       * Куда раскрываться, решает ряд.
       *
       * Нижний ряд растёт вниз и растёт по-настоящему: строка сетки становится
       * выше и отодвигает вниз следующий блок. Верхние ряды так делать нельзя —
       * они отодвинули бы вниз соседний ряд плиток, и кадр закрыл бы его. Они
       * раскрываются вверх, в воздух над сеткой, не трогая поток: подвинуть
       * заголовок выше нечем — над ним стоит предыдущая секция.
       */
      style={
        standing
          ? undefined
          : growsDown && active
            ? { height: expanded ?? undefined }
            : { minHeight: collapsed ?? undefined }
      }
      /*
       * Название прижато к верхнему краю и стоит выше слоя с кадром: раскрытие
       * его не трогает. В сложенном виде `items-start` ничего не меняет —
       * содержимое и так занимало всю высоту между отступами.
       *
       * Плитка тянется на всю высоту своей ячейки (`h-full`), чтобы нажимать
       * на неё можно было по всей площади.
       *
       * Со стоящим кадром плитка выше: колонка под ролик получается около
       * 150 px, и в строку высотой со строку текста вертикальный кадр лёг бы
       * горизонтальной полосой из середины. Целиком он потребовал бы почти
       * 280 px на плитку — список из пяти категорий на телефоне превратился
       * бы в ленту на полтора экрана.
       */
      className={`group relative flex h-full justify-between p-6 lg:p-8 ${
        standing ? 'min-h-[12.5rem] items-center' : 'items-start'
      } ${active ? 'z-10' : ''}`}
      data-grows={growsDown ? 'down' : 'up'}
    >
      {standing && loop ? (
        /*
         * Сенсорный экран: кадр стоит в правой части плитки и играет сам.
         * Раскрывать нечему — наведения здесь не существует.
         */
        <>
          <video
            ref={videoRef}
            src={source ?? undefined}
            poster={loop.poster.src}
            autoPlay
            muted
            loop
            playsInline
            preload="metadata"
            aria-hidden="true"
            className="pointer-events-none absolute inset-y-0 right-0 h-full w-[42%] object-cover"
          />
          {/* Кромка слева от кадра: без неё он упирается в текст встык. */}
          <span
            aria-hidden="true"
            className="pointer-events-none absolute inset-y-0 right-[42%] w-16 bg-gradient-to-l from-ink/60 to-transparent"
          />
        </>
      ) : null}

      {!standing && shows && loop ? (
        /*
         * Слой с кадром. Растёт вниз за пределы плитки и накрывает то, что под
         * ней, — поэтому у раскрытой плитки поднят z-index. Пропорции слоя
         * повторяют пропорции ролика, поэтому object-cover ничего не срезает.
         */
        <span
          style={{ height: (active ? expanded : collapsed) ?? undefined }}
          className={`absolute inset-x-0 block overflow-hidden bg-ink transition-[height] duration-[var(--duration-slow)] ease-[var(--ease-out-soft)] ${
            growsDown ? 'top-0' : 'bottom-0'
          }`}
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
           * Вуаль цветом фона — со стороны названия: оно должно читаться при
           * любом кадре. Дальше она сходит почти на нет: закрывать ради одной
           * строки весь кадр незачем. У растущего вверх слоя название внизу,
           * поэтому и вуаль снизу. Цвет берётся из токена, поэтому в светлой
           * теме PRIVATE вуаль светлая, а в тёмных ветках была бы тёмной.
           */}
          <span
            aria-hidden="true"
            className={`pointer-events-none absolute inset-0 from-ink from-16% via-ink/35 via-38% to-ink/5 opacity-0 transition-opacity duration-[var(--duration-slow)] group-hover:opacity-100 group-focus-visible:opacity-100 ${
              growsDown ? 'bg-gradient-to-b' : 'bg-gradient-to-t'
            }`}
          />
        </span>
      ) : null}

      {/*
       * Со стоящим кадром текст занимает левую половину: иначе длинное
       * название уходит под ролик, а стрелка оказывается прямо на нём.
       */}
      <span
        className={`relative flex items-center justify-between ${standing ? 'w-[54%]' : 'w-full'}`}
      >
        <span className="text-h3 text-bone transition-colors group-hover:text-accent">
          {localizedString(category.title, locale)}
        </span>
        <span
          aria-hidden="true"
          className="label text-bone-faint transition-transform group-hover:translate-x-1"
        >
          →
        </span>
      </span>
    </Link>
  );
}
