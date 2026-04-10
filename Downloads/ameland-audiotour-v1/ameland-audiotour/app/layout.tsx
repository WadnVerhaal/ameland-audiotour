import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Wad’n Verhaal App',
  description: 'Ontdek Ameland met verhalen in je oor.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="nl">
      <body className="min-h-screen bg-app text-app antialiased">
        {children}
      </body>
    </html>
  );
}