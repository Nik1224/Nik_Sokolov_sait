/**
 * Отзывы клиентов (ТЗ §5.2: «отзывы только подтверждённые»).
 *
 * Показываются те, что клиенты оставили публично. Имя обязательно: отзыв без
 * автора ничего не подтверждает.
 */

import type { Testimonial } from '@/content/types';
import { hasTranslation, localizedString } from '@/lib/i18n/localize';
import type { Dictionary } from '@/lib/i18n/dictionaries';
import type { Locale } from '@/lib/site';

type Props = { items: Testimonial[]; locale: Locale; dict: Dictionary };

export function Testimonials({ items, locale, dict }: Props) {
  if (items.length === 0) return null;

  return (
    /*
     * Отзывы стоят карточками на приподнятой подложке, а не текстом под
     * хайрлайном. Длина отзыва не в нашей власти: однострочное «отличные фото»
     * рядом с десятистрочным разбором выглядело обрывком вёрстки, потому что
     * между ними не было ничего, кроме воздуха. Подложка одинаковой высоты
     * делает короткий отзыв коротким отзывом, а не ошибкой.
     */
    <div className="overflow-hidden">
      <ul className="-mt-px -ml-px m-0 grid list-none p-0 md:grid-cols-2 lg:grid-cols-3">
        {items.map((item) => {
        const text = localizedString(item.text, locale);
        const isFallback = !hasTranslation(item.text, locale);

        return (
          <li
            key={item._id}
            className="border-t border-l border-line bg-ink-raised p-6 lg:p-8"
          >
            <figure className="m-0 flex h-full flex-col">
              {/*
               * Кавычка вместо иконки: она из того же набора, что и текст, и не
               * тянет за собой чужую графику в монохромную вёрстку.
               */}
              <span aria-hidden="true" className="text-h2 block leading-none text-line-strong">
                «
              </span>
              <blockquote className="m-0 mt-4 flex-1 text-lead leading-relaxed text-bone-dim">
                {text}
              </blockquote>
              <figcaption className="label mt-6 flex flex-wrap items-center gap-3 text-bone">
                {item.author}
                {isFallback ? (
                  <span lang="en" className="border border-line px-2 py-0.5 text-bone-faint">
                    {dict.fallback.short}
                  </span>
                ) : null}
              </figcaption>
            </figure>
          </li>
        );
        })}
      </ul>
    </div>
  );
}
