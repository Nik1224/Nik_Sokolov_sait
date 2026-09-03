/**
 * Контакты (ТЗ §5.8).
 *
 * Формы заявки нет: человек пишет напрямую в свой мессенджер и получает ответ
 * там же. Анкета откладывала разговор на «когда-нибудь ответят на почту».
 */

import type { Metadata } from 'next';
import { ContactButton } from '@/components/contact/ContactButton';
import { Breadcrumbs } from '@/components/global/misc';
import { getGlobalSettings } from '@/content/queries';
import { getDictionary } from '@/lib/i18n/dictionaries';
import { localizedString } from '@/lib/i18n/localize';
import { resolveDirectionRoute, tryResolveDirectionRoute, sectionStaticParams } from '@/lib/guard';
import { href } from '@/lib/routing';
import { buildMetadata } from '@/lib/seo';

type Props = { params: Promise<{ locale: string; direction: string }> };

export function generateStaticParams() {
  return sectionStaticParams('contact');
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const route = await tryResolveDirectionRoute(params, 'contact');
  if (!route) return {};
  const { locale, direction } = route;
  const dict = getDictionary(locale);

  return buildMetadata({
    locale,
    path: href({ locale, direction, section: 'contact' }),
    title: `${dict.nav.contact} — ${dict.directions[direction]}`,
  });
}

export default async function Page({ params }: Props) {
  const { locale, direction } = await resolveDirectionRoute(params, 'contact');
  const dict = getDictionary(locale);
  const settings = await getGlobalSettings();

  return (
    <div className="container-content py-16 lg:py-24">
      <Breadcrumbs
        dict={dict}
        items={[{ label: dict.common.home, href: href({ locale, direction }) }, { label: dict.nav.contact }]}
      />

      <h1 className="text-h1 m-0 max-w-3xl text-balance">{dict.contact.heading}</h1>
      <p className="mt-6 max-w-2xl text-lead text-bone-dim">{dict.contact.homeLead}</p>
      {settings.location ? (
        <p className="label mt-6 text-bone-faint">{localizedString(settings.location, locale)}</p>
      ) : null}

      {/* Ветка известна и здесь: адрес страницы контактов у каждой свой. */}
      <ContactButton
        dict={dict}
        contacts={settings.contacts}
        className="mt-10"
        draft={{ subject: dict.contact.directionSubject[direction] }}
      />

      {/* Тот же список без окна: кому-то удобнее скопировать номер или ник. */}
      {settings.contacts.length > 0 ? (
        <section className="mt-16 border-t border-line pt-10">
          <h2 className="label m-0 text-accent">{dict.contact.directContacts}</h2>
          <ul className="m-0 mt-6 grid list-none gap-6 p-0 sm:grid-cols-2 lg:grid-cols-4">
            {settings.contacts.map((contact) => (
              <li key={contact.href} className="m-0">
                <p className="label m-0 text-bone-faint">{contact.label}</p>
                <a
                  href={contact.href}
                  target={contact.href.startsWith('http') ? '_blank' : undefined}
                  rel="noopener noreferrer"
                  className="mt-2 inline-block text-bone transition-colors hover:text-accent"
                >
                  {contact.value}
                </a>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </div>
  );
}
