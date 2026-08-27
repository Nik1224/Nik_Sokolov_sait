/**
 * Изображение с адаптивным srcset (ТЗ §10).
 *
 * width/height проставляются всегда — браузер резервирует место до загрузки,
 * поэтому вёрстка не «прыгает» (§17). Пустой alt означает декоративное
 * изображение и корректно пропускается ассистивными технологиями (§11).
 */

import type { ImageRef } from '@/content/types';
import { imageSrc, imageSrcSet, objectPosition } from '@/lib/media';

type PictureProps = {
  image: ImageRef;
  alt: string;
  sizes: string;
  /** Только для изображения в первом экране: грузим сразу, без lazy. */
  priority?: boolean;
  className?: string;
};

export function Picture({ image, alt, sizes, priority = false, className }: PictureProps) {
  return (
    <img
      src={imageSrc(image, 1440)}
      srcSet={imageSrcSet(image)}
      sizes={sizes}
      alt={alt}
      width={image.width || undefined}
      height={image.height || undefined}
      loading={priority ? 'eager' : 'lazy'}
      fetchPriority={priority ? 'high' : 'auto'}
      decoding={priority ? 'sync' : 'async'}
      className={className}
      style={{ objectPosition: objectPosition(image) }}
    />
  );
}

type FrameProps = PictureProps & {
  /** Соотношение сторон рамки, например 3 / 2. */
  ratio?: number;
  frameClassName?: string;
};

/** Изображение в рамке фиксированного соотношения — сетка карточек не рвётся. */
export function PictureFrame({ ratio = 3 / 2, frameClassName = '', ...props }: FrameProps) {
  return (
    <div
      className={`relative overflow-hidden bg-ink-raised ${frameClassName}`}
      style={{ aspectRatio: String(ratio) }}
    >
      <Picture {...props} className={`absolute inset-0 h-full w-full object-cover ${props.className ?? ''}`} />
    </div>
  );
}
