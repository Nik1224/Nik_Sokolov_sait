/**
 * Страница услуги BUSINESS (ТЗ §5.4, §14.3).
 *
 * Порядок: hero и обещание результата → showreel/галерея → что снимаем,
 * форматы, deliverables → связанные кейсы → принцип расчёта → этапы → FAQ →
 * форма с предзаполненным типом услуги.
 */

import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { HeroMedia } from '@/components/content/HeroMedia';
import { PortableBody } from '@/components/content/PortableBody';
import { PricingBlock } from '@/components/content/PricingBlock';
import { Section } from '@/components/content/Section';
import { ProjectCard } from '@/components/content/cards';
import { ContactForm } from '@/components/forms/ContactForm';
import { Breadcrumbs, FallbackNotice } from '@/components/global/misc';
import { MediaGallery } from '@/components/media/MediaGallery';
import {
  getCategories,
  getGlobalSettings,
  getPricingEntry,
  getProjects,
  getService,
  getServices,
  getWorkFormats,
  resolveFormats,
} from '@/content/queries';
import { getDictionary } from '@/lib/i18n/dictionaries';
import { localizedString, pageNeedsFallbackNotice, resolveLocalized } from '@/lib/i18n/localize';
import { resolveDirectionRoute, tryResolveDirectionRoute } from '@/lib/guard';
import { href } from '@/lib/routing';
import { buildMetadata, seoText } from '@/lib/seo';
import { LOCALES } from '@/lib/site';

type Props = { params: Promise<{ locale: string; direction: string; slug: string }> };

export async function generateStaticParams() {
  const services = await getServices();
  return LOCALES.flatMap((locale) =>
    services.map((service) => ({ locale, direction: 'business', slug: service.slug })),
  );
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale: rawLocale, direction: rawDirection, slug } = await params;
  const route = await tryResolveDirectionRoute(
    Promise.resolve({ locale: rawLocale, direction: rawDirection }),
    'services',
  );
  if (!route) return {};
  const { locale, direction } = route;

  const service = await getService(slug);
  if (!service) return {};

  const seo = seoText(
    service.seo,
    locale,
    localizedString(service.title, locale),
    localizedString(service.summary, locale),
  );

  return buildMetadata({
    locale,
    path: href({ locale, direction, section: 'services', slug }),
    title: seo.title,
    description: seo.description,
    image: service.hero?.type === 'image' ? service.hero.image : service.hero?.poster,
    noIndex: seo.noIndex,
  });
}

export default async function Page({ params }: Props) {
  const { locale: rawLocale, direction: rawDirection, slug } = await params;
  const { locale, direction } = await resolveDirectionRoute(
    Promise.resolve({ locale: rawLocale, direction: rawDirection }),
    'services',
  );
  const dict = getDictionary(locale);

  const service = await getService(slug);
  if (!service) notFound();

  const [settings, formats, allFormats, relatedProjects, categories, pricing] = await Promise.all([
    getGlobalSettings(),
    resolveFormats(service.formatSlugs),
    getWorkFormats(),
    getProjects({ direction, serviceSlug: service.slug, limit: 3 }),
    getCategories(direction),
    service.pricingSlug ? getPricingEntry(service.pricingSlug) : Promise.resolve(null),
  ]);

  const body = resolveLocalized(service.body, locale);
  const showFallbackNotice = pageNeedsFallbackNotice([service.title, service.summary, service.body], locale);
  const contactHref = href({ locale, direction, section: 'contact' });
  const title = localizedString(service.title, locale);

  return (
    <article>
      <div className="container-content pt-16 lg:pt-20">
        <Breadcrumbs
          dict={dict}
          items={[
            { label: dict.common.home, href: href({ locale, direction }) },
            { label: dict.nav.services, href: href({ locale, direction, section: 'services' }) },
            { label: title },
          ]}
        />
        {showFallbackNotice ? (
          <div className="mb-8 max-w-2xl">
            <FallbackNotice dict={dict} />
          </div>
        ) : null}
      </div>

      <HeroMedia
        locale={locale}
        eyebrow={dict.nav.services}
        title={title}
        lead={localizedString(service.summary, locale)}
        media={service.hero}
        cta={{ label: dict.form.heading, href: '#contact-form' }}
        compact
      />

      {service.gallery.length > 0 ? (
        <Section>
          <MediaGallery items={service.gallery} locale={locale} dict={dict} />
        </Section>
      ) : null}

      <Section>
        <div className="grid gap-12 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)] lg:gap-16">
          <div>
            {body.value ? <PortableBody value={body.value} locale={locale} dict={dict} /> : null}
          </div>

          <div className="space-y-10">
            {formats.length > 0 ? (
              <div className="border-t border-line pt-6">
                <h2 className="label m-0 text-accent">{dict.common.formats}</h2>
                <ul className="m-0 mt-4 list-none space-y-2 p-0 text-bone">
                  {formats.map((format) => (
                    <li key={format._id}>{localizedString(format.title, locale)}</li>
                  ))}
                </ul>
              </div>
            ) : null}

            {service.deliverables.length > 0 ? (
              <div className="border-t border-line pt-6">
                <h2 className="label m-0 text-accent">{dict.common.deliverables}</h2>
                <ul className="m-0 mt-4 list-none space-y-2 p-0 text-bone">
                  {service.deliverables.map((item, index) => (
                    <li key={index}>{localizedString(item, locale)}</li>
                  ))}
                </ul>
              </div>
            ) : null}

            {service.leadTime ? (
              <div className="border-t border-line pt-6">
                <h2 className="label m-0 text-accent">{dict.common.process}</h2>
                <p className="mt-4 text-bone">{localizedString(service.leadTime, locale)}</p>
              </div>
            ) : null}
          </div>
        </div>
      </Section>

      {relatedProjects.length > 0 ? (
        <Section
          title={dict.common.relatedCases}
          action={{ label: dict.common.viewAll, href: href({ locale, direction, section: 'cases' }) }}
        >
          <ul className="m-0 grid list-none gap-10 p-0 sm:grid-cols-2 lg:grid-cols-3">
            {relatedProjects.map((project) => (
              <li key={project._id}>
                <ProjectCard
                  project={project}
                  locale={locale}
                  direction={direction}
                  dict={dict}
                  categories={categories}
                  section="cases"
                />
              </li>
            ))}
          </ul>
        </Section>
      ) : null}

      {pricing ? (
        <Section title={dict.nav.pricing}>
          <PricingBlock entries={[pricing]} locale={locale} dict={dict} contactHref={contactHref} />
          <p className="mt-6">
            <Link
              href={href({ locale, direction, section: 'pricing' })}
              className="label text-bone-dim transition-colors hover:text-bone"
            >
              {dict.common.viewAll} →
            </Link>
          </p>
        </Section>
      ) : null}

      {service.process.length > 0 ? (
        <Section title={dict.common.process}>
          <ol className="m-0 grid list-none gap-px bg-line p-0 md:grid-cols-2 lg:grid-cols-4">
            {service.process.map((step, index) => (
              <li key={index} className="bg-ink p-6 lg:p-8">
                <p className="label m-0 text-accent">{String(index + 1).padStart(2, '0')}</p>
                <h3 className="text-h3 mt-4">{localizedString(step.title, locale)}</h3>
                {step.body ? (
                  <p className="mt-3 text-bone-dim">{localizedString(step.body, locale)}</p>
                ) : null}
              </li>
            ))}
          </ol>
        </Section>
      ) : null}

      {service.faq.length > 0 ? (
        <Section title={dict.common.faq}>
          <dl className="m-0 max-w-3xl">
            {service.faq.map((item, index) => (
              <div key={index} className="border-t border-line py-6">
                <dt className="text-h3 m-0">{localizedString(item.question, locale)}</dt>
                <dd className="m-0 mt-3 text-bone-dim">{localizedString(item.answer, locale)}</dd>
              </div>
            ))}
          </dl>
        </Section>
      ) : null}

      <Section id="contact-form" title={dict.form.heading}>
        <ContactForm
          locale={locale}
          direction={direction}
          dict={dict}
          // Тип задачи предзаполнен услугой, с которой пришёл пользователь (§5.4).
          defaultTaskType={service.slug}
          taskTypes={(await getServices()).map((item) => ({
            value: item.slug,
            label: localizedString(item.title, locale),
          }))}
          formats={allFormats}
          contacts={settings.contacts}
        />
      </Section>
    </article>
  );
}
