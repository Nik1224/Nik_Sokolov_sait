/** Листинг журнала. Коллекция общая, фильтр — по типу записи (ТЗ §5.7). */

import type { Metadata } from 'next';
import { sectionStaticParams } from '@/lib/guard';
import { BlogListingRoute, blogListingMetadata } from '@/components/templates/blogRoutes';

type Props = {
  params: Promise<{ locale: string; direction: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export function generateStaticParams() {
  return sectionStaticParams('blog');
}

export function generateMetadata({ params }: Props): Promise<Metadata> {
  return blogListingMetadata(params);
}

export default function Page({ params, searchParams }: Props) {
  return <BlogListingRoute params={params} searchParams={searchParams} />;
}
