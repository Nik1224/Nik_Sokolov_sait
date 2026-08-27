/**
 * Вход в режим предпросмотра черновиков (ТЗ §8.1).
 *
 * Черновики видны только по секретной ссылке и закрыты от индексации:
 * robots.txt запрещает /api/, а страницы предпросмотра отдаются без кэша.
 */

import { draftMode } from 'next/headers';
import { redirect } from 'next/navigation';
import type { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  const secret = request.nextUrl.searchParams.get('secret');
  const target = request.nextUrl.searchParams.get('path') ?? '/';

  const expected = process.env.SANITY_PREVIEW_SECRET;
  if (!expected || secret !== expected) {
    return new Response('Invalid preview secret', { status: 401 });
  }

  // Открытый редирект недопустим: уходим только внутрь сайта.
  if (!target.startsWith('/')) {
    return new Response('Invalid path', { status: 400 });
  }

  (await draftMode()).enable();
  redirect(target);
}
