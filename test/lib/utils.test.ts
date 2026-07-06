import { describe, expect, it } from 'vitest';
import { formatDate, generateSlug, readingTime, truncate } from '@/lib/utils';

describe('generateSlug', () => {
  it('lowercases and joins words with hyphens', () => {
    expect(generateSlug('Hello World')).toBe('hello-world');
  });

  it('collapses repeated whitespace into a single hyphen', () => {
    expect(generateSlug('Hello   World')).toBe('hello-world');
  });

  it('strips punctuation (strict mode)', () => {
    expect(generateSlug('Hello, World!')).toBe('hello-world');
    expect(generateSlug("What's New in Next.js 16?")).toBe(
      'whats-new-in-nextjs-16'
    );
  });

  it('transliterates accented Latin characters', () => {
    expect(generateSlug('Café déjà vu')).toBe('cafe-deja-vu');
  });

  it('transliterates Greek characters instead of dropping them', () => {
    expect(generateSlug('Γιώργος Σεφέρης')).toBe('giwrgos-seferhs');
  });
});

describe('formatDate', () => {
  it('formats a Date as "d MMMM, yyyy"', () => {
    expect(formatDate(new Date(2026, 0, 15))).toBe('15 January, 2026');
  });

  it('accepts an ISO string', () => {
    expect(formatDate('2026-07-06T12:00:00')).toBe('6 July, 2026');
  });

  it('does not zero-pad single-digit days', () => {
    expect(formatDate(new Date(2026, 2, 3))).toBe('3 March, 2026');
  });
});

describe('readingTime', () => {
  it('returns at least 1 for empty HTML', () => {
    expect(readingTime('')).toBe(1);
  });

  it('returns at least 1 for whitespace-only HTML', () => {
    expect(readingTime('   \n\t  ')).toBe(1);
  });

  it('returns at least 1 for markup with no text', () => {
    expect(readingTime('<p></p><br /><div></div>')).toBe(1);
  });

  it('strips HTML tags before counting words', () => {
    const words = Array.from({ length: 400 }, () => 'word').join(' ');
    const html = `<p>${words}</p>`;

    expect(readingTime(html)).toBe(2);
  });

  it('does not glue words together when removing adjacent tags', () => {
    const words = Array.from({ length: 400 }, () => '<span>word</span>').join(
      ''
    );

    expect(readingTime(words)).toBe(2);
  });

  it('rounds to the nearest minute', () => {
    const words = Array.from({ length: 250 }, () => 'word').join(' ');

    expect(readingTime(words)).toBe(1);
  });
});

describe('truncate', () => {
  it('returns text shorter than maxLength unchanged', () => {
    expect(truncate('hello', 10)).toBe('hello');
  });

  it('returns text exactly at maxLength unchanged', () => {
    expect(truncate('hello', 5)).toBe('hello');
  });

  it('truncates and appends an ellipsis', () => {
    expect(truncate('hello world', 8)).toBe('hello wo…');
  });

  it('trims trailing whitespace before appending the ellipsis', () => {
    expect(truncate('hello world', 6)).toBe('hello…');
  });
});
