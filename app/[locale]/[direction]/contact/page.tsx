/**
 * Контакты (ТЗ §5.8).
 *
 * У каждой ветки своя форма: набор полей и список типов задач отличаются.
 * PRIVATE спрашивает дату и город, BUSINESS — услугу, PRODUCTION — проект.
 */

import type { Metadata } from 'next';
import { ContactForm } from '@/components/forms/ContactForm';
import { Breadcrumbs } from '@/components/global/misc';
import { getCategories, getGlobalSettings, getServices, getWorkFormats } from '@/content/queries';
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

  const [settings, formats, services, categories] = await Promise.all([
    getGlobalSettings(),
    getWorkFormats(),
    direction === 'business' ? getServices() : Promise.resolve([]),
    getCategories(direction),
  ]);

  // Типы задач берутся из данных ветки: услуги для BUSINESS, категории для
  // остальных. Список редактируется в CMS и не прошит в коде (§8).
  const taskTypes =
    direction === 'business'
      ? services.map((service) => ({ value: service.slug, label: localizedString(service.title, locale) }))
      : categories.map((category) => ({
          value: category.slug,
          label: localizedString(category.title, locale),
        }));

  return (
    <div className="container-content py-16 lg:py-24">
      <Breadcrumbs
        dict={dict}
        items={[{ label: dict.common.home, href: href({ locale, direction }) }, { label: dict.nav.contact }]}
      />

      <h1 className="text-h1 m-0 max-w-3xl text-balance">{dict.form.heading}</h1>
      {settings.location ? (
        <p className="label mt-6 text-bone-dim">{localizedString(settings.location, locale)}</p>
      ) : null}

      <div className="mt-14">
        <ContactForm
          locale={locale}
          direction={direction}
          dict={dict}
          taskTypes={taskTypes}
          formats={formats}
          contacts={settings.contacts}
          showDateAndCity={direction === 'private'}
        />
      </div>
    </div>
  );
}
