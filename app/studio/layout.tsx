/**
 * Отдельный корневой layout для Studio: у редактора собственная разметка
 * страницы и свои стили, не пересекающиеся с сайтом.
 */

export const metadata = {
  title: 'Nikita Sokolov — контент',
  robots: { index: false, follow: false },
};

export default function StudioLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru">
      <body style={{ margin: 0 }}>{children}</body>
    </html>
  );
}
