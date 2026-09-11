/**
 * Категории портфолио карточками с кадром (ветки без петель — BUSINESS).
 *
 * Почему не плитки. У PRIVATE к каждой категории снята короткая петля, и
 * плитка раскрывается ею под курсором — там кадр появляется целиком и в
 * движении. У BUSINESS петель нет: есть неподвижный кадр из работы. Положить
 * его фоном под текст, как это делает плитка, — худшее из решений: от снимка
 * остаётся полоса у нижнего края, притушенная вуалью до неразличимости, и
 * текст поверх неё читается хуже, чем на чистом фоне. Ни кадра, ни текста.
 *
 * Поэтому кадр и подпись не спорят за одно место: снимок стоит в рамке своей
 * пропорции и в полную силу, подпись — под ним. Ровно так же устроены карточки
 * работ и статей, поэтому страница не распадается на разные языки вёрстки.
 *
 * Компонент неинтерактивный и серверный: приближение кадра под курсором делает
 * CSS, а JS здесь не нужен ни для чего.
 */

import Link from 'next/link';
import type { Category, ImageRef } from '@/content/types';
import { localizedString } from '@/lib/i18n/localize';
import { href } from '@/lib/routing';
import type { Direction, Locale } from '@/lib/site';
import { PictureFrame } from '../media/Picture';

type Props = {
  categories: Category[];
  locale: Locale;
  direction: Direction;
  /** Обложки по ключу категории: кадр берётся у работ ветки. */
  covers?: Record<string, ImageRef | undefined>;
};

export function CategoryCards({ categories, locale, direction, covers }: Props) {
  return (
    /*
     * Сетка с зазором, а не с хайрлайнами. У карточки с кадром рамка своя, и
     * вторая, общая для сетки, делает из ряда снимков таблицу. Заодно исчезает
     * вечная беда решётки — светлая пустая ячейка в недобранном ряду: семь
     * категорий в трёх колонках оставляют две, и показывать там нечего.
     */
    <ul className="m-0 grid list-none gap-10 p-0 sm:grid-cols-2 lg:grid-cols-3 lg:gap-x-8 lg:gap-y-14">
      {categories.map((category, index) => {
        const cover = covers?.[category.slug];
        const description = localizedString(category.description, locale);

        return (
          <li key={category._id} className="group">
            <Link
              href={`${href({ locale, direction, section: 'portfolio' })}?category=${category.slug}`}
              className="block"
            >
              {cover ? (
                <PictureFrame
                  image={cover}
                  alt=""
                  ratio={4 / 3}
                  sizes="(min-width: 1024px) 26rem, (min-width: 640px) 50vw, 100vw"
                  // Первый ряд виден сразу — его не ждём лениво.
                  priority={index < 3}
                  className="transition-transform duration-[var(--duration-slow)] ease-[var(--ease-out-soft)] group-hover:scale-[1.03]"
                />
              ) : (
                /*
                 * Кадра ещё нет. На широком экране пустая рамка всё равно
                 * нужна: без неё карточка подскакивает вверх и ломает линию
                 * подписей у соседей по ряду. На телефоне рядов нет — карточки
                 * идут одна под другой, — и выравнивать нечего, а пустой
                 * прямоугольник в треть экрана там дороже любой ровности.
                 *
                 * Тёплая черта в углу — единственное, что есть в рамке: это
                 * место под снимок, а не самостоятельный элемент.
                 */
                <div
                  aria-hidden="true"
                  className="relative hidden bg-ink-raised sm:block"
                  style={{ aspectRatio: '4 / 3' }}
                >
                  <span className="absolute bottom-6 left-6 block h-px w-10 bg-accent-dim" />
                </div>
              )}

              <div className={`flex items-start justify-between gap-4 ${cover ? 'mt-5' : 'sm:mt-5'}`}>
                <h3 className="text-h3 m-0 text-balance text-bone transition-colors group-hover:text-accent">
                  {localizedString(category.title, locale)}
                </h3>
                <span
                  aria-hidden="true"
                  className="label mt-1.5 shrink-0 text-bone-faint transition-transform group-hover:translate-x-1"
                >
                  →
                </span>
              </div>
              {description ? (
                <p className="mt-3 text-sm leading-relaxed text-bone-dim">{description}</p>
              ) : null}
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
