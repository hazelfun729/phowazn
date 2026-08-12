import type { Metadata } from 'next';
import { Noto_Serif_SC } from 'next/font/google';
import './globals.css';

const notoSerifSC = Noto_Serif_SC({
  subsets: ['latin'],
  weight: ['400', '600', '700'],
  display: 'swap',
  variable: '--font-noto-serif-sc',
});

export const metadata: Metadata = {
  title: 'PW影院助念名单',
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
      <body className={`${notoSerifSC.variable} min-h-screen bg-[#faf8f5] text-[#2c2c2c] antialiased`}>
        {children}
      </body>
    </html>
  );
}
