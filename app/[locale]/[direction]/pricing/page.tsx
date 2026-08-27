/**
 * Стоимость (ТЗ §5.8).
 *
 * Публикуются только подтверждённые цены и правила расчёта. Незаполненная
 * цена отображается как «по запросу» — старые черновые цифры не подставляются.
 */

import type { Metadata } from 'next';
import { PricingBlock, PricingExtras } from '@/components/content/PricingBlock';
import { EmptyState } from '@/components/content/Section';
import { Breadcrumbs } from '@/components/global/misc';
import { getDirection, getPricing } from '@/content/queries';
import { getDictionary } from '@/lib/i18n/dictionaries';
import { localizedString } from '@/lib/i18n/localize';
import { resolveDirectionRoute, tryResolveDirectionRoute, sectionStaticParams } from '@/lib/guard';
import { href } from '@/lib/routing';
import { buildMetadata } from '@/lib/seo';

type Props = { params: Promise<{ locale: string; direction: string }> };

export function generateStaticParams() {
  return sectionStaticParams('pricing');
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const route = await tryResolveDirectionRoute(params, 'pricing');
  if (!route) return {};
  const { locale, direction } = route;
  const dict = getDictionary(locale);

  return buildMetadata({
    locale,
    path: href({ locale, direction, section: 'pricing' }),
    title: `${dict.nav.pricing} — ${dict.directions[direction]}`,
    description: localizedString((await getDirection(direction))?.lead, locale),
  });
}

export default async function Page({ params }: Props) {
  const { locale, direction } = await resolveDirectionRoute(params, 'pricing');
  const dict = getDictionary(locale);
  const entries = await getPricing(direction);

  return (
    <div className="container-content py-16 lg:py-24">
      <Breadcrumbs
        dict={dict}
        items={[{ label: dict.common.home, href: href({ locale, direction }) }, { label: dict.nav.pricing }]}
      />

      <h1 className="text-h1 m-0 max-w-3xl text-balance">{dict.nav.pricing}</h1>
      <p className="mt-6 max-w-2xl text-lead text-bone-dim">
        {locale === 'ru'
          ? 'Сложные проекты считаются индивидуально: смета зависит от объёма съёмки, состава команды и сроков.'
          : 'Complex projects are quoted individually: the estimate depends on shooting volume, crew and timeline.'}
      </p>

      <div className="mt-14">
        {entries.length === 0 ? (
          <EmptyState title={dict.states.emptyTitle} body={dict.states.emptyBody} />
        ) : (
          <>
            <PricingBlock
              entries={entries}
              locale={locale}
              dict={dict}
              contactHref={href({ locale, direction, section: 'contact' })}
            />

            {entries.some((entry) => entry.kind === 'extra') ? (
              <div className="mt-16 max-w-2xl">
                <h2 className="label m-0 text-accent">{dict.pricing.extras}</h2>
                <div className="mt-6">
                  <PricingExtras entries={entries} locale={locale} dict={dict} />
                </div>
                <p className="mt-8 text-sm text-bone-faint">{dict.pricing.combinedDiscount}</p>
              </div>
            ) : null}
          </>
        )}
      </div>
    </div>
  );
}
