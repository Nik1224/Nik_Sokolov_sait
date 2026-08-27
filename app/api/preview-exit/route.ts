/** Выход из режима предпросмотра. */

import { draftMode } from 'next/headers';
import { redirect } from 'next/navigation';
import type { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  const target = request.nextUrl.searchParams.get('path') ?? '/';
  (await draftMode()).disable();
  redirect(target.startsWith('/') ? target : '/');
}
