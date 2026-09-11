/**
 * Полоса доверия: компании, которые уже заказывали (§5.2).
 *
 * Стоит сразу под hero и до перечня того, что снимают. Порядок здесь не
 * декоративный: человек, который решает про подрядчика, сначала проверяет, кто
 * рискнул до него, и только потом читает список услуг. Перенос этой полосы вниз
 * страницы делает её украшением — до неё дочитывает тот, кто и так убеждён.
 *
 * Логотипов нет намеренно. Чужой знак требует разрешения на использование и
 * своей сетки размеров: ряд из разнокалиберных картинок в монохромной вёрстке
 * разваливается, а набранное имя стоит ровно. Под именем — строка о том, что
 * именно снимали: без неё список названий ничего не доказывает.
 */

import type { LocaleString } from '@/content/types';
import { localizedString } from '@/lib/i18n/localize';
import type { Locale } from '@/lib/site';

type Props = {
  clients: { name: string; note?: LocaleString }[];
  locale: Locale;
  label: string;
};

export function ClientStrip({ clients, locale, label }: Props) {
  /*
   * Два названия — это не полоса доверия, а признание, что показать нечего.
   * Лучше не показывать блок вовсе, чем показывать его пустым наполовину.
   */
  if (clients.length < 3) return null;

  return (
    <section className="bg-ink-raised">
      <div className="container-content py-10 lg:py-14">
        <h2 className="label m-0 text-bone-faint">{label}</h2>
        {/*
         * Сетка равных колонок, а не свободный ряд.
         *
         * Свободный ряд разваливается на первом же несоответствии: у одного
         * клиента подписано, что снимали, у другого ещё нет, длина названий
         * разная — и строка идёт уступами. Колонки одинаковой ширины держат
         * имена по общей вертикали, а подпись под именем становится
         * необязательной: её отсутствие не сдвигает соседей.
         *
         * По шесть в ряд на широком экране — столько же, сколько в обычной
         * стене логотипов, и ровно столько, чтобы длинное название переносилось
         * внутри своей колонки, а не выталкивало следующее.
         */}
        <ul className="m-0 mt-8 grid list-none grid-cols-2 gap-x-6 gap-y-8 p-0 sm:grid-cols-3 lg:grid-cols-6 lg:gap-x-8">
          {clients.map((client) => {
            const note = localizedString(client.note, locale);
            return (
              <li key={client.name}>
                <p className="m-0 text-lead leading-tight text-bone">{client.name}</p>
                {note ? <p className="label mt-2 text-bone-faint">{note}</p> : null}
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
