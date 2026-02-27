import type { Metadata } from 'next';
import { ThemeProvider } from 'next-themes';
import { AuthProvider } from '@/lib/auth-context';
import Navbar from '@/components/Navbar';
import './globals.css';

export const metadata: Metadata = {
  title: 'My Blog',
  description: 'A personal blog',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <AuthProvider>
            <Navbar />
            <main className="mx-auto max-w-3xl px-4 py-8">{children}</main>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
