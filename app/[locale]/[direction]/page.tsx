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
import { CategoryTiles } from '@/components/content/CategoryTiles';
import { CoverHero } from '@/components/content/CoverHero';
import { HeroMedia } from '@/components/content/HeroMedia';
import { ContactButton } from '@/components/contact/ContactButton';
import { PriceCalculator } from '@/components/content/PriceCalculator';
import { PricingBlock } from '@/components/content/PricingBlock';
import { Section } from '@/components/content/Section';
import { Testimonials } from '@/components/content/Testimonials';
import { ArticleCard, ProjectCard } from '@/components/content/cards';
import { JsonLd } from '@/components/global/misc';
import { MediaGallery } from '@/components/media/MediaGallery';
import { VideoFacade } from '@/components/media/VideoFacade';
import {
  getArticleTypes,
  getArticles,
  getCategories,
  getDirection,
  getGlobalSettings,
  getPricing,
  getProjects,
  getTestimonials,
  getWorkFormats,
} from '@/content/queries';
import { getDictionary } from '@/lib/i18n/dictionaries';
import { localizedString } from '@/lib/i18n/localize';
import { resolveDirectionRoute, tryResolveDirectionRoute } from '@/lib/guard';
import { absoluteUrl, directionHomeHref, href } from '@/lib/routing';
import { buildMetadata, professionalServiceJsonLd, seoText } from '@/lib/seo';
import { isSectionAvailable, siteUrl, type Direction } from '@/lib/site';

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

  const [settings, categories, featured, articles, articleTypes, pricing, formats] =
    await Promise.all([
      getGlobalSettings(),
      getCategories(direction),
      getProjects({ direction, featuredOnly: true, limit: 6 }),
      getArticles({ direction, limit: 3 }),
      getArticleTypes(),
      getPricing(direction),
      getWorkFormats(),
    ]);

  const testimonials = await getTestimonials(direction, 6);

  // Если featured-работ ещё нет, берём последние: пустая главная бесполезна.
  const selected = featured.length > 0 ? featured : await getProjects({ direction, limit: 6 });

  /**
   * Ветка показывает либо список категорий, либо подборку работ, но не оба:
   * у PRIVATE они назывались одинаково — «Портфолио» — и вели в одно место.
   * Категории полезнее: они сразу разводят свадьбу, портрет и семью.
   *
   * У BUSINESS то же самое: категории говорят, что именно снимают, — а разбор
   * задачи текстом лежит в кейсах, и это отдельный пункт меню.
   */
  /*
   * По одному ролику с категории: показать все — значит утопить каждый,
   * человек посмотрит первый и уйдёт. Берём первый в списке — он там и стоит
   * как выбранный. Все вместе показываются только на визитке: её открывает
   * пара, которая уже решает, и ей нужно насмотреться.
   */
  const backstage = categories.flatMap((category) => (category.backstage ?? []).slice(0, 1));
  const showsCategories = direction !== 'production' && categories.length > 0;

  /*
   * Подборка работ. У PRIVATE её заменяют категории — там оба блока назывались
   * «Портфолио» и вели в одно место. У BUSINESS они называются по-разному и
   * отвечают на разные вопросы: категории — что снимают, кейсы — как устроена
   * работа. Компания приходит именно за вторым, поэтому оба блока нужны.
   */
  const showsSelected = selected.length > 0 && (!showsCategories || direction === 'business');

  // Секции нумеруются по порядку появления: метка не дублирует заголовок.
  let sectionIndex = 0;
  const step = () => String(++sectionIndex).padStart(2, '0');

  const showreelProject = selected.find((project) =>
    project.media.some((media) => media.type === 'video'),
  );
  const showreel = showreelProject?.media.find((media) => media.type === 'video');

  return (
    <>
      {/*
        Карточка услуги. Телефон, города и профили берутся из настроек сайта,
        ставка — из калькулятора: дублировать их в коде нельзя, иначе разметка
        начнёт обещать не то, что написано на страницах.
      */}
      <JsonLd
        data={professionalServiceJsonLd({
          name: `${settings.siteName} — ${dict.directions[direction]}`,
          description: localizedString(doc.lead, locale),
          url: absoluteUrl(directionHomeHref(locale, direction), siteUrl()),
          areas: localizedString(settings.location, locale)
            .split('/')
            .map((part) => part.trim())
            .filter(Boolean),
          telephone: settings.contacts.find((item) => item.kind === 'phone')?.value,
          sameAs: settings.socials?.map((item) => item.href),
          founder: 'Никита Соколов',
          priceFrom: doc.calculator
            ? { value: doc.calculator.photoHourPrice, currency: doc.calculator.currency }
            : undefined,
        })}
      />

      {/* Видеообложка показывается целиком, поэтому у неё своя раскладка. */}
      {doc.hero?.type === 'video' ? (
        <CoverHero
          locale={locale}
          eyebrow={dict.directions[direction]}
          title={localizedString(doc.title, locale)}
          lead={localizedString(doc.lead, locale)}
          media={doc.hero}
          cta={{ label: dict.contact.heading, href: href({ locale, direction, section: 'contact' }) }}
          secondaryCta={{ label: dict.nav[section], href: href({ locale, direction, section }) }}
        />
      ) : (
        <HeroMedia
          locale={locale}
          eyebrow={dict.directions[direction]}
          title={localizedString(doc.title, locale)}
          lead={localizedString(doc.lead, locale)}
          media={doc.hero}
          cta={{ label: dict.contact.heading, href: href({ locale, direction, section: 'contact' }) }}
          secondaryCta={{ label: dict.nav[section], href: href({ locale, direction, section }) }}
        />
      )}

      {/* PRODUCTION: шоурил — главный элемент страницы (§5.6). */}
      {direction === 'production' && showreel && showreel.type === 'video' ? (
        <Section eyebrow={step()} title={dict.nav.showreel}>
          <VideoFacade media={showreel} locale={locale} dict={dict} sizes="(min-width: 1024px) 78rem, 100vw" />
        </Section>
      ) : null}

      {showsCategories ? (
        <Section eyebrow={step()} title={dict.nav.portfolio}>
          <CategoryTiles categories={categories} locale={locale} direction={direction} />
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

      {showsSelected ? (
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
          /*
           * Не «смотреть все», а кнопка: калькулятор называет порядок суммы,
           * а собранные пакеты с полным составом лежат на странице стоимости,
           * и туда человек должен попадать заметным переходом.
           */
          action={{
            label: dict.common.packages,
            href: href({ locale, direction, section: 'pricing' }),
            variant: 'solid',
          }}
        >
          {/* Калькулятор объясняет, из чего складывается сумма. Пакеты с
              полным составом лежат на отдельной странице стоимости. */}
          {doc.calculator ? (
            <PriceCalculator
              config={doc.calculator}
              locale={locale}
              dict={dict}
              contacts={settings.contacts}
            />
          ) : (
            <PricingBlock
              entries={pricing.slice(0, 3)}
              locale={locale}
              dict={dict}
              contacts={settings.contacts}
            />
          )}
        </Section>
      ) : null}

      {/*
        Бэкстейдж. В портфолио лежит результат, здесь — процесс: он отвечает на
        другой вопрос, каково будет рядом с этим фотографом весь съёмочный день.
        Пока кадров нет, блока тоже нет: пустой раздел хуже отсутствующего.
      */}
      {backstage.length > 0 ? (
        <Section eyebrow={step()} title={dict.card.backstageTitle} lead={dict.card.backstageBody}>
          <MediaGallery items={backstage} locale={locale} dict={dict} layout="masonry" />
        </Section>
      ) : null}

      {/*
        Полоса для организаторов. Раздела нет в меню — он не для пары, — но
        ссылки в подвале мало: организатор туда не долистает. Здесь он попадёт
        на глаза тому, кто и так изучает страницу целиком, и не помешает
        клиенту: это одна строка, а не блок.
      */}
      {isSectionAvailable(direction, 'partners') ? (
        <section className="container-content">
          <Link
            href={href({ locale, direction, section: 'partners' })}
            className="group flex flex-col gap-4 border-t border-line py-8 md:flex-row md:items-baseline md:justify-between md:gap-10"
          >
            <span className="max-w-xl">
              <span className="text-h3 block text-bone transition-colors group-hover:text-accent">
                {dict.partners.teaserTitle}
              </span>
              <span className="mt-2 block text-bone-dim">{dict.partners.teaserBody}</span>
            </span>
            <span className="label shrink-0 text-bone-faint transition-transform group-hover:translate-x-1">
              {dict.partners.teaserAction} →
            </span>
          </Link>
        </section>
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
          <h2 className="text-h2 m-0 max-w-2xl text-balance">{dict.contact.heading}</h2>
          <p className="mt-4 max-w-xl text-bone-dim">{dict.contact.homeLead}</p>
          {/* С Home известна ветка — с неё и начинается разговор. */}
          <ContactButton
            dict={dict}
            contacts={settings.contacts}
            className="mt-8"
            draft={{ subject: dict.contact.directionSubject[direction] }}
          />
        </div>
      </Section>
    </>
  );
}
