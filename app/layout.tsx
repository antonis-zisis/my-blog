import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { ThemeProvider } from 'next-themes';
import type { ReactNode } from 'react';
import { AuthProvider } from '@/lib/auth-context';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import FirebaseAnalytics from '@/components/FirebaseAnalytics';
import UmamiAnalytics from '@/components/UmamiAnalytics';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
});

export const metadata: Metadata = {
  metadataBase: new URL('https://blog.antoniszisis.com'),
  title: 'Blog by Antonis Zisis',
  description: 'Antonis Zisis personal blog.',
  openGraph: {
    siteName: 'Blog by Antonis Zisis',
    locale: 'en_US',
    type: 'website',
  },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <AuthProvider>
            <Navbar />
            <main className="mx-auto max-w-3xl px-4 py-8">{children}</main>
            <Footer />

            <FirebaseAnalytics />
            <UmamiAnalytics />
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
