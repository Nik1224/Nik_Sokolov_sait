/**
 * Полные серии съёмок (ТЗ §5.2).
 *
 * Карточка ведёт на внешнюю онлайн-галерею, поэтому это ссылка, а не переход
 * внутри сайта: об уходе на другой сервис человек должен знать заранее.
 *
 * Обложка не обязательна. Приписывать кадр конкретной паре без подтверждения
 * нельзя, поэтому карточка без обложки остаётся текстовой — и выглядит
 * задуманной, а не сломанной.
 *
 * Рамки вокруг кадра нет: она всегда уменьшает фотографию, а девять
 * одинаковых «Смотреть галерею ↗» на экран — это девять призывов, из которых
 * не работает ни один. Что ссылка внешняя, сказано в лиде страницы и в
 * подписи для озвучки; глазами это видеть девять раз незачем. Рамка остаётся
 * только у карточки без обложки: там ей больше не за что держаться.
 */

import type { Album } from '@/content/types';
import { PictureFrame } from '@/components/media/Picture';
import type { Dictionary } from '@/lib/i18n/dictionaries';
import { localizedString } from '@/lib/i18n/localize';
import type { Locale } from '@/lib/site';

type Props = {
  albums: Album[];
  locale: Locale;
  dict: Dictionary;
};

export function AlbumGrid({ albums, locale, dict }: Props) {
  return (
    <ul data-reveal-stagger className="m-0 grid list-none gap-6 p-0 sm:grid-cols-2 lg:grid-cols-3">
      {albums.map((album, index) => {
        const title = localizedString(album.title, locale);
        const place = localizedString(album.location, locale);
        const year = album.date ? new Date(album.date).getFullYear() : null;
        const meta = [year, place].filter(Boolean).join(' · ');
        const cover = album.cover?.type === 'image' ? album.cover : null;

        return (
          <li key={album._id} className="group flex">
            <a
              href={album.url}
              target="_blank"
              rel="noopener noreferrer"
              // Куда ведёт ссылка, слышно и в озвучке: имя пары плюс оговорка.
              aria-label={`${title} — ${dict.albums.openGallery} (${dict.albums.externalHint})`}
              className={`flex flex-1 flex-col ${
                cover ? '' : 'border border-line p-6 transition-colors hover:border-line-strong lg:p-8'
              }`}
            >
              {cover ? (
                <PictureFrame
                  image={cover.image}
                  alt=""
                  ratio={3 / 2}
                  priority={index < 3}
                  sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                  className="frame-in"
                />
              ) : null}

              {/* Запас высоты нужен только текстовой карточке: с обложкой
                  она и так не выглядит обрубком. */}
              <div className={`flex flex-1 flex-col ${cover ? 'pt-4' : 'min-h-44'}`}>
                <span className="flex items-baseline justify-between gap-4">
                  <span className="text-h3 text-bone transition-colors group-hover:text-accent">
                    {title}
                  </span>
                  {/*
                    Стрелка появляется при наведении: сказать «внешняя ссылка»
                    нужно один раз тому, кто уже выбрал карточку, а не всем
                    девяти сразу.
                  */}
                  <span
                    aria-hidden="true"
                    className="label shrink-0 text-accent opacity-0 transition-opacity duration-[var(--duration-fast)] group-hover:opacity-100 group-focus-visible:opacity-100"
                  >
                    ↗
                  </span>
                </span>
                {meta ? <p className="label m-0 mt-2 text-bone-faint">{meta}</p> : null}
                {cover ? null : (
                  <p aria-hidden="true" className="label mt-auto pt-8 text-bone-dim">
                    {dict.albums.openGallery} ↗
                  </p>
                )}
              </div>
            </a>
          </li>
        );
      })}
    </ul>
  );
}
