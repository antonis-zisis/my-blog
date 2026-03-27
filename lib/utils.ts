import slugifyLib from 'slugify';
import { format } from 'date-fns';

export function generateSlug(title: string): string {
  return slugifyLib(title, { lower: true, strict: true });
}

export function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return format(d, 'd MMMM, yyyy');
}

export function readingTime(html: string): number {
  const text = html.replace(/<[^>]+>/g, ' ');
  const words = text.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 200));
}

export function toCloudinaryOGUrl(url: string): string {
  return url.replace(
    '/image/upload/',
    '/image/upload/w_1200,h_630,c_fill,q_100,f_png/'
  );
}

export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) {
    return text;
  }
  return text.slice(0, maxLength).trimEnd() + '…';
}
