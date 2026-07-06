import Link from 'next/link';
import Image from 'next/image';
import { formatDate } from '@/lib/utils';

interface PostCardProps {
  slug: string;
  title: string;
  excerpt: string;
  createdAt: string;
  coverImage?: string | null;
  readingTime: number;
}

export default function PostCard({
  slug,
  title,
  excerpt,
  createdAt,
  coverImage,
  readingTime,
}: PostCardProps) {
  return (
    <Link href={`/posts/${slug}`} className="group block">
      <article className="rounded border border-(--border) px-4 py-3 transition-colors hover:bg-(--muted)">
        {coverImage && (
          <Image
            src={coverImage}
            alt={title}
            width={768}
            height={256}
            unoptimized
            loading="eager"
            className="mb-3 w-full rounded"
          />
        )}

        <h2 className="font-serif text-xl font-semibold text-(--primary)">
          {title}
        </h2>

        <p className="mt-1 font-serif text-base text-(--foreground)">
          {excerpt}
        </p>

        <div className="mt-4 flex items-center justify-end gap-2 text-xs text-(--muted-foreground)">
          <time>{formatDate(createdAt)}</time>
          <span>·</span>
          <span>{readingTime} min read</span>
        </div>
      </article>
    </Link>
  );
}
