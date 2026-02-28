'use client';

import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import ThemeToggle from './ThemeToggle';
import { PenSquare } from 'lucide-react';

export default function Navbar() {
  const { isAdmin } = useAuth();

  return (
    <header className="shadow">
      <nav className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4">
        <Link href="/" className="text-xl font-bold text-(--primary)">
          Blog by Antonis Zisis
        </Link>

        <div className="flex items-center gap-2">
          {isAdmin && (
            <Link
              href="/admin"
              className="flex items-center gap-1.5 rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-(--muted)"
            >
              <PenSquare size={16} />
              Admin
            </Link>
          )}

          <ThemeToggle />
        </div>
      </nav>
    </header>
  );
}
