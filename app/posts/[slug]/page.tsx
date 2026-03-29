import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import PostContent from '@/components/PostContent';
import { formatDate, readingTime } from '@/lib/utils';
import { toCloudinaryOGUrl } from '@/lib/cloudinary';
import { getPublishedPosts, getPost } from '@/lib/posts-repository';
import type { Metadata } from 'next';

export async function generateStaticParams() {
  const posts = await getPublishedPosts();
  return posts.map((post) => ({ slug: post.slug }));
}

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPost(slug);

  if (!post) {
    return { title: 'Post Not Found' };
  }

  const publishedTime = post.createdAt;
  const ogImages = post.coverImage
    ? [{ url: toCloudinaryOGUrl(post.coverImage), width: 1200, height: 630 }]
    : [];

  return {
    title: `${post.title} | Blog by Antonis Zisis`,
    description: post.excerpt,
    alternates: {
      canonical: `/posts/${slug}`,
    },
    openGraph: {
      title: post.title,
      description: post.excerpt,
      type: 'article',
      publishedTime,
      authors: ['https://blog.antoniszisis.com'],
      url: `/posts/${slug}`,
      images: ogImages,
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description: post.excerpt,
      images: post.coverImage ? [toCloudinaryOGUrl(post.coverImage)] : [],
    },
  };
}

export default async function PostPage({ params }: PageProps) {
  const { slug } = await params;
  const post = await getPost(slug);

  if (!post || !post.published) {
    notFound();
  }

  const mins = readingTime(post.content);

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
          {post.title}
        </h1>

        <div className="mt-2 flex items-center gap-2 font-serif text-sm text-(--muted-foreground)">
          <time>{formatDate(post.createdAt)}</time>
          <span>·</span>
          <span>{mins} min read</span>
        </div>
      </header>

      {post.coverImage && (
        <Image
          src={post.coverImage}
          alt={post.title}
          width={1200}
          height={630}
          unoptimized
          loading="eager"
          className="mb-8 w-full rounded"
        />
      )}

      <PostContent content={post.content} />
    </article>
  );
}
