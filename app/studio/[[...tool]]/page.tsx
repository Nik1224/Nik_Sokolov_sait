/**
 * Sanity Studio на /studio (ТЗ §8, §13).
 *
 * Пока реквизиты проекта не заданы, показываем инструкцию по подключению:
 * пустой редактор без бэкенда только сбивал бы с толку.
 */

import { isSanityConfigured } from '@/content/queries';
import { StudioClient } from './StudioClient';

export const dynamic = 'force-static';

export default function StudioPage() {
  if (!isSanityConfigured()) {
    return (
      <main
        style={{
          fontFamily: 'ui-sans-serif, system-ui, sans-serif',
          background: '#08080a',
          color: '#f2f0ec',
          minHeight: '100vh',
          padding: '4rem 1.5rem',
        }}
      >
        <div style={{ maxWidth: '42rem', margin: '0 auto' }}>
          <h1 style={{ fontSize: '1.75rem', margin: 0 }}>CMS ещё не подключена</h1>
          <p style={{ color: '#a3a09a', lineHeight: 1.6 }}>
            Сайт сейчас работает на демонстрационных данных из <code>content/seed</code>. Схемы
            контента и слой доступа к данным готовы — не хватает только проекта Sanity.
          </p>
          <ol style={{ color: '#a3a09a', lineHeight: 1.8 }}>
            <li>
              Создайте проект на <strong>sanity.io</strong> и получите <code>projectId</code>.
            </li>
            <li>
              Скопируйте <code>.env.example</code> в <code>.env.local</code> и заполните{' '}
              <code>NEXT_PUBLIC_SANITY_PROJECT_ID</code> и <code>NEXT_PUBLIC_SANITY_DATASET</code>.
            </li>
            <li>
              Перезапустите <code>npm run dev</code> — редактор откроется здесь, а сайт начнёт
              брать данные из CMS.
            </li>
          </ol>
        </div>
      </main>
    );
  }

  return <StudioClient />;
}
