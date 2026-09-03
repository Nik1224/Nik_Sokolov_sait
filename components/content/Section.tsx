/** Секция страницы: единый вертикальный ритм и заголовочная группа. */

import Link from 'next/link';
import type { ReactNode } from 'react';

type Props = {
  id?: string;
  eyebrow?: string;
  title?: string;
  lead?: string;
  /**
   * Переход из заголовка секции. По умолчанию это неприметная ссылка сбоку;
   * `solid` превращает её в кнопку — для перехода, который человек должен
   * увидеть, а не выискивать.
   */
  action?: { label: string; href: string; variant?: 'quiet' | 'solid' };
  children: ReactNode;
  className?: string;
  /** Заголовок секции по умолчанию h2: единственный h1 на странице — заголовок страницы (§12). */
  headingLevel?: 'h2' | 'h3';
};

export function Section({
  id,
  eyebrow,
  title,
  lead,
  action,
  children,
  className = '',
  headingLevel: Heading = 'h2',
}: Props) {
  return (
    <section id={id} className={`container-content py-[var(--spacing-section)] ${className}`}>
      {eyebrow || title || action ? (
        <div className="mb-10 flex flex-col gap-6 border-t border-line pt-6 md:flex-row md:items-end md:justify-between lg:mb-14">
          <div className="max-w-2xl">
            {eyebrow ? <p className="label mb-4 text-accent">{eyebrow}</p> : null}
            {title ? <Heading className="text-h2 m-0 text-balance">{title}</Heading> : null}
            {lead ? <p className="mt-4 text-lead text-bone-dim">{lead}</p> : null}
          </div>
          {action ? (
            /*
             * Заливка акцентная, а не `bone`. На странице стоимости тёмная
             * заливка занята: ею помечены выбранные переключатели калькулятора
             * — «Фото», «Свадебная». Кнопка того же цвета читается как ещё
             * один выбранный пункт, и ширина с формой тут не спасают: дело в
             * цвете. Акцентом не залито больше ничего, поэтому он однозначен.
             *
             * `self-start` и стрелка — к тому же: на узком экране заголовок
             * выстраивается колонкой, и растянутая во всю ширину кнопка ещё
             * сильнее похожа на строку-состояние.
             */
            <Link
              href={action.href}
              className={
                action.variant === 'solid'
                  ? 'label inline-block shrink-0 self-start bg-accent px-7 py-4 text-ink transition-colors hover:bg-accent-dim'
                  : 'label shrink-0 text-bone-dim transition-colors hover:text-bone'
              }
            >
              {action.label} →
            </Link>
          ) : null}
        </div>
      ) : null}
      {children}
    </section>
  );
}

export function EmptyState({ title, body }: { title: string; body: string }) {
  return (
    <div className="border border-dashed border-line px-6 py-16 text-center">
      <p className="text-h3 m-0 text-bone">{title}</p>
      <p className="mx-auto mt-3 max-w-md text-bone-faint">{body}</p>
    </div>
  );
}
