/**
 * Полные серии съёмок (ТЗ §5.2).
 *
 * Портфолио показывает лучшие кадры с разных свадеб; сюда приходят те, кто
 * хочет увидеть один день целиком. Сами галереи живут на внешнем сервисе
 * выдачи — здесь только карточки и ссылки.
 */

import type { Metadata } from 'next';
import { AlbumGrid } from '@/components/content/AlbumGrid';
import { EmptyState } from '@/components/content/Section';
import { Breadcrumbs } from '@/components/global/misc';
import { getAlbums } from '@/content/queries';
import { getDictionary } from '@/lib/i18n/dictionaries';
import { resolveDirectionRoute, tryResolveDirectionRoute, sectionStaticParams } from '@/lib/guard';
import { href } from '@/lib/routing';
import { buildMetadata } from '@/lib/seo';

type Props = { params: Promise<{ locale: string; direction: string }> };

export function generateStaticParams() {
  return sectionStaticParams('albums');
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const route = await tryResolveDirectionRoute(params, 'albums');
  if (!route) return {};
  const { locale, direction } = route;
  const dict = getDictionary(locale);

  return buildMetadata({
    locale,
    path: href({ locale, direction, section: 'albums' }),
    title: `${dict.nav.albums} — ${dict.directions[direction]}`,
    description: dict.albums.lead,
  });
}

export default async function Page({ params }: Props) {
  const { locale, direction } = await resolveDirectionRoute(params, 'albums');
  const dict = getDictionary(locale);
  const albums = await getAlbums(direction);

  return (
    <div className="container-content py-16 lg:py-24">
      <Breadcrumbs
        dict={dict}
        items={[{ label: dict.common.home, href: href({ locale, direction }) }, { label: dict.nav.albums }]}
      />

      <h1 className="text-h1 m-0 max-w-3xl text-balance">{dict.nav.albums}</h1>
      <p className="mt-6 max-w-2xl text-lead text-bone-dim">{dict.albums.lead}</p>

      <div className="mt-14">
        {albums.length === 0 ? (
          <EmptyState title={dict.albums.emptyTitle} body={dict.albums.emptyBody} />
        ) : (
          <AlbumGrid albums={albums} locale={locale} dict={dict} />
        )}
      </div>
    </div>
  );
}
