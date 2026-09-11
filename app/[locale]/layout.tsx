/**
 * Корневой layout. Язык страницы задаётся сегментом URL (ТЗ §4.1):
 * URL — источник истины, никакой автоматической подмены по прошлому выбору.
 */

import type { Metadata } from 'next';
import { Cormorant_Garamond, Geologica, Inter, JetBrains_Mono } from 'next/font/google';
import { getGlobalSettings, hasDemoContent } from '@/content/queries';
import { DemoBanner, SkipLink } from '@/components/global/misc';
import { PaintTransition } from '@/components/global/PaintTransition';
import { getDictionary } from '@/lib/i18n/dictionaries';
import { localizedString } from '@/lib/i18n/localize';
import { REVEAL_SCRIPT } from '@/lib/reveal';
import { DEFAULT_LOCALE, LOCALES, isLocale, siteUrlObject } from '@/lib/site';
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

/**
 * Заголовочная антиква. Её берёт только PRIVATE: частному клиенту нужна
 * интонация каталога, а не интерфейса. BUSINESS и PRODUCTION остаются на
 * гротеске — какая ветка какой шрифт берёт, решает токен `--font-display`
 * в `styles/globals.css`, а не этот файл.
 */
const display = Cormorant_Garamond({
  subsets: ['latin', 'cyrillic'],
  weight: ['400', '500', '600'],
  variable: '--font-display-face',
  display: 'swap',
});

/**
 * Гротеск с осью резкости контуров. Его берёт только BUSINESS: заголовки там
 * набраны на SHRP 100, текст на SHRP 0 — одна семья говорит двумя голосами, и
 * разница между ними не в кегле, а в том, насколько остры углы букв. Для
 * студии, которая продаёт резкость кадра, это единственный параметр шрифта,
 * который стоит трогать.
 *
 * Какая ветка какой шрифт берёт, решает `--font-display` в `globals.css`, а не
 * этот файл.
 */
const grotesk = Geologica({
  subsets: ['latin', 'cyrillic'],
  axes: ['SHRP'],
  variable: '--font-grotesk-face',
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

  /*
   * `suppressHydrationWarning` — про класс `reveal-ready`. Скрипт в начале тела
   * ставит его на `<html>` до того, как React дойдёт до гидратации: иначе блоки
   * успевают мигнуть. React сверяет свой `className` с тем, что уже в DOM,
   * видит лишний класс и печатает несовпадение на каждой загрузке. Гасится
   * ровно этот элемент и только его собственные атрибуты — содержимое страницы
   * проверяется как обычно.
   */
  return (
    <html
      lang={locale}
      suppressHydrationWarning
      className={`${inter.variable} ${mono.variable} ${display.variable} ${grotesk.variable}`}
    >
      <body>
        {/*
          Первым в теле, до всей разметки: скрипт прячет блоки до прокрутки, и
          сделать это он должен раньше, чем браузер их нарисует. Подключённый
          обычным образом файл выполнился бы после отрисовки — блоки успели бы
          мигнуть и пропасть.
        */}
        <script dangerouslySetInnerHTML={{ __html: REVEAL_SCRIPT }} />
        <SkipLink label={dict.common.skipToContent} />
        {showDemoBanner ? <DemoBanner dict={dict} /> : null}
        {children}
        <PaintTransition />
      </body>
    </html>
  );
}
