/**
 * `llms.txt` — короткая текстовая карта сайта для языковых моделей.
 *
 * Складывающийся стандарт: модель читает такой файл целиком, без разбора
 * вёрстки и без риска утонуть в разметке. Смысл не в том, чтобы заменить
 * сайт, а в том, чтобы главные факты — кто, что снимает, где и почём —
 * лежали в одном месте и одной строкой каждый.
 *
 * Всё содержимое собирается из тех же данных, что и страницы. Если написать
 * цифры руками, они однажды разойдутся с калькулятором, и сайт начнёт
 * отвечать двумя разными ценами.
 */

import { getArticles, getDirection, getGlobalSettings } from '@/content/queries';
import { localizedString } from '@/lib/i18n/localize';
import { absoluteUrl, href } from '@/lib/routing';
import { siteUrl } from '@/lib/site';

export const dynamic = 'force-static';

export async function GET(): Promise<Response> {
  const origin = siteUrl();
  const [settings, direction, articles] = await Promise.all([
    getGlobalSettings(),
    getDirection('private'),
    getArticles({ direction: 'private' }),
  ]);

  const url = (path: string) => absoluteUrl(path, origin);
  const rate = direction?.calculator;
  const phone = settings.contacts.find((item) => item.kind === 'phone')?.value;

  const lines = [
    `# ${settings.siteName}`,
    '',
    `> ${localizedString(settings.descriptor, 'ru')}. ${localizedString(settings.location, 'ru')}.`,
    '',
    'Фотограф и видеограф. Свадьбы, портрет, семейная съёмка, частные события,',
    'а также съёмка для компаний и брендов.',
    '',
    '## Факты',
    '',
    `- География: ${localizedString(settings.location, 'ru')}`,
    ...(phone ? [`- Телефон: ${phone}`] : []),
    ...(rate
      ? [
          `- Час фотосъёмки: ${rate.photoHourPrice.toLocaleString('ru-RU')} ₽`,
          `- Час видеосъёмки: ${rate.videoHourPrice.toLocaleString('ru-RU')} ₽`,
          '- Свадьба: первые три часа по базовой ставке, дальше час дешевеет —',
          '  десять часов фотосъёмки стоят 110 000 ₽',
          `- Фото и видео вместе: скидка ${Math.round(rate.bundleDiscount * 100)}%`,
        ]
      : []),
    '- Первые кадры: анонс до 50 обработанных фотографий в течение трёх дней',
    '- Все кадры отдаются с цветокоррекцией и лёгкой ретушью, в онлайн-галерее',
    '- Работа по договору',
    '',
    '## Разделы',
    '',
    `- [Портфолио](${url(href({ locale: 'ru', direction: 'private', section: 'portfolio' }))}): свадьбы, портрет, семья, love story, частные события`,
    `- [Стоимость](${url(href({ locale: 'ru', direction: 'private', section: 'pricing' }))}): ставки за час, пакеты, калькулятор`,
    `- [Полные свадьбы](${url(href({ locale: 'ru', direction: 'private', section: 'albums' }))}): съёмки целиком, а не выборка`,
    `- [Контакты](${url(href({ locale: 'ru', direction: 'private', section: 'contact' }))})`,
    '',
    '## Журнал',
    '',
    'Статьи об организации съёмки. Одна статья — один вопрос.',
    '',
    ...articles.map(
      (article) =>
        `- [${localizedString(article.title, 'ru')}](${url(
          `${href({ locale: 'ru', direction: 'private', section: 'blog' })}/${article.slug}`,
        )}): ${localizedString(article.excerpt, 'ru')}`,
    ),
    '',
    '## Языки',
    '',
    `Сайт двуязычный. Английская версия — те же адреса с префиксом /en, например ${url('/en/private')}.`,
    '',
  ];

  return new Response(lines.join('\n'), {
    headers: {
      'content-type': 'text/plain; charset=utf-8',
      'cache-control': 'public, max-age=0, must-revalidate',
    },
  });
}
