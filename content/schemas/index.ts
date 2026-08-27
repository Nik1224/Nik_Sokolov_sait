/** Регистрация всех типов схемы для Sanity Studio. */

import { localeBlocks, localeString, localeText } from './objects/locale';
import { mediaAsset } from './objects/media';
import {
  contactChannel,
  credit,
  faqItem,
  linkItem,
  processStep,
  seoFields,
  socialLink,
} from './objects/shared';
import {
  article,
  articleType,
  category,
  direction,
  globalSettings,
  page,
  person,
  pricingEntry,
  project,
  testimonial,
  redirect,
  service,
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
  processStep,
  faqItem,
  contactChannel,
  linkItem,
  socialLink,
  // документы
  globalSettings,
  direction,
  category,
  articleType,
  workFormat,
  person,
  project,
  service,
  article,
  pricingEntry,
  testimonial,
  page,
  redirect,
];
