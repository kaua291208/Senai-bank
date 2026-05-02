import type { Metadata } from 'next';
import { Syne } from 'next/font/google';
import MuiProvider from '@/lib/MuiProvider';
import { AuthProvider } from '@/contexts/AuthContext';
import './globals.css';

const syne = Syne({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-syne',
});

export const metadata: Metadata = {
  title: 'Carteira Digital',
  description: 'Sua carteira bancária digital',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className={syne.variable}>
      <body>
        <MuiProvider>
          <AuthProvider>
            {children}
          </AuthProvider>
        </MuiProvider>
      </body>
    </html>
  );
}
