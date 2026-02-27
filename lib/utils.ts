import slugifyLib from 'slugify';
import { format } from 'date-fns';

export function generateSlug(title: string): string {
  return slugifyLib(title, { lower: true, strict: true });
}

export function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return format(d, 'MMMM d, yyyy');
}

export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength).trimEnd() + '…';
}
