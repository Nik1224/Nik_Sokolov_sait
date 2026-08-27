/**
 * Рендер текста из CMS (Portable Text).
 *
 * Медиа внутри текста проходит через тот же компонент, что и в галереях,
 * поэтому alt, подписи и размеры работают одинаково везде (ТЗ §10).
 */

import { PortableText, type PortableTextComponents } from '@portabletext/react';
import type { Blocks, MediaAsset } from '@/content/types';
import type { Dictionary } from '@/lib/i18n/dictionaries';
import { localizedString } from '@/lib/i18n/localize';
import type { Locale } from '@/lib/site';
import { Picture } from '../media/Picture';
import { VideoFacade } from '../media/VideoFacade';

type Props = { value: Blocks; locale: Locale; dict: Dictionary; className?: string };

function buildComponents(locale: Locale, dict: Dictionary): PortableTextComponents {
  return {
    block: {
      normal: ({ children }) => <p className="my-6 text-lead leading-relaxed text-bone-dim">{children}</p>,
      h2: ({ children }) => <h2 className="text-h2 mb-4 mt-14">{children}</h2>,
      h3: ({ children }) => <h3 className="text-h3 mb-3 mt-10">{children}</h3>,
      blockquote: ({ children }) => (
        <blockquote className="my-10 border-l-2 border-accent pl-6 text-h3 text-bone">
          {children}
        </blockquote>
      ),
    },
    list: {
      bullet: ({ children }) => <ul className="my-6 list-disc space-y-2 pl-6 text-bone-dim">{children}</ul>,
      number: ({ children }) => <ol className="my-6 list-decimal space-y-2 pl-6 text-bone-dim">{children}</ol>,
    },
    marks: {
      strong: ({ children }) => <strong className="font-semibold text-bone">{children}</strong>,
      link: ({ children, value }) => (
        <a
          href={value?.href}
          rel="noopener noreferrer"
          className="text-bone underline decoration-accent underline-offset-4"
        >
          {children}
        </a>
      ),
    },
    types: {
      mediaAsset: ({ value }: { value: MediaAsset }) => {
        if (value.type === 'video') {
          return (
            <div className="my-10">
              <VideoFacade media={value} locale={locale} dict={dict} sizes="(min-width: 768px) 42rem, 100vw" />
            </div>
          );
        }
        const caption = localizedString(value.caption, locale);
        return (
          <figure className="my-10">
            <Picture
              image={value.image}
              alt={localizedString(value.alt, locale)}
              sizes="(min-width: 768px) 42rem, 100vw"
              className="w-full"
            />
            {caption ? <figcaption className="mt-3 text-sm text-bone-faint">{caption}</figcaption> : null}
          </figure>
        );
      },
    },
  };
}

export function PortableBody({ value, locale, dict, className = '' }: Props) {
  if (!value || value.length === 0) return null;
  return (
    <div className={className}>
      <PortableText value={value} components={buildComponents(locale, dict)} />
    </div>
  );
}
