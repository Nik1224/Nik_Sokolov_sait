/** Страница работы ветки production (ТЗ §5.5, §14.4). Логика — в общем обработчике. */

import type { Metadata } from 'next';
import {
  ProjectDetailRoute,
  projectDetailMetadata,
  projectStaticParams,
} from '@/components/templates/projectRoutes';

type Props = { params: Promise<{ locale: string; direction: string; slug: string }> };

export function generateStaticParams() {
  return projectStaticParams('production');
}

export function generateMetadata({ params }: Props): Promise<Metadata> {
  return projectDetailMetadata(params, 'work');
}

export default function Page({ params }: Props) {
  return <ProjectDetailRoute params={params} section="work" />;
}
