/**
 * Фикстурный источник: работает, пока не подключён Sanity-проект.
 * Все записи помечены `isDemo` — см. content/seed.
 */

import * as seed from '../seed';
import type { ContentSource } from './source';

export const fixtureSource: ContentSource = {
  name: 'fixtures',
  async globalSettings() {
    return seed.globalSettings;
  },
  async directions() {
    return seed.directions;
  },
  async categories() {
    return seed.categories;
  },
  async albums() {
    return seed.albums;
  },
  async articleTypes() {
    return seed.articleTypes;
  },
  async workFormats() {
    return seed.workFormats;
  },
  async projects() {
    return seed.projects;
  },
  async articles() {
    return seed.articles;
  },
  async pricing() {
    return seed.pricingEntries;
  },
  async testimonials() {
    return seed.testimonials;
  },
  async pages() {
    return seed.pages;
  },
  async redirects() {
    return seed.redirects;
  },
};
