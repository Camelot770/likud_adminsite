import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Ликуд RU - Панель управления',
  description: 'Административная панель управления платформой Ликуд на русском',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ru">
      <body className="bg-gray-50 text-gray-900 antialiased">{children}</body>
    </html>
  );
}
