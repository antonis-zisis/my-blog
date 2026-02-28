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
      <article className="rounded-lg border border-(--border) p-6 transition-colors hover:bg-(--muted)">
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
        <h2 className="text-xl font-semibold text-(--primary)">{title}</h2>
        <p className="mt-2 text-(--muted-foreground)">{excerpt}</p>
        <div className="mt-3 flex items-center gap-2 text-sm text-(--muted-foreground)">
          <time>{formatDate(createdAt)}</time>
          <span>·</span>
          <span>{readingTime} min read</span>
        </div>
      </article>
    </Link>
  );
}
