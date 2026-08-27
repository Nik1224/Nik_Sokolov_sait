/**
 * Sanity Studio, встроенная в приложение на /studio.
 *
 * Реквизиты проекта берутся из окружения. Пока они не заданы, маршрут /studio
 * показывает инструкцию по подключению вместо редактора.
 */

import { visionTool } from '@sanity/vision';
import { defineConfig } from 'sanity';
import { structureTool } from 'sanity/structure';
import { schemaTypes } from './content/schemas';
import { apiVersion, dataset, projectId } from './content/queries/sanity-client';

export default defineConfig({
  name: 'nikita-sokolov-studio',
  title: 'Nikita Sokolov — контент',
  basePath: '/studio',
  projectId: projectId || 'missing-project-id',
  dataset,
  schema: { types: schemaTypes },
  plugins: [structureTool(), visionTool({ defaultApiVersion: apiVersion })],
});
