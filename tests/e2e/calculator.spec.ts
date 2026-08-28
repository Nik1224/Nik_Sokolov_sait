/**
 * Калькулятор стоимости (ТЗ §5.8).
 * Арифметика проверена unit-тестами; здесь — что интерфейс её не искажает.
 */

import { expect, test } from '@playwright/test';

async function openCalculator(page: import('@playwright/test').Page) {
  await page.goto('/ru/private/pricing');
  const slider = page.locator('#calc-hours');
  await expect(slider).toBeVisible();
  const panel = slider
    .locator('xpath=ancestor::div[contains(@class,"grid")][1]')
    .locator('[role="status"]');
  return { slider, panel };
}

test('свадьба: десять часов фото стоят 110 000, а не 120 000', async ({ page }) => {
  const { slider, panel } = await openCalculator(page);

  await page.getByText('Свадебная', { exact: true }).click();
  await slider.fill('10');

  await expect(panel).toContainText('110 000');
  // Ставка последнего часа показывает, что цена снижается.
  await expect(panel).toContainText('9 500');
});

test('фото и видео вместе дают скидку 10%', async ({ page }) => {
  const { slider, panel } = await openCalculator(page);

  await page.getByText('Семейная', { exact: true }).click();
  await slider.fill('5');

  // Только фото — скидки нет.
  await expect(panel).toContainText('60 000');
  await expect(panel).not.toContainText('Скидка');

  await page.getByText('Видео', { exact: true }).click();
  await expect(panel).toContainText('Скидка');
  await expect(panel).toContainText('13 500');
  await expect(panel).toContainText('121 500');
});

test('обычная съёмка считается по ровной ставке', async ({ page }) => {
  const { slider, panel } = await openCalculator(page);

  await page.getByText('Портрет', { exact: true }).click();
  await slider.fill('3');

  // 3 × 12 000 без снижения: оно только для свадеб.
  await expect(panel).toContainText('36 000');
  await expect(panel).not.toContainText('Последний час');
});

test('смена типа подтягивает часы в допустимые границы', async ({ page }) => {
  const { slider } = await openCalculator(page);

  await page.getByText('Свадебная', { exact: true }).click();
  await slider.fill('12');
  await expect(slider).toHaveValue('12');

  // У семейной максимум пять часов — значение не должно остаться недопустимым.
  await page.getByText('Семейная', { exact: true }).click();
  await expect(slider).toHaveValue('5');

  // И минимум два: за меньшее время результата не будет.
  await expect(slider).toHaveAttribute('min', '2');
});

test('без выбранного формата сумма не показывается', async ({ page }) => {
  const { panel } = await openCalculator(page);

  await page.getByText('Фото', { exact: true }).click();
  await expect(panel).toContainText('Выберите фото, видео или оба формата');
});

test('подсказка объясняет выбор часов', async ({ page }) => {
  await page.goto('/ru/private/pricing');
  // Именно подсказка калькулятора: про ставки говорится и в списке пакетов.
  const calculator = page.locator('#calc-hours').locator('xpath=ancestor::div[contains(@class,"grid")][1]');

  await page.getByText('Семейная', { exact: true }).click();
  await expect(calculator.getByText(/Минимум два часа/)).toBeVisible();

  await page.getByText('Свадебная', { exact: true }).click();
  await expect(calculator.getByText(/С четвёртого часа час стоит дешевле/)).toBeVisible();
});

test('калькулятор доступен с клавиатуры', async ({ page }) => {
  const { slider } = await openCalculator(page);

  await page.getByText('Портрет', { exact: true }).click();
  // Смена типа подтягивает часы к максимуму — с него вправо двигаться некуда.
  await slider.fill('2');
  await slider.focus();

  await page.keyboard.press('ArrowRight');
  await expect(slider).toHaveValue('3');
  await page.keyboard.press('ArrowLeft');
  await expect(slider).toHaveValue('2');
});

test('события считаются по ровной ставке и начинаются с двух часов', async ({ page }) => {
  const { slider, panel } = await openCalculator(page);

  await page.getByText('События', { exact: true }).click();

  // Час на день рождения смысла не имеет — ползунок ниже двух не опускается.
  await expect(slider).toHaveAttribute('min', '2');

  await slider.fill('4');
  // 4 × 12 000: снижение ставки описано только для свадеб.
  await expect(panel).toContainText('48 000');
  await expect(panel).not.toContainText('Последний час');
});

test('подсказка у событий перечисляет, что сюда входит', async ({ page }) => {
  await page.goto('/ru/private/pricing');
  await page.getByText('События', { exact: true }).click();
  await expect(page.getByText(/Дни рождения, юбилеи/)).toBeVisible();
});

test('пакеты разложены по группам и раскрываются на месте', async ({ page }) => {
  await page.goto('/ru/private/pricing');

  const wedding = page.getByRole('button', { name: /^Свадьба/ });
  const portrait = page.getByRole('button', { name: /Портрет и семья/ });

  // Свёрнуто по умолчанию: страница остаётся обозримой.
  await expect(wedding).toHaveAttribute('aria-expanded', 'false');
  await expect(page.getByRole('heading', { name: 'Свадьба, до 8 часов' })).toHaveCount(0);

  const before = page.url();
  await wedding.click();

  await expect(wedding).toHaveAttribute('aria-expanded', 'true');
  await expect(page.getByRole('heading', { name: 'Свадьба, до 8 часов' })).toBeVisible();
  // Раскрытие происходит на месте, без перехода.
  expect(page.url()).toBe(before);

  // Группы независимы: открытие одной не закрывает другую.
  await portrait.click();
  await expect(wedding).toHaveAttribute('aria-expanded', 'true');
  await expect(page.getByRole('heading', { name: 'Семейный портрет' })).toBeVisible();

  await wedding.click();
  await expect(page.getByRole('heading', { name: 'Свадьба, до 8 часов' })).toHaveCount(0);
  await expect(page.getByRole('heading', { name: 'Семейный портрет' })).toBeVisible();
});

test('цена пакета совпадает с калькулятором на той же странице', async ({ page }) => {
  const { slider, panel } = await openCalculator(page);

  await page.getByText('Свадебная', { exact: true }).click();
  await slider.fill('8');
  await expect(panel).toContainText('90 600');

  // Ровно та же сумма должна стоять в пакете на восемь часов.
  await page.getByRole('button', { name: /^Свадьба/ }).click();
  const card = page
    .getByRole('heading', { name: 'Свадьба, до 8 часов' })
    .locator('xpath=ancestor::li[1]');
  await expect(card).toContainText('90 600');
});
