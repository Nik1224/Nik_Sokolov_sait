import { defineConfig, devices } from '@playwright/test';

/**
 * E2E и проверка доступности прогоняются по production-сборке: именно её
 * увидит пользователь, и именно в ней работают статическая генерация и
 * заголовки кэширования.
 */
export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  reporter: process.env.CI ? 'github' : [['list']],
  use: { baseURL: 'http://127.0.0.1:3100', trace: 'on-first-retry' },
  projects: [
    { name: 'desktop', use: { ...devices['Desktop Chrome'], viewport: { width: 1440, height: 900 } } },
    { name: 'mobile', use: { ...devices['Pixel 7'] } },
  ],
  webServer: {
    command: 'npm run build && npx next start --port 3100',
    url: 'http://127.0.0.1:3100/ru',
    reuseExistingServer: !process.env.CI,
    timeout: 240_000,
    // Путь заявки проверяется целиком, но письма не уходят: иначе каждый
    // прогон тестов слал бы владельцу проверочные заявки.
    env: { CONTACT_DRY_RUN: '1', CONTACT_RECIPIENT: 'dry-run@example.test' },
  },
});
