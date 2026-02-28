'use client';

import { useEffect } from 'react';
import { TriangleAlert } from 'lucide-react';

interface ConfirmModalProps {
  title: string;
  message: string;
  confirmLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmModal({
  title,
  message,
  confirmLabel = 'Delete',
  onConfirm,
  onCancel,
}: ConfirmModalProps) {
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onCancel();
      }
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [onCancel]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      onClick={onCancel}
    >
      <div
        className="w-full max-w-sm rounded-xl border border-(--border) bg-(--background) p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start gap-3">
          <TriangleAlert
            className="mt-0.5 shrink-0 text-(--destructive)"
            size={20}
          />
          <div>
            <h2 className="font-semibold">{title}</h2>
            <p className="mt-1 text-sm text-(--muted-foreground)">{message}</p>
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <button
            onClick={onCancel}
            className="cursor-pointer rounded-lg border border-(--border) px-4 py-2 text-sm font-medium transition-colors hover:bg-(--muted)"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="cursor-pointer rounded-lg bg-(--destructive) px-4 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90"
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
