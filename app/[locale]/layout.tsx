/**
 * Корневой layout. Язык страницы задаётся сегментом URL (ТЗ §4.1):
 * URL — источник истины, никакой автоматической подмены по прошлому выбору.
 */

import type { Metadata } from 'next';
import { Geologica, JetBrains_Mono } from 'next/font/google';
import { getGlobalSettings, hasDemoContent } from '@/content/queries';
import { DemoBanner, SkipLink } from '@/components/global/misc';
import { PaintTransition } from '@/components/global/PaintTransition';
import { getDictionary } from '@/lib/i18n/dictionaries';
import { localizedString } from '@/lib/i18n/localize';
import { DEFAULT_LOCALE, LOCALES, isLocale, siteUrlObject } from '@/lib/site';
import '@/styles/globals.css';

/*
 * Geologica — гротеск с родной кириллицей и осью резкости контуров (SHRP).
 *
 * Ось здесь не украшение: заголовок ветки BUSINESS набран на максимальной
 * резкости, текст — на нулевой. Одна семья говорит двумя голосами, и разница
 * между ними не в кегле, а в том, насколько остры углы букв. Для студии,
 * которая продаёт резкость кадра, это единственный параметр шрифта, который
 * вообще стоит трогать.
 *
 * Inter, стоявший здесь раньше, — интерфейсный гротеск: в крупном кириллическом
 * капсе у него нет напряжения, «И», «Д» и «Б» выходят пустыми. Плюс это самый
 * узнаваемый шрифт всех продуктовых сайтов подряд.
 */
const display = Geologica({
  subsets: ['latin', 'cyrillic'],
  axes: ['SHRP'],
  variable: '--font-display',
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
    metadataBase: siteUrlObject(),
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
    <html lang={locale} className={`${display.variable} ${mono.variable}`}>
      <body>
        <SkipLink label={dict.common.skipToContent} />
        {showDemoBanner ? <DemoBanner dict={dict} /> : null}
        {children}
        <PaintTransition />
      </body>
    </html>
  );
}
