/**
 * Стоимость (ТЗ §5.8).
 *
 * Публикуются только подтверждённые цены и правила расчёта. Незаполненная
 * цена отображается как «по запросу» — старые черновые цифры не подставляются.
 */

import type { Metadata } from 'next';
import { PriceCalculator } from '@/components/content/PriceCalculator';
import { PricingExtras } from '@/components/content/PricingBlock';
import { PricingPackages } from '@/components/content/PricingPackages';
import { EmptyState } from '@/components/content/Section';
import { Breadcrumbs } from '@/components/global/misc';
import { getDirection, getGlobalSettings, getPricing } from '@/content/queries';
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

/**
 * Заголовок блока страницы.
 *
 * Раньше блоки подписывались той же мелкой строчкой, что и служебные метки, —
 * «Пакетные предложения» просто не замечали. Номер отделяет блоки друг от
 * друга, заголовок отвечает за размер.
 */
function BlockHeading({ step, title }: { step: string; title: string }) {
  return (
    <div className="border-t border-line pt-6">
      <p className="label m-0 text-accent">{step}</p>
      <h2 className="text-h2 m-0 mt-4 text-balance">{title}</h2>
    </div>
  );
}

export default async function Page({ params }: Props) {
  const { locale, direction } = await resolveDirectionRoute(params, 'pricing');
  const dict = getDictionary(locale);
  const [entries, doc, settings] = await Promise.all([
    getPricing(direction),
    getDirection(direction),
    getGlobalSettings(),
  ]);

  // Пакеты и дополнения показываются по-разному: карточками и строкой.
  const packages = entries.filter((entry) => entry.kind !== 'extra');
  const extras = entries.filter((entry) => entry.kind === 'extra');

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

      {doc?.calculator ? (
        <div className="mt-16">
          <BlockHeading step="01" title={dict.calculator.heading} />
          <div className="mt-10">
            <PriceCalculator
              config={doc.calculator}
              locale={locale}
              dict={dict}
              contacts={settings.contacts}
            />
          </div>
        </div>
      ) : null}

      <div className="mt-16">
        {packages.length === 0 ? (
          <EmptyState title={dict.states.emptyTitle} body={dict.states.emptyBody} />
        ) : (
          <>
            <BlockHeading step={doc?.calculator ? '02' : '01'} title={dict.pricing.packages} />
            <div className="mt-10">
              <PricingPackages
                groups={doc?.pricingGroups ?? []}
                entries={packages}
                locale={locale}
                dict={dict}
                contacts={settings.contacts}
              />
            </div>
          </>
        )}

        {extras.length > 0 ? (
          <div className="mt-20 max-w-2xl">
            <BlockHeading step={doc?.calculator ? '03' : '02'} title={dict.pricing.extras} />
            <div className="mt-8">
              <PricingExtras entries={extras} locale={locale} dict={dict} />
            </div>
            <p className="mt-8 text-sm text-bone-faint">{dict.pricing.combinedDiscount}</p>
          </div>
        ) : null}
      </div>
    </div>
  );
}
