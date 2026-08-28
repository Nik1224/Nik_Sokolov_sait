/**
 * Полные серии съёмок (ТЗ §5.2).
 *
 * Карточка ведёт на внешнюю онлайн-галерею, поэтому это ссылка, а не переход
 * внутри сайта: об уходе на другой сервис человек должен знать заранее.
 *
 * Обложка не обязательна. Приписывать кадр конкретной паре без подтверждения
 * нельзя, поэтому карточка без обложки остаётся текстовой — и выглядит
 * задуманной, а не сломанной.
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
    <ul className="m-0 grid list-none gap-6 p-0 sm:grid-cols-2 lg:grid-cols-3">
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
              className="flex flex-1 flex-col border border-line transition-colors hover:border-line-strong hover:bg-ink-raised"
            >
              {cover ? (
                <PictureFrame
                  image={cover.image}
                  alt=""
                  ratio={3 / 2}
                  priority={index < 3}
                  sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                  className="transition-transform duration-[var(--duration-slow)] ease-[var(--ease-out-soft)] group-hover:scale-[1.02]"
                />
              ) : null}

              {/* Запас высоты нужен только текстовой карточке: с обложкой
                  она и так не выглядит обрубком. */}
              <div className={`flex flex-1 flex-col p-6 lg:p-8 ${cover ? '' : 'min-h-44'}`}>
                {meta ? <p className="label m-0 text-bone-faint">{meta}</p> : null}
                <p className="text-h3 m-0 mt-3 text-bone transition-colors group-hover:text-accent">
                  {title}
                </p>
                <p aria-hidden="true" className={`label mt-auto text-bone-dim ${cover ? 'pt-6' : 'pt-8'}`}>
                  {dict.albums.openGallery} ↗
                </p>
              </div>
            </a>
          </li>
        );
      })}
    </ul>
  );
}
