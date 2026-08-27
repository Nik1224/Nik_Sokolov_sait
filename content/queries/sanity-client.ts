/**
 * Клиент Sanity. Единственное место, где известны реквизиты проекта.
 *
 * Черновики видны только в режиме предпросмотра и закрыты от индексации
 * (§8.1: предпросмотр черновика недоступен поисковым роботам).
 */

import { createClient, type SanityClient } from 'next-sanity';

export const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID ?? '';
export const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET ?? 'production';
export const apiVersion = process.env.NEXT_PUBLIC_SANITY_API_VERSION ?? '2024-10-01';

let publishedClient: SanityClient | null = null;
let draftsClient: SanityClient | null = null;

export function getPublishedClient(): SanityClient {
  publishedClient ??= createClient({
    projectId,
    dataset,
    apiVersion,
    useCdn: true,
    perspective: 'published',
    stega: false,
  });
  return publishedClient;
}

export function getDraftsClient(): SanityClient {
  draftsClient ??= createClient({
    projectId,
    dataset,
    apiVersion,
    useCdn: false,
    perspective: 'drafts',
    token: process.env.SANITY_API_READ_TOKEN,
    stega: false,
  });
  return draftsClient;
}

/**
 * Включён ли режим предпросмотра. `draftMode()` доступен только внутри
 * запроса; вне его (например, при сборке) считаем, что предпросмотра нет.
 */
export async function isPreviewEnabled(): Promise<boolean> {
  if (!process.env.SANITY_API_READ_TOKEN) return false;
  try {
    const { draftMode } = await import('next/headers');
    return (await draftMode()).isEnabled;
  } catch {
    return false;
  }
}

export async function getClient(): Promise<SanityClient> {
  return (await isPreviewEnabled()) ? getDraftsClient() : getPublishedClient();
}
