/** Листинг работ ветки private (ТЗ §3). Логика — в общем обработчике. */

import type { Metadata } from 'next';
import { sectionStaticParams } from '@/lib/guard';
import { ProjectListingRoute, projectListingMetadata } from '@/components/templates/projectRoutes';

type Props = {
  params: Promise<{ locale: string; direction: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export function generateStaticParams() {
  return sectionStaticParams('portfolio');
}

export function generateMetadata({ params }: Props): Promise<Metadata> {
  return projectListingMetadata(params, 'portfolio');
}

export default function Page({ params, searchParams }: Props) {
  return <ProjectListingRoute params={params} searchParams={searchParams} section="portfolio" />;
}
