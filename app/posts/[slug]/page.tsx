import { notFound } from "next/navigation";
import { adminDb } from "@/lib/firebase-admin";
import PostContent from "@/components/PostContent";
import { formatDate } from "@/lib/utils";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";
export const revalidate = 60;

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const doc = await adminDb.collection("posts").doc(slug).get();

  if (!doc.exists) return { title: "Post Not Found" };

  const data = doc.data()!;
  return {
    title: `${data.title} | My Blog`,
    description: data.excerpt,
  };
}

export default async function PostPage({ params }: PageProps) {
  const { slug } = await params;
  const doc = await adminDb.collection("posts").doc(slug).get();

  if (!doc.exists || !doc.data()?.published) {
    notFound();
  }

  const data = doc.data()!;
  const createdAt = data.createdAt?.toDate().toISOString();

  return (
    <article>
      <header className="mb-8">
        <h1 className="text-3xl font-bold">{data.title}</h1>
        <time className="mt-2 block text-[var(--muted-foreground)]">
          {formatDate(createdAt)}
        </time>
      </header>
      {data.coverImage && (
        <img
          src={data.coverImage}
          alt={data.title}
          className="mb-8 h-64 w-full rounded-lg object-cover"
        />
      )}
      <PostContent content={data.content} />
    </article>
  );
}
