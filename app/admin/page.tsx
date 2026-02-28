'use client';

import { useAuth } from '@/lib/auth-context';
import { useEffect, useState } from 'react';
import { signOut } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import Link from 'next/link';
import { formatDate } from '@/lib/utils';
import { Plus, Pencil, Trash2, LogOut } from 'lucide-react';
import ConfirmModal from '@/components/ConfirmModal';

interface Post {
  slug: string;
  title: string;
  published: boolean;
  createdAt: string;
  updatedAt: string;
  readingTime: number;
}

export default function AdminDashboard() {
  const { user } = useAuth();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingSlug, setDeletingSlug] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      return;
    }
    let cancelled = false;
    user.getIdToken().then(async (token) => {
      const res = await fetch('/api/posts/all', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (cancelled) {
        return;
      }
      if (res.ok) {
        setPosts(await res.json());
      }
      setLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, [user]);

  const confirmDelete = async () => {
    if (!deletingSlug || !user) return;
    const token = await user.getIdToken();
    await fetch(`/api/posts/${deletingSlug}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });
    setPosts((prev) => prev.filter((p) => p.slug !== deletingSlug));
    setDeletingSlug(null);
  };

  const deletingPost = posts.find((p) => p.slug === deletingSlug);

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <div className="flex items-center gap-3">
          <Link
            href="/admin/new"
            className="flex items-center gap-1.5 rounded-lg bg-(--primary) px-4 py-2 text-sm font-medium text-(--primary-foreground) transition-opacity hover:opacity-90"
          >
            <Plus size={16} />
            New Post
          </Link>
          <button
            onClick={() => signOut(auth)}
            className="flex cursor-pointer items-center gap-1.5 rounded-lg border border-(--border) px-4 py-2 text-sm font-medium transition-colors hover:bg-(--muted)"
          >
            <LogOut size={16} />
            Sign Out
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-10">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-(--muted) border-t-(--primary)" />
        </div>
      ) : posts.length === 0 ? (
        <p className="text-(--muted-foreground)">
          No posts yet. Create your first post!
        </p>
      ) : (
        <div className="space-y-3">
          {posts.map((post) => (
            <div
              key={post.slug}
              className="flex items-center justify-between rounded-lg border border-(--border) p-4"
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
                <p className="mt-1 flex items-center gap-2 text-sm text-(--muted-foreground)">
                  <span>{formatDate(post.createdAt)}</span>
                  <span>·</span>
                  <span>{post.readingTime} min read</span>
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Link
                  href={`/admin/edit/${post.slug}`}
                  className="rounded-md p-2 transition-colors hover:bg-(--muted)"
                  title="Edit"
                >
                  <Pencil size={16} />
                </Link>
                <button
                  onClick={() => setDeletingSlug(post.slug)}
                  className="cursor-pointer rounded-md p-2 text-(--destructive) transition-colors hover:bg-(--muted)"
                  title="Delete"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {deletingSlug && (
        <ConfirmModal
          title="Delete post"
          message={`"${deletingPost?.title}" will be permanently deleted.`}
          confirmLabel="Delete"
          onConfirm={confirmDelete}
          onCancel={() => setDeletingSlug(null)}
        />
      )}
    </div>
  );
}
