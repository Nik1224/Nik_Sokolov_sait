'use client';

/**
 * Мобильное меню (ТЗ §4): логотип, направление, язык, все разделы ветки,
 * контакты и «Все направления».
 *
 * Нативный <dialog> сам удерживает фокус, закрывается по Escape и скрывает
 * фон от ассистивных технологий.
 */

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import type { ContactChannel } from '@/content/types';
import { track } from '@/lib/analytics';
import type { Dictionary } from '@/lib/i18n/dictionaries';
import { directionHomeHref, href, startHref } from '@/lib/routing';
import type { Direction, Locale, Section } from '@/lib/site';
import { LocaleSwitcher } from './LocaleSwitcher';

type Props = {
  locale: Locale;
  direction: Direction;
  sections: Section[];
  directions: { key: Direction; label: string }[];
  contacts: ContactChannel[];
  dict: Dictionary;
};

export function MobileMenu({ locale, direction, sections, directions, contacts, dict }: Props) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  // Переход по ссылке должен закрывать меню, иначе оно останется поверх страницы.
  useEffect(() => {
    dialogRef.current?.close();
    setOpen(false);
  }, [pathname]);

  return (
    <>
      <button
        type="button"
        aria-expanded={open}
        onClick={() => {
          dialogRef.current?.showModal();
          setOpen(true);
        }}
        className="label -mr-3 inline-flex min-h-11 min-w-11 items-center justify-center px-3 text-bone lg:hidden"
      >
        {dict.common.openMenu}
      </button>

      <dialog
        ref={dialogRef}
        onClose={() => setOpen(false)}
        className="m-0 h-full max-h-none w-full max-w-none bg-ink p-0 text-bone backdrop:bg-ink/80"
      >
        <div className="flex h-full flex-col">
          <div className="flex items-center justify-between border-b border-line px-[var(--spacing-gutter)] py-4">
            <Link href={directionHomeHref(locale, direction)} className="label text-bone">
              {dict.brand.name}
            </Link>
            <button
              type="button"
              onClick={() => dialogRef.current?.close()}
              className="label -mr-3 inline-flex min-h-11 min-w-11 items-center justify-end px-3 text-bone-dim"
            >
              {dict.common.closeMenu}
            </button>
          </div>

          <nav aria-label={dict.common.mainNavigation} className="flex-1 overflow-y-auto px-[var(--spacing-gutter)] py-8">
            <p className="label mb-4 text-bone-faint">{dict.directions[direction]}</p>
            <ul className="m-0 list-none space-y-1 p-0">
              <li>
                <Link
                  href={directionHomeHref(locale, direction)}
                  className="block py-3 text-h3 text-bone"
                >
                  {dict.common.home}
                </Link>
              </li>
              {sections.map((section) => (
                <li key={section}>
                  <Link
                    href={href({ locale, direction, section })}
                    className="block py-3 text-h3 text-bone"
                  >
                    {dict.nav[section]}
                  </Link>
                </li>
              ))}
            </ul>

            <p className="label mb-4 mt-10 text-bone-faint">{dict.common.chooseDirection}</p>
            <ul className="m-0 list-none space-y-1 p-0">
              {directions
                .filter((item) => item.key !== direction)
                .map((item) => (
                  <li key={item.key}>
                    <Link
                      href={directionHomeHref(locale, item.key)}
                      onClick={() => track('direction_switch', { from: direction, to: item.key })}
                      className="block py-2 text-bone-dim"
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              <li>
                <Link href={startHref(locale)} className="block py-2 text-bone-faint">
                  {dict.common.allDirections}
                </Link>
              </li>
            </ul>

            {contacts.length > 0 ? (
              <ul className="m-0 mt-10 list-none space-y-2 p-0">
                {contacts.map((contact) => (
                  <li key={contact.href}>
                    <a
                      href={contact.href}
                      onClick={() => track('outbound_contact', { kind: contact.kind })}
                      className="text-bone-dim underline underline-offset-4"
                    >
                      {contact.value}
                    </a>
                  </li>
                ))}
              </ul>
            ) : null}
          </nav>

          <div className="border-t border-line px-[var(--spacing-gutter)] py-4">
            <LocaleSwitcher locale={locale} dict={dict} />
          </div>
        </div>
      </dialog>
    </>
  );
}
