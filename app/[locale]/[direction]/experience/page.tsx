/**
 * Experience / Credits (ТЗ §5.6).
 *
 * Профессиональной аудитории не объясняют базовые понятия: подача короче и
 * доказательнее. Роли и credits показываются только подтверждённые (§1.2,
 * §18) — недостающее помечается, а не выдумывается.
 */

import Link from 'next/link';
import type { Metadata } from 'next';
import { Section } from '@/components/content/Section';
import { Breadcrumbs, UnconfirmedTag } from '@/components/global/misc';
import { getDirection, getProjects } from '@/content/queries';
import { getDictionary } from '@/lib/i18n/dictionaries';
import { localizedString } from '@/lib/i18n/localize';
import { resolveDirectionRoute, tryResolveDirectionRoute, sectionStaticParams } from '@/lib/guard';
import { href } from '@/lib/routing';
import { buildMetadata } from '@/lib/seo';

type Props = { params: Promise<{ locale: string; direction: string }> };

export function generateStaticParams() {
  return sectionStaticParams('experience');
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const route = await tryResolveDirectionRoute(params, 'experience');
  if (!route) return {};
  const { locale, direction } = route;
  const dict = getDictionary(locale);

  return buildMetadata({
    locale,
    path: href({ locale, direction, section: 'experience' }),
    title: `${dict.nav.experience} — ${dict.directions[direction]}`,
    description: localizedString((await getDirection(direction))?.lead, locale),
  });
}

export default async function Page({ params }: Props) {
  const { locale, direction } = await resolveDirectionRoute(params, 'experience');
  const dict = getDictionary(locale);
  const projects = await getProjects({ direction });

  return (
    <div className="container-content py-16 lg:py-24">
      <Breadcrumbs
        dict={dict}
        items={[{ label: dict.common.home, href: href({ locale, direction }) }, { label: dict.nav.experience }]}
      />

      <h1 className="text-h1 m-0 max-w-3xl text-balance">{dict.nav.experience}</h1>

      <Section className="px-0">
        <ul className="m-0 list-none p-0">
          {projects.map((project) => {
            const role = localizedString(project.role, locale);
            const roleUnconfirmed =
              role.toUpperCase().includes('ПОДТВЕРЖДЕНИЮ') || role.toUpperCase().includes('CONFIRMED');

            return (
              <li key={project._id} className="border-t border-line">
                <Link
                  href={href({ locale, direction, section: 'work', slug: project.slug })}
                  className="group grid gap-2 py-6 md:grid-cols-[6rem_minmax(0,1fr)_minmax(0,14rem)] md:items-baseline md:gap-6"
                >
                  <span className="label text-bone-faint">{project.year}</span>
                  <span className="text-h3 text-bone transition-colors group-hover:text-accent">
                    {localizedString(project.title, locale)}
                  </span>
                  <span className="label text-bone-dim">
                    {role ? (roleUnconfirmed ? <UnconfirmedTag dict={dict} /> : role) : null}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
        {projects.length > 0 ? <p className="mt-8 border-t border-line" /> : null}
      </Section>

      <p className="max-w-2xl text-bone-faint">
        <UnconfirmedTag dict={dict} />{' '}
        {locale === 'ru'
          ? 'Полный список ролей, credits и оборудования публикуется после подтверждения владельцем.'
          : 'The full list of roles, credits and equipment is published once confirmed by the owner.'}
      </p>
    </div>
  );
}
