import Link from 'next/link';
import Image from 'next/image';
import { formatDate } from '@/lib/utils';

interface PostCardProps {
  slug: string;
  title: string;
  excerpt: string;
  createdAt: string;
  coverImage?: string | null;
}

export default function PostCard({
  slug,
  title,
  excerpt,
  createdAt,
  coverImage,
}: PostCardProps) {
  return (
    <Link href={`/posts/${slug}`} className="group block">
      <article className="rounded-lg border border-[var(--border)] p-6 transition-colors hover:bg-[var(--muted)]">
        {coverImage && (
          <Image
            src={coverImage}
            alt={title}
            width={640}
            height={192}
            unoptimized
            className="mb-4 h-48 w-full rounded-md object-cover"
          />
        )}
        <h2 className="text-xl font-semibold transition-colors group-hover:text-[var(--primary)]">
          {title}
        </h2>
        <p className="mt-2 text-[var(--muted-foreground)]">{excerpt}</p>
        <time className="mt-3 block text-sm text-[var(--muted-foreground)]">
          {formatDate(createdAt)}
        </time>
      </article>
    </Link>
  );
}
