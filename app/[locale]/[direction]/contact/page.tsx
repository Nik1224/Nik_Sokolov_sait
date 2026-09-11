/**
 * Контакты (ТЗ §5.8).
 *
 * Формы заявки нет: человек пишет напрямую в свой мессенджер и получает ответ
 * там же. Анкета откладывала разговор на «когда-нибудь ответят на почту».
 *
 * Страница собрана разворотом: слева обращение и способы связи, справа —
 * портрет во всю высоту. Раньше здесь были заголовок, кнопка, четыре контакта
 * и полтора экрана пустоты до подвала. Пустота работает на «дорого», только
 * когда она задумана; та читалась как недоделанная страница — а это последний
 * экран перед тем, как человек напишет или не напишет.
 */

import type { Metadata } from 'next';
import { ContactButton } from '@/components/contact/ContactButton';
import { Breadcrumbs } from '@/components/global/misc';
import { Picture } from '@/components/media/Picture';
import { PORTRAIT } from '@/content/portrait';
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

  const location = localizedString(settings.location, locale);

  return (
    <div className="container-content py-16 lg:py-24">
      <Breadcrumbs
        dict={dict}
        items={[{ label: dict.common.home, href: href({ locale, direction }) }, { label: dict.nav.contact }]}
      />

      {/*
        Портрет тянется на высоту колонки с текстом, а не живёт отдельной
        карточкой: разворот держится тем, что обе половины кончаются на одной
        линии. На узком экране колонки нет — кадр уходит вниз и показывается
        полосой, чтобы не занимать целый экран прокрутки.
      */}
      <div className="mt-4 grid gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,20rem)] lg:items-stretch lg:gap-16">
        <div>
          <h1 className="text-h1 m-0 max-w-2xl text-balance">{dict.contact.heading}</h1>
          <p className="mt-6 max-w-xl text-lead text-bone-dim">{dict.contact.homeLead}</p>

          {/* Ветка известна и здесь: адрес страницы контактов у каждой свой. */}
          <ContactButton
            dict={dict}
            contacts={settings.contacts}
            variant="solid"
            className="mt-10"
            draft={{ subject: dict.contact.directionSubject[direction] }}
          />

          {/*
            Тот же список без окна: кому-то удобнее скопировать номер или ник.
            Строками, а не сеткой из четырёх колонок, — так видно, что это
            один список, а не четыре одинаковых карточки.
          */}
          {settings.contacts.length > 0 ? (
            <section className="mt-14 max-w-2xl">
              <h2 className="label m-0 text-eyebrow">{dict.contact.directContacts}</h2>
              <ul data-reveal-stagger className="m-0 mt-6 list-none border-t border-line p-0">
                {settings.contacts.map((contact) => (
                  <li key={contact.href} className="m-0 border-b border-line">
                    <a
                      href={contact.href}
                      target={contact.href.startsWith('http') ? '_blank' : undefined}
                      rel="noopener noreferrer"
                      className="group flex flex-wrap items-baseline justify-between gap-x-8 gap-y-1 py-4 transition-colors"
                    >
                      <span className="label text-bone-faint">{contact.label}</span>
                      <span className="text-bone transition-colors group-hover:text-accent">
                        {contact.value}
                      </span>
                    </a>
                  </li>
                ))}
              </ul>
            </section>
          ) : null}

          {location ? <p className="label mt-8 text-bone-faint">{location}</p> : null}
        </div>

        <div className="relative min-h-[18rem] overflow-hidden bg-ink-raised lg:min-h-0">
          <Picture
            image={PORTRAIT}
            alt={dict.card.portraitAlt}
            sizes="(min-width: 1024px) 20rem, 100vw"
            priority
            className="absolute inset-0 h-full w-full object-cover"
          />
        </div>
      </div>

      {/*
        Как устроена работа с юрлицом. Показывается только у BUSINESS: частный
        клиент про счёт и закрывающие документы не спрашивает, а компания без
        этого ответа дальше не идёт — подрядчика, которого не провести через
        бухгалтерию, не выбирают, каким бы ни было портфолио.

        Блок стоит под разворотом и во всю ширину: это справка, а не часть
        обращения, и вклинивать её в колонку рядом с портретом незачем.
      */}
      {direction === 'business' ? (
        <section className="mt-20 border-t border-line pt-10">
          <h2 className="text-h2 m-0 text-balance">{dict.contact.termsTitle}</h2>
          <p className="mt-4 max-w-2xl text-lead text-bone-dim">{dict.contact.termsLead}</p>
          <ul className="m-0 mt-10 list-none p-0">
            {dict.contact.terms.map((term) => (
              <li key={term.title} className="border-t border-line first:border-t-0">
                <div className="grid gap-3 py-7 md:grid-cols-[minmax(0,4fr)_minmax(0,7fr)] md:gap-10">
                  <h3 className="text-h3 m-0 text-bone">{term.title}</h3>
                  <p className="m-0 max-w-[62ch] text-bone-dim">{term.body}</p>
                </div>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </div>
  );
}
