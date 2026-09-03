/** Регистрация всех типов схемы для Sanity Studio. */

import { localeBlocks, localeString, localeText } from './objects/locale';
import { mediaAsset } from './objects/media';
import {
  contactChannel,
  credit,
  linkItem,
  seoFields,
  socialLink,
  projectFigure,
} from './objects/shared';
import {
  article,
  articleType,
  album,
  category,
  direction,
  globalSettings,
  page,
  person,
  pricingEntry,
  project,
  testimonial,
  redirect,
  workFormat,
} from './documents';

export const schemaTypes = [
  // объекты
  localeString,
  localeText,
  localeBlocks,
  mediaAsset,
  seoFields,
  credit,
  contactChannel,
  linkItem,
  socialLink,
  projectFigure,
  // документы
  globalSettings,
  direction,
  album,
  category,
  articleType,
  workFormat,
  person,
  project,
  article,
  pricingEntry,
  testimonial,
  page,
  redirect,
];
