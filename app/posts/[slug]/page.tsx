import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
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

  const baseUrl = 'https://deploy-preview-2--az-my-blog.netlify.app';
  const data = doc.data()!;
  const publishedTime = data.createdAt?.toDate().toISOString();
  const ogImages = data.coverImage
    ? [{ url: data.coverImage, width: 1200, height: 630 }]
    : [];

  return {
    title: `${data.title} | Blog by Antonis Zisis`,
    description: data.excerpt,
    alternates: {
      canonical: `${baseUrl}/posts/${slug}`,
    },
    openGraph: {
      title: data.title,
      description: data.excerpt,
      type: 'article',
      publishedTime,
      url: `${baseUrl}/posts/${slug}`,
      images: ogImages,
    },
    twitter: {
      card: 'summary_large_image',
      title: data.title,
      description: data.excerpt,
      images: data.coverImage ? [data.coverImage] : [],
    },
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
      <Link
        href="/"
        className="mb-8 inline-flex items-center gap-1 text-sm text-(--muted-foreground) transition-colors hover:text-(--primary)"
      >
        <ArrowLeft size={16} />
        Back to posts
      </Link>

      <header className="mb-8">
        <h1 className="font-serif text-2xl font-bold text-(--primary)">
          {data.title}
        </h1>

        <div className="mt-2 flex items-center gap-2 font-serif text-sm text-(--muted-foreground)">
          <time>{formatDate(createdAt)}</time>
          <span>·</span>
          <span>{mins} min read</span>
        </div>
      </header>

      {data.coverImage && (
        <Image
          src={data.coverImage}
          alt={data.title}
          width={1200}
          height={630}
          unoptimized
          loading="eager"
          className="mb-8 w-full rounded"
        />
      )}

      <PostContent content={data.content} />
    </article>
  );
}
