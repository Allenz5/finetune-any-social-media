import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Finetune Social Media',
  description: 'Shape your social feed with an agent.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
