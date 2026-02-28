import { notFound } from 'next/navigation';
import Image from 'next/image';
import { adminDb } from '@/lib/firebase-admin';
import PostContent from '@/components/PostContent';
import { formatDate, readingTime } from '@/lib/utils';
import type { Metadata } from 'next';

export const dynamic = 'force-dynamic';
export const revalidate = 60;

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const doc = await adminDb.collection('posts').doc(slug).get();

  if (!doc.exists) {
    return { title: 'Post Not Found' };
  }

  const data = doc.data()!;
  return {
    title: `${data.title} | Blog by Antonis Zisis`,
    description: data.excerpt,
  };
}

export default async function PostPage({ params }: PageProps) {
  const { slug } = await params;
  const doc = await adminDb.collection('posts').doc(slug).get();

  if (!doc.exists || !doc.data()?.published) {
    notFound();
  }

  const data = doc.data()!;
  const createdAt = data.createdAt?.toDate().toISOString();
  const mins = readingTime(data.content ?? '');

  return (
    <article>
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-(--primary)">{data.title}</h1>
        <div className="mt-2 flex items-center gap-2 text-(--muted-foreground)">
          <time>{formatDate(createdAt)}</time>
          <span>·</span>
          <span>{mins} min read</span>
        </div>
      </header>

      {data.coverImage && (
        <Image
          src={data.coverImage}
          alt={data.title}
          width={768}
          height={256}
          unoptimized
          className="mb-8 h-64 w-full rounded-lg object-cover"
        />
      )}

      <PostContent content={data.content} />
    </article>
  );
}
