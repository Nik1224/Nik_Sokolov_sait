/**
 * Шапка внутри ветки (ТЗ §4, §7).
 *
 * Логотип ВСЕГДА ведёт на Home текущего направления — в том числе со страниц
 * кейса и статьи (§17). Возврат на START доступен через «Все направления»
 * внутри переключателя направления.
 */

import Link from 'next/link';
import type { ContactChannel } from '@/content/types';
import type { Dictionary } from '@/lib/i18n/dictionaries';
import { directionHomeHref } from '@/lib/routing';
import type { Direction, Locale, Section } from '@/lib/site';
import { ContextNav } from './ContextNav';
import { DirectionSwitcher } from './DirectionSwitcher';
import { LocaleSwitcher } from './LocaleSwitcher';
import { MobileMenu } from './MobileMenu';

type Props = {
  locale: Locale;
  direction: Direction;
  sections: Section[];
  directions: { key: Direction; label: string }[];
  contacts: ContactChannel[];
  dict: Dictionary;
};

export function GlobalHeader({ locale, direction, sections, directions, contacts, dict }: Props) {
  return (
    <header className="sticky top-0 z-40 border-b border-line bg-ink/85 backdrop-blur-md">
      <div className="container-content flex h-16 items-center justify-between gap-6 lg:h-20">
        <div className="flex items-center gap-6 lg:gap-8">
          <Link
            href={directionHomeHref(locale, direction)}
            className="label whitespace-nowrap text-bone"
          >
            {dict.brand.name}
          </Link>
          <span aria-hidden="true" className="hidden h-4 w-px bg-line lg:block" />
          <div className="hidden lg:block">
            <DirectionSwitcher locale={locale} current={direction} directions={directions} dict={dict} />
          </div>
        </div>

        <ContextNav locale={locale} direction={direction} sections={sections} dict={dict} />

        <div className="flex items-center gap-4">
          <div className="hidden lg:block">
            <LocaleSwitcher locale={locale} dict={dict} />
          </div>
          <MobileMenu
            locale={locale}
            direction={direction}
            sections={sections}
            directions={directions}
            contacts={contacts}
            dict={dict}
          />
        </div>
      </div>
    </header>
  );
}
