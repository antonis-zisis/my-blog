'use client';

import { useAuth } from '@/lib/auth-context';
import { useEffect, useState } from 'react';
import { signOut } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import Link from 'next/link';
import { formatDate } from '@/lib/utils';
import { Plus, Pencil, Trash2, LogOut } from 'lucide-react';

interface Post {
  slug: string;
  title: string;
  published: boolean;
  createdAt: string;
  updatedAt: string;
}

export default function AdminDashboard() {
  const { user } = useAuth();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPosts = async () => {
    if (!user) return;
    const token = await user.getIdToken();
    const res = await fetch('/api/posts/all', {
      headers: { Authorization: `Bearer ${token}` },
    });
    // Fallback: fetch from the public endpoint + admin endpoint
    // We'll use a dedicated admin endpoint that returns all posts
    // For now, let's fetch all posts including drafts via individual calls
    // Actually, let's create a simpler approach: fetch all via admin
    if (res.ok) {
      const data = await res.json();
      setPosts(data);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchPosts();
  }, [user]);

  const handleDelete = async (slug: string) => {
    if (!confirm('Are you sure you want to delete this post?')) return;
    if (!user) return;
    const token = await user.getIdToken();
    await fetch(`/api/posts/${slug}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });
    setPosts((prev) => prev.filter((p) => p.slug !== slug));
  };

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <div className="flex items-center gap-3">
          <Link
            href="/admin/new"
            className="flex items-center gap-1.5 rounded-lg bg-[var(--primary)] px-4 py-2 text-sm font-medium text-[var(--primary-foreground)] transition-opacity hover:opacity-90"
          >
            <Plus size={16} />
            New Post
          </Link>
          <button
            onClick={() => signOut(auth)}
            className="flex items-center gap-1.5 rounded-lg border border-[var(--border)] px-4 py-2 text-sm font-medium transition-colors hover:bg-[var(--muted)]"
          >
            <LogOut size={16} />
            Sign Out
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-10">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-[var(--muted)] border-t-[var(--primary)]" />
        </div>
      ) : posts.length === 0 ? (
        <p className="text-[var(--muted-foreground)]">
          No posts yet. Create your first post!
        </p>
      ) : (
        <div className="space-y-3">
          {posts.map((post) => (
            <div
              key={post.slug}
              className="flex items-center justify-between rounded-lg border border-[var(--border)] p-4"
            >
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="font-medium">{post.title}</h2>
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                      post.published
                        ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                        : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                    }`}
                  >
                    {post.published ? 'Published' : 'Draft'}
                  </span>
                </div>
                <p className="mt-1 text-sm text-[var(--muted-foreground)]">
                  {formatDate(post.createdAt)}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Link
                  href={`/admin/edit/${post.slug}`}
                  className="rounded-md p-2 transition-colors hover:bg-[var(--muted)]"
                  title="Edit"
                >
                  <Pencil size={16} />
                </Link>
                <button
                  onClick={() => handleDelete(post.slug)}
                  className="rounded-md p-2 text-[var(--destructive)] transition-colors hover:bg-[var(--muted)]"
                  title="Delete"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
