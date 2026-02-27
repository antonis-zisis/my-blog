"use client";

export default function Error({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-20">
      <h1 className="text-2xl font-bold">Something went wrong</h1>
      <p className="mt-2 text-[var(--muted-foreground)]">
        An unexpected error occurred.
      </p>
      <button
        onClick={reset}
        className="mt-6 rounded-lg bg-[var(--primary)] px-4 py-2 text-sm font-medium text-[var(--primary-foreground)] transition-opacity hover:opacity-90"
      >
        Try Again
      </button>
    </div>
  );
}
