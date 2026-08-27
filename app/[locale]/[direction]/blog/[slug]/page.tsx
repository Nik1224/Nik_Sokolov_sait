/** Страница записи журнала (ТЗ §5.7, §14.5). */

import type { Metadata } from 'next';
import { BlogDetailRoute, blogDetailMetadata } from '@/components/templates/blogRoutes';
import { DIRECTIONS } from '@/lib/site';
import { blogStaticParams } from '@/components/templates/blogRoutes';

type Props = { params: Promise<{ locale: string; direction: string; slug: string }> };

export async function generateStaticParams() {
  // Одна запись может быть опубликована сразу в нескольких ветках (§5.7).
  const perDirection = await Promise.all(DIRECTIONS.map((direction) => blogStaticParams(direction)));
  return perDirection.flat();
}

export function generateMetadata({ params }: Props): Promise<Metadata> {
  return blogDetailMetadata(params);
}

export default function Page({ params }: Props) {
  return <BlogDetailRoute params={params} />;
}
