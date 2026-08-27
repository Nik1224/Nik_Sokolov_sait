/**
 * Layout ветки (ТЗ §4).
 *
 * Здесь появляется контекст направления: шапка с логотипом, ведущим на Home
 * ЭТОЙ ветки, переключатель направления, меню ветки и переключатель языка.
 */

import { notFound } from 'next/navigation';
import { Footer } from '@/components/global/Footer';
import { GlobalHeader } from '@/components/global/GlobalHeader';
import { getDirection, getDirections, getGlobalSettings } from '@/content/queries';
import { getDictionary } from '@/lib/i18n/dictionaries';
import { navSections } from '@/lib/nav';
import { DEFAULT_LOCALE, DIRECTIONS, LOCALES, isDirection, isLocale } from '@/lib/site';

export function generateStaticParams() {
  return LOCALES.flatMap((locale) => DIRECTIONS.map((direction) => ({ locale, direction })));
}

export default async function DirectionLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string; direction: string }>;
}) {
  const { locale: rawLocale, direction: rawDirection } = await params;
  if (!isLocale(rawLocale) || !isDirection(rawDirection)) notFound();

  const locale = isLocale(rawLocale) ? rawLocale : DEFAULT_LOCALE;
  const direction = rawDirection;
  const dict = getDictionary(locale);

  const [settings, directionDoc, allDirections] = await Promise.all([
    getGlobalSettings(),
    getDirection(direction),
    getDirections(),
  ]);

  const sections = navSections(direction, directionDoc);
  const directionOptions = allDirections.map((item) => ({
    key: item.key,
    label: dict.directions[item.key],
  }));

  return (
    <div className="flex min-h-dvh flex-col">
      <GlobalHeader
        locale={locale}
        direction={direction}
        sections={sections}
        directions={directionOptions}
        contacts={settings.contacts}
        dict={dict}
      />
      <main id="main" className="flex-1">
        {children}
      </main>
      <Footer locale={locale} settings={settings} dict={dict} />
    </div>
  );
}
