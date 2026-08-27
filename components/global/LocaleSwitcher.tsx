'use client';

/**
 * Переключатель языка (ТЗ §4, §15.1).
 *
 * Открывает ЭКВИВАЛЕНТ текущей страницы, а не Home: пользователя нельзя
 * сбрасывать в начало ветки. Query и якорь сохраняются.
 *
 * Чтение query вынесено под Suspense: без этого страница целиком перестаёт
 * генерироваться статически, хотя переключателю query нужен лишь как довесок
 * к адресу.
 */

import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import { track } from '@/lib/analytics';
import type { Dictionary } from '@/lib/i18n/dictionaries';
import { equivalentUrl } from '@/lib/routing';
import { LOCALES, type Locale } from '@/lib/site';

type Props = { locale: Locale; dict: Dictionary; className?: string };

function Switcher({ locale, dict, className = '', search }: Props & { search: string }) {
  const pathname = usePathname();
  const router = useRouter();

  function go(target: Locale, url: string) {
    return (event: React.MouseEvent<HTMLAnchorElement>) => {
      track('locale_switch', { from: locale, to: target });
      // Якорь известен только в браузере, поэтому доклеиваем его при переходе.
      const hash = window.location.hash;
      if (hash) {
        event.preventDefault();
        router.push(url + hash);
      }
    };
  }

  return (
    <div className={`flex items-center gap-1 ${className}`} aria-label={dict.common.language}>
      {LOCALES.map((item, index) => {
        const isCurrent = item === locale;
        const url = equivalentUrl(pathname, item, search);

        return (
          <span key={item} className="flex items-center gap-1">
            {index > 0 ? (
              <span aria-hidden="true" className="text-bone-faint">
                /
              </span>
            ) : null}
            {isCurrent ? (
              <span aria-current="true" className="label px-1 text-bone">
                <span className="sr-only">{dict.common.language}: </span>
                {item.toUpperCase()}
              </span>
            ) : (
              <Link
                href={url}
                hrefLang={item}
                onClick={go(item, url)}
                className="label px-1 text-bone-faint transition-colors hover:text-bone"
              >
                {item.toUpperCase()}
              </Link>
            )}
          </span>
        );
      })}
    </div>
  );
}

function SwitcherWithSearch(props: Props) {
  const search = useSearchParams().toString();
  return <Switcher {...props} search={search} />;
}

export function LocaleSwitcher(props: Props) {
  // Во время предрендера query неизвестен — переключатель работает и без него.
  return (
    <Suspense fallback={<Switcher {...props} search="" />}>
      <SwitcherWithSearch {...props} />
    </Suspense>
  );
}
