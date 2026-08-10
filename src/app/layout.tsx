import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: '共修功德 - 往生超度功德回向',
  description:
    '以此共修功德，回向法界一切亡者、堕胎婴灵及旁生众生，祈愿往生净土，离苦得乐。',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-CN">
      <body className="min-h-screen bg-[#faf8f5] text-[#2c2c2c] antialiased">
        {children}
      </body>
    </html>
  );
}
