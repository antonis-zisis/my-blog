import { adminDb } from '@/lib/firebase-admin';
import PostCard from '@/components/PostCard';
import { readingTime } from '@/lib/utils';

export const dynamic = 'force-dynamic';
export const revalidate = 60;

export default async function HomePage() {
  const snapshot = await adminDb
    .collection('posts')
    .where('published', '==', true)
    .orderBy('createdAt', 'desc')
    .get();

  const posts = snapshot.docs.map((doc) => {
    const data = doc.data();
    return {
      slug: doc.id,
      title: data.title as string,
      excerpt: data.excerpt as string,
      coverImage: (data.coverImage as string) || null,
      createdAt: data.createdAt?.toDate().toISOString() as string,
      readingTime: readingTime(data.content ?? ''),
    };
  });

  return (
    <div>
      <h1 className="mb-8 text-3xl font-bold">Latest Posts</h1>
      {posts.length === 0 ? (
        <p className="text-(--muted-foreground)">No posts yet.</p>
      ) : (
        <div className="space-y-2">
          {posts.map((post) => (
            <PostCard key={post.slug} {...post} />
          ))}
        </div>
      )}
    </div>
  );
}
