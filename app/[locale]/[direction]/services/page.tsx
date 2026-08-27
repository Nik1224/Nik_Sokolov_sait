/** Листинг услуг BUSINESS (ТЗ §5.3). */

import type { Metadata } from 'next';
import { ServiceCard } from '@/components/content/cards';
import { EmptyState } from '@/components/content/Section';
import { Breadcrumbs } from '@/components/global/misc';
import { getDirection, getServices, getWorkFormats } from '@/content/queries';
import { getDictionary } from '@/lib/i18n/dictionaries';
import { localizedString } from '@/lib/i18n/localize';
import { resolveDirectionRoute, tryResolveDirectionRoute, sectionStaticParams } from '@/lib/guard';
import { href } from '@/lib/routing';
import { buildMetadata } from '@/lib/seo';

type Props = { params: Promise<{ locale: string; direction: string }> };

export function generateStaticParams() {
  return sectionStaticParams('services');
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const route = await tryResolveDirectionRoute(params, 'services');
  if (!route) return {};
  const { locale, direction } = route;
  const dict = getDictionary(locale);
  const doc = await getDirection(direction);

  return buildMetadata({
    locale,
    path: href({ locale, direction, section: 'services' }),
    title: `${dict.nav.services} — ${dict.directions[direction]}`,
    description: localizedString(doc?.lead, locale),
  });
}

export default async function Page({ params }: Props) {
  const { locale, direction } = await resolveDirectionRoute(params, 'services');
  const dict = getDictionary(locale);

  const [doc, services, formats] = await Promise.all([
    getDirection(direction),
    getServices(),
    getWorkFormats(),
  ]);

  return (
    <div className="container-content py-16 lg:py-24">
      <Breadcrumbs
        dict={dict}
        items={[{ label: dict.common.home, href: href({ locale, direction }) }, { label: dict.nav.services }]}
      />

      <h1 className="text-h1 m-0 max-w-3xl text-balance">{dict.nav.services}</h1>
      <p className="mt-6 max-w-2xl text-lead text-bone-dim">{localizedString(doc?.lead, locale)}</p>

      <div className="mt-14">
        {services.length === 0 ? (
          <EmptyState title={dict.states.emptyTitle} body={dict.states.emptyBody} />
        ) : (
          <ul className="m-0 grid list-none gap-10 p-0 md:grid-cols-2 lg:grid-cols-3 lg:gap-x-8 lg:gap-y-14">
            {services.map((service) => (
              <li key={service._id}>
                <ServiceCard
                  service={service}
                  locale={locale}
                  direction={direction}
                  dict={dict}
                  formats={formats
                    .filter((format) => service.formatSlugs.includes(format.slug))
                    .map((format) => localizedString(format.title, locale))}
                />
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
