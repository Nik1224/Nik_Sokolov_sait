/** Футер: контакты, соцсети, юридические ссылки, возврат на START (ТЗ §5.1). */

import Link from 'next/link';
import type { GlobalSettings } from '@/content/types';
import type { Dictionary } from '@/lib/i18n/dictionaries';
import { localizedString } from '@/lib/i18n/localize';
import { startHref } from '@/lib/routing';
import type { Locale } from '@/lib/site';

type Props = {
  locale: Locale;
  settings: GlobalSettings;
  dict: Dictionary;
  /** На START ссылка «Все направления» не нужна — пользователь уже здесь. */
  showStartLink?: boolean;
  /**
   * Ссылка на страницу для организаторов. В меню её нет: она не для пары.
   * В подвале — чтобы организатор, попавший на сайт сам, всё-таки её нашёл.
   */
  partnersHref?: string;
};

export function Footer({ locale, settings, dict, showStartLink = true, partnersHref }: Props) {
  const year = new Date().getFullYear();

  return (
    <footer className="mt-[var(--spacing-section)] border-t border-line bg-ink-sunken">
      <div className="container-content flex flex-col gap-8 py-12 md:flex-row md:justify-between">
        <div>
          <p className="label text-bone">{settings.siteName}</p>
          <p className="label mt-2 text-bone-faint">{localizedString(settings.descriptor, locale)}</p>
          {settings.location ? (
            <p className="label mt-2 text-bone-faint">{localizedString(settings.location, locale)}</p>
          ) : null}
        </div>

        {settings.contacts.length > 0 ? (
          <ul className="m-0 list-none space-y-2 p-0">
            {settings.contacts.map((contact) => (
              <li key={contact.href}>
                <a
                  href={contact.href}
                  rel={contact.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                  target={contact.href.startsWith('http') ? '_blank' : undefined}
                  className="text-sm text-bone-dim underline underline-offset-4 transition-colors hover:text-bone"
                >
                  {/* Телефон и почту показываем значением, мессенджеры — названием:
                      иначе один и тот же номер дублируется в списке. */}
                  {contact.kind === 'phone' || contact.kind === 'email' ? (
                    <>
                      <span className="sr-only">{contact.label}: </span>
                      {contact.value}
                    </>
                  ) : (
                    <>
                      {contact.label}
                      <span className="sr-only">: {contact.value}</span>
                    </>
                  )}
                </a>
              </li>
            ))}
          </ul>
        ) : (
          // Контакты не выдумываем: до подтверждения владельцем блок пуст (§18).
          <p className="max-w-xs text-sm text-bone-faint">[{dict.content.unconfirmed}]</p>
        )}

        {settings.socials.length > 0 ? (
          <ul className="m-0 list-none space-y-2 p-0">
            {settings.socials.map((social) => (
              <li key={social.href}>
                <a
                  href={social.href}
                  rel="noopener noreferrer"
                  target="_blank"
                  className="label text-bone-dim transition-colors hover:text-bone"
                >
                  {social.label}
                </a>
              </li>
            ))}
          </ul>
        ) : null}

        <div className="flex flex-col gap-2">
          {showStartLink ? (
            <Link href={startHref(locale)} className="label text-bone-dim transition-colors hover:text-bone">
              {dict.common.allDirections}
            </Link>
          ) : null}
          {partnersHref ? (
            <Link href={partnersHref} className="label text-bone-dim transition-colors hover:text-bone">
              {dict.nav.partners}
            </Link>
          ) : null}
          {settings.legalLinks.map((link) => (
            <a key={link.href} href={link.href} className="label text-bone-faint transition-colors hover:text-bone-dim">
              {localizedString(link.label, locale)}
            </a>
          ))}
          <p className="label mt-4 text-bone-faint">© {year}</p>
        </div>
      </div>
    </footer>
  );
}
