/**
 * Home направления (ТЗ §5.2–5.6, §14.2).
 *
 * Один шаблон на три ветки: порядок блоков общий, а состав зависит от того,
 * какие разделы у ветки есть. Отдельного приложения на каждое направление нет
 * (§15.2).
 */

import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { HeroMedia } from '@/components/content/HeroMedia';
import { PricingBlock } from '@/components/content/PricingBlock';
import { Section } from '@/components/content/Section';
import { Testimonials } from '@/components/content/Testimonials';
import { ArticleCard, ProjectCard, ServiceCard } from '@/components/content/cards';
import { JsonLd } from '@/components/global/misc';
import { VideoFacade } from '@/components/media/VideoFacade';
import {
  getArticleTypes,
  getArticles,
  getCategories,
  getDirection,
  getGlobalSettings,
  getPricing,
  getProjects,
  getServices,
  getTestimonials,
  getWorkFormats,
} from '@/content/queries';
import { getDictionary } from '@/lib/i18n/dictionaries';
import { localizedString } from '@/lib/i18n/localize';
import { resolveDirectionRoute, tryResolveDirectionRoute } from '@/lib/guard';
import { absoluteUrl, directionHomeHref, href } from '@/lib/routing';
import { buildMetadata, professionalServiceJsonLd, seoText } from '@/lib/seo';
import { siteUrl, type Direction } from '@/lib/site';

type Props = { params: Promise<{ locale: string; direction: string }> };

/** В какой раздел ветки ведут карточки работ. */
function workSection(direction: Direction): 'cases' | 'work' | 'portfolio' {
  if (direction === 'business') return 'cases';
  if (direction === 'production') return 'work';
  return 'portfolio';
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const route = await tryResolveDirectionRoute(params);
  if (!route) return {};
  const { locale, direction } = route;

  const doc = await getDirection(direction);
  const dict = getDictionary(locale);
  const seo = seoText(
    doc?.seo,
    locale,
    `${dict.directions[direction]} — ${localizedString(doc?.title, locale)}`,
    localizedString(doc?.lead, locale),
  );

  return buildMetadata({
    locale,
    path: directionHomeHref(locale, direction),
    title: seo.title,
    description: seo.description,
    image: doc?.hero?.type === 'image' ? doc.hero.image : doc?.hero?.poster,
    noIndex: seo.noIndex,
  });
}

export default async function DirectionHome({ params }: Props) {
  const { locale, direction } = await resolveDirectionRoute(params);
  const dict = getDictionary(locale);

  const doc = await getDirection(direction);
  if (!doc) notFound();

  const section = workSection(direction);

  const [settings, categories, services, featured, articles, articleTypes, pricing, formats] =
    await Promise.all([
      getGlobalSettings(),
      getCategories(direction),
      direction === 'business' ? getServices() : Promise.resolve([]),
      getProjects({ direction, featuredOnly: true, limit: 6 }),
      getArticles({ direction, limit: 3 }),
      getArticleTypes(),
      getPricing(direction),
      getWorkFormats(),
    ]);

  const testimonials = await getTestimonials(direction, 6);

  // Если featured-работ ещё нет, берём последние: пустая главная бесполезна.
  const selected = featured.length > 0 ? featured : await getProjects({ direction, limit: 6 });

  // Секции нумеруются по порядку появления: метка не дублирует заголовок.
  let sectionIndex = 0;
  const step = () => String(++sectionIndex).padStart(2, '0');

  const showreelProject = selected.find((project) =>
    project.media.some((media) => media.type === 'video'),
  );
  const showreel = showreelProject?.media.find((media) => media.type === 'video');

  return (
    <>
      <JsonLd
        data={professionalServiceJsonLd(
          `${settings.siteName} — ${dict.directions[direction]}`,
          localizedString(doc.lead, locale),
          absoluteUrl(directionHomeHref(locale, direction), siteUrl()),
        )}
      />

      <HeroMedia
        locale={locale}
        eyebrow={dict.directions[direction]}
        title={localizedString(doc.title, locale)}
        lead={localizedString(doc.lead, locale)}
        media={doc.hero}
        cta={{ label: dict.form.heading, href: href({ locale, direction, section: 'contact' }) }}
        secondaryCta={{ label: dict.nav[section], href: href({ locale, direction, section }) }}
      />

      {/* PRODUCTION: шоурил — главный элемент страницы (§5.6). */}
      {direction === 'production' && showreel && showreel.type === 'video' ? (
        <Section eyebrow={step()} title={dict.nav.showreel}>
          <VideoFacade media={showreel} locale={locale} dict={dict} sizes="(min-width: 1024px) 78rem, 100vw" />
        </Section>
      ) : null}

      {/* BUSINESS: услуги. PRIVATE: категории съёмки. */}
      {direction === 'business' && services.length > 0 ? (
        <Section
          eyebrow={step()}
          title={dict.nav.services}
          action={{ label: dict.common.viewAll, href: href({ locale, direction, section: 'services' }) }}
        >
          <ul className="m-0 grid list-none gap-10 p-0 md:grid-cols-2 lg:grid-cols-3">
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
        </Section>
      ) : null}

      {direction === 'private' && categories.length > 0 ? (
        <Section eyebrow={step()} title={dict.nav.portfolio}>
          <ul className="m-0 grid list-none gap-px bg-line p-0 sm:grid-cols-2 lg:grid-cols-3">
            {categories.map((category) => (
              <li key={category._id} className="bg-ink">
                <Link
                  href={`${href({ locale, direction, section: 'portfolio' })}?category=${category.slug}`}
                  className="group flex items-center justify-between p-6 lg:p-8"
                >
                  <span className="text-h3 text-bone transition-colors group-hover:text-accent">
                    {localizedString(category.title, locale)}
                  </span>
                  <span aria-hidden="true" className="label text-bone-faint transition-transform group-hover:translate-x-1">
                    →
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </Section>
      ) : null}

      {doc.highlights.length > 0 ? (
        <Section eyebrow={step()} title={dict.common.included}>
          <ul className="m-0 grid list-none gap-px bg-line p-0 sm:grid-cols-2 lg:grid-cols-3">
            {doc.highlights.map((item, index) => (
              <li key={index} className="bg-ink p-6 lg:p-8">
                <h3 className="text-h3 m-0 text-bone">{localizedString(item.title, locale)}</h3>
                {item.body ? (
                  <p className="mt-3 text-bone-dim">{localizedString(item.body, locale)}</p>
                ) : null}
              </li>
            ))}
          </ul>
        </Section>
      ) : null}

      {selected.length > 0 ? (
        <Section
          eyebrow={step()}
          title={dict.nav[section]}
          action={{ label: dict.common.viewAll, href: href({ locale, direction, section }) }}
        >
          <ul className="m-0 grid list-none gap-10 p-0 sm:grid-cols-2 lg:grid-cols-3 lg:gap-x-8 lg:gap-y-16">
            {selected.map((project, index) => (
              <li key={project._id}>
                <ProjectCard
                  project={project}
                  locale={locale}
                  direction={direction}
                  dict={dict}
                  categories={categories}
                  section={section}
                  priority={index < 3}
                />
              </li>
            ))}
          </ul>
        </Section>
      ) : null}

      {pricing.length > 0 ? (
        <Section
          eyebrow={step()}
          title={dict.nav.pricing}
          action={{ label: dict.common.viewAll, href: href({ locale, direction, section: 'pricing' }) }}
        >
          <PricingBlock
            entries={pricing.slice(0, 3)}
            locale={locale}
            dict={dict}
            contactHref={href({ locale, direction, section: 'contact' })}
          />
        </Section>
      ) : null}

      {testimonials.length > 0 ? (
        <Section eyebrow={step()} title={dict.common.testimonials}>
          <Testimonials items={testimonials} locale={locale} dict={dict} />
        </Section>
      ) : null}

      {articles.length > 0 ? (
        <Section
          eyebrow={step()}
          title={dict.nav.blog}
          action={{ label: dict.common.viewAll, href: href({ locale, direction, section: 'blog' }) }}
        >
          <ul className="m-0 grid list-none gap-12 p-0 md:grid-cols-3">
            {articles.map((article) => (
              <li key={article._id}>
                <ArticleCard
                  article={article}
                  locale={locale}
                  direction={direction}
                  dict={dict}
                  typeLabel={
                    articleTypes.find((type) => type.slug === article.typeSlug)
                      ? localizedString(
                          articleTypes.find((type) => type.slug === article.typeSlug)!.title,
                          locale,
                        )
                      : undefined
                  }
                />
              </li>
            ))}
          </ul>
        </Section>
      ) : null}

      <Section>
        <div className="border-t border-line pt-10">
          <h2 className="text-h2 m-0 max-w-2xl text-balance">{dict.form.heading}</h2>
          <Link
            href={href({ locale, direction, section: 'contact' })}
            className="label mt-8 inline-block bg-bone px-7 py-4 text-ink transition-colors hover:bg-accent"
          >
            {dict.nav.contact}
          </Link>
        </div>
      </Section>
    </>
  );
}
