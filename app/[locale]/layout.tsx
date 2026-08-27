/**
 * Корневой layout. Язык страницы задаётся сегментом URL (ТЗ §4.1):
 * URL — источник истины, никакой автоматической подмены по прошлому выбору.
 */

import type { Metadata } from 'next';
import { Inter, JetBrains_Mono } from 'next/font/google';
import { getGlobalSettings, hasDemoContent } from '@/content/queries';
import { DemoBanner, SkipLink } from '@/components/global/misc';
import { getDictionary } from '@/lib/i18n/dictionaries';
import { localizedString } from '@/lib/i18n/localize';
import { DEFAULT_LOCALE, LOCALES, isLocale, siteUrl } from '@/lib/site';
import '@/styles/globals.css';

const inter = Inter({
  subsets: ['latin', 'cyrillic'],
  variable: '--font-inter',
  display: 'swap',
});

const mono = JetBrains_Mono({
  subsets: ['latin', 'cyrillic'],
  variable: '--font-mono-face',
  display: 'swap',
});

export function generateStaticParams() {
  return LOCALES.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale: raw } = await params;
  const locale = isLocale(raw) ? raw : DEFAULT_LOCALE;
  const settings = await getGlobalSettings();

  return {
    metadataBase: new URL(siteUrl()),
    title: {
      default: localizedString(settings.defaultSeo.title, locale, settings.siteName),
      template: `%s — ${settings.siteName}`,
    },
    description: localizedString(settings.defaultSeo.description, locale),
  };
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale: raw } = await params;
  // Неизвестный язык не должен ломать разметку: страница ниже отдаст 404.
  const locale = isLocale(raw) ? raw : DEFAULT_LOCALE;
  const dict = getDictionary(locale);
  const showDemoBanner = await hasDemoContent();

  return (
    <html lang={locale} className={`${inter.variable} ${mono.variable}`}>
      <body>
        <SkipLink label={dict.common.skipToContent} />
        {showDemoBanner ? <DemoBanner dict={dict} /> : null}
        {children}
      </body>
    </html>
  );
}
