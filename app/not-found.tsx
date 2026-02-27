import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center py-20">
      <h1 className="text-4xl font-bold">404</h1>
      <p className="mt-4 text-[var(--muted-foreground)]">Page not found.</p>
      <Link
        href="/"
        className="mt-6 rounded-lg bg-[var(--primary)] px-4 py-2 text-sm font-medium text-[var(--primary-foreground)] transition-opacity hover:opacity-90"
      >
        Go Home
      </Link>
    </div>
  );
}
