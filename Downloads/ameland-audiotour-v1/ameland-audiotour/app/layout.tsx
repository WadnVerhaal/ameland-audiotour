import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Ameland Audiotour',
  description: 'Ontdek Ameland met verhalen in je oor.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="nl">
      <body className="min-h-screen bg-stone-50 text-stone-900 antialiased">{children}</body>
    </html>
  );
}
