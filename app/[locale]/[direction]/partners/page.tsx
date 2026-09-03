/**
 * Страница для свадебных организаторов.
 *
 * Не для пары: в клиентском меню её нет, на неё ведут прямой ссылкой из письма
 * и строкой в подвале (см. SECTIONS_OUTSIDE_NAV).
 *
 * Смысл страницы — не «я тоже готов давать фотографии». Готовы почти все, и
 * поэтому обещание готовности ничего не значит. Здесь названы вещи, которые
 * организатор проверяет и которые видно по срокам: что именно он получает,
 * когда, и почему это нельзя попросить у обычного фотографа.
 */

import type { Metadata } from 'next';
import Link from 'next/link';
import { ContactButton } from '@/components/contact/ContactButton';
import { Breadcrumbs } from '@/components/global/misc';
import { Picture } from '@/components/media/Picture';
import type { ImageRef } from '@/content/types';
import { getGlobalSettings } from '@/content/queries';
import { getDictionary } from '@/lib/i18n/dictionaries';
import { resolveDirectionRoute, tryResolveDirectionRoute, sectionStaticParams } from '@/lib/guard';
import { cardHref, href } from '@/lib/routing';
import { buildMetadata } from '@/lib/seo';

type Props = { params: Promise<{ locale: string; direction: string }> };

/** Тот же портрет, что и на странице «О себе». */
const PORTRAIT: ImageRef = {
  src: '/media/about/nikita-1200.jpg',
  width: 1200,
  height: 1800,
  sources: [600, 1200].map((width) => ({ width, src: `/media/about/nikita-${width}.jpg` })),
};

export function generateStaticParams() {
  return sectionStaticParams('partners');
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const route = await tryResolveDirectionRoute(params, 'partners');
  if (!route) return {};
  const { locale, direction } = route;
  const dict = getDictionary(locale);

  return buildMetadata({
    locale,
    path: href({ locale, direction, section: 'partners' }),
    title: `${dict.partners.title} — ${dict.directions[direction]}`,
    description: dict.partners.lead,
  });
}

export default async function Page({ params }: Props) {
  const { locale, direction } = await resolveDirectionRoute(params, 'partners');
  const dict = getDictionary(locale);
  const settings = await getGlobalSettings();
  const t = dict.partners;

  return (
    <div className="container-content py-16 lg:py-24">
      <Breadcrumbs
        dict={dict}
        items={[{ label: dict.common.home, href: href({ locale, direction }) }, { label: t.title }]}
      />

      <h1 className="text-h1 m-0 max-w-3xl text-balance">{t.title}</h1>
      <p className="mt-6 max-w-2xl text-lead text-bone-dim">{t.lead}</p>

      {/*
        Главное — первым экраном и цифрой. Срок здесь тот же, что у пары: три
        дня. Это не совпадение и не щедрость, а следствие того, как устроена
        работа после съёмки, — поэтому его можно обещать.
      */}
      <section className="mt-14 border-t border-line pt-6">
        <p className="label m-0 text-accent">{t.promiseLabel}</p>
        <p className="text-h2 m-0 mt-6 max-w-4xl text-balance">{t.promise}</p>
        <p className="mt-6 max-w-2xl text-bone-dim">{t.promiseBody}</p>
      </section>

      <section className="mt-20">
        <div className="border-t border-line pt-6">
          <p className="label m-0 text-accent">{t.packLabel}</p>
          <h2 className="text-h2 m-0 mt-4 text-balance">{t.packTitle}</h2>
        </div>
        <ul className="m-0 mt-10 grid list-none gap-px bg-line p-0 sm:grid-cols-2 lg:grid-cols-3">
          {t.pack.map((item) => (
            <li key={item.title} className="bg-ink p-6 lg:p-8">
              <h3 className="text-h3 m-0 text-bone">{item.title}</h3>
              <p className="mt-3 text-bone-dim">{item.body}</p>
            </li>
          ))}
        </ul>
      </section>

      {/*
        Раздел про отличие. Он существует потому, что первый вопрос организатора
        — «а чем ты лучше остальных ста пятидесяти», и уходить от него хуже, чем
        ответить прямо.
      */}
      <section className="mt-20">
        <div className="border-t border-line pt-6">
          <p className="label m-0 text-accent">{t.whyLabel}</p>
          <h2 className="text-h2 m-0 mt-4 max-w-3xl text-balance">{t.whyTitle}</h2>
        </div>

        {/*
          Портрет стоит именно здесь. Организатор решает, кого он назовёт
          клиенту, и лицо к этому решению относится напрямую — а рядом как раз
          сказано про школу и второе поколение.
        */}
        <div className="mt-10 grid gap-10 lg:grid-cols-[minmax(0,18rem)_minmax(0,1fr)] lg:items-start lg:gap-14">
          <Picture
            image={PORTRAIT}
            alt={t.portraitAlt}
            sizes="(min-width: 1024px) 18rem, 60vw"
            className="w-full max-w-xs"
          />
          <p className="max-w-2xl text-lead text-bone-dim">{t.portraitBody}</p>
        </div>

        <ol className="m-0 mt-14 grid list-none gap-10 p-0 lg:grid-cols-3 lg:gap-8">
          {t.why.map((item, index) => (
            <li key={item.title}>
              <p className="label m-0 text-bone-faint">{String(index + 1).padStart(2, '0')}</p>
              <h3 className="text-h3 m-0 mt-3 text-bone">{item.title}</h3>
              <p className="mt-3 text-bone-dim">{item.body}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className="mt-20 max-w-3xl">
        <div className="border-t border-line pt-6">
          <p className="label m-0 text-accent">{t.rightsLabel}</p>
          <h2 className="text-h2 m-0 mt-4 text-balance">{t.rightsTitle}</h2>
        </div>
        <ul className="m-0 mt-8 list-none space-y-4 p-0">
          {t.rights.map((line) => (
            <li key={line} className="flex gap-4 text-bone-dim">
              <span aria-hidden="true" className="label text-accent">
                —
              </span>
              <span>{line}</span>
            </li>
          ))}
        </ul>
      </section>

      {/*
        Ссылка-визитка. Организатору важнее не «что я умею», а что именно он
        отправит паре: до сих пор это была переписка и пересказ своими словами.
      */}
      <section className="mt-20 max-w-3xl border-t border-line pt-6">
        <p className="label m-0 text-accent">{t.cardLabel}</p>
        <h2 className="text-h2 m-0 mt-4 text-balance">{t.cardTitle}</h2>
        <p className="mt-6 text-bone-dim">{t.cardBody}</p>
        <p className="mt-6">
          {/*
            Новая вкладка: организатор открывает визитку, чтобы посмотреть и
            скопировать ссылку, — и не должен ради этого терять страницу, на
            которой был.
          */}
          <Link
            href={cardHref(locale)}
            target="_blank"
            rel="noopener"
            className="label inline-block border border-line px-6 py-4 text-bone transition-colors hover:border-line-strong hover:text-accent"
          >
            {t.cardAction} ↗
          </Link>
        </p>

        {/*
          Деньги и документы. Сказать про них нужно — организатор всё равно
          спросит, — но выносить в заголовок незачем: страница не об этом.
        */}
        <p className="mt-10 text-sm text-bone-faint">{t.termsFee}</p>
        <p className="mt-3 max-w-2xl text-sm text-bone-faint">{t.termsInvoice}</p>
      </section>

      <section className="mt-20 max-w-2xl border-t border-line pt-6">
        <p className="label m-0 text-accent">{t.startLabel}</p>
        <h2 className="text-h2 m-0 mt-4 text-balance">{t.startTitle}</h2>
        <p className="mt-6 text-bone-dim">{t.startBody}</p>
        <div className="mt-8">
          <ContactButton
            dict={dict}
            contacts={settings.contacts}
            variant="solid"
            label={t.startAction}
          />
        </div>
      </section>
    </div>
  );
}
