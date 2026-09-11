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
  /*
   * Настоящий Chrome, а не встроенный Chromium.
   *
   * Петли на плитках и обложках закодированы H.264, а сборка Chromium из
   * открытых исходников этот кодек не умеет: у элемента `error.code === 4`, и
   * `play()` отклоняется с `NotSupportedError`. Проверки воспроизведения на
   * ней падают, ничего не проверив, — а те, что смотрят только на `paused`,
   * наоборот, проходят вхолостую.
   *
   * WebKit ниже трогать не нужно: H.264 он поддерживает сам.
   */
  projects: [
    {
      name: 'desktop',
      use: {
        ...devices['Desktop Chrome'],
        channel: 'chrome',
        viewport: { width: 1440, height: 900 },
      },
    },
    { name: 'mobile', use: { ...devices['Pixel 7'], channel: 'chrome' } },
    /*
     * Safari — отдельный движок, и ошибки у него свои: пустая прокрутка под
     * подвалом была видна только там. Гоняем в нём помеченные тесты, а не всё
     * подряд: полный прогон в двух движках стоит вдвое дороже.
     */
    { name: 'safari', use: { ...devices['iPhone 13'] }, grep: /@safari/ },
  ],
  webServer: {
    command: 'npm run build && npx next start --port 3100',
    url: 'http://127.0.0.1:3100/ru',
    reuseExistingServer: !process.env.CI,
    timeout: 240_000,
    // Путь заявки проверяется целиком, но письма не уходят: иначе каждый
    // прогон тестов слал бы владельцу проверочные заявки.
  },
});
