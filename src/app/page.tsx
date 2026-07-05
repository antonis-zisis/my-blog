import PostCard from '@/components/PostCard';
import { getPublishedPosts } from '@/lib/posts-repository';

export default async function HomePage() {
  const posts = await getPublishedPosts();

  return (
    <div>
      <h1 className="mb-6 text-lg font-bold">Latest Posts</h1>

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
