/** Секция страницы: единый вертикальный ритм и заголовочная группа. */

import Link from 'next/link';
import type { ReactNode } from 'react';

type Props = {
  id?: string;
  eyebrow?: string;
  title?: string;
  lead?: string;
  action?: { label: string; href: string };
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
            <Link
              href={action.href}
              className="label shrink-0 text-bone-dim transition-colors hover:text-bone"
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
