'use client';

import { useEffect, useState, use } from 'react';
import { useAuth } from '@/lib/auth-context';
import { useRouter } from 'next/navigation';
import Editor from '@/components/Editor';
import { truncate } from '@/lib/utils';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default function EditPostPage({ params }: PageProps) {
  const { slug } = use(params);
  const { user } = useAuth();
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [coverImage, setCoverImage] = useState('');
  const [published, setPublished] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPost = async () => {
      if (!user) {
        return;
      }
      const token = await user.getIdToken();
      const res = await fetch(`/api/posts/${slug}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setTitle(data.title);
        setContent(data.content);
        setExcerpt(data.excerpt || '');
        setCoverImage(data.coverImage || '');
        setPublished(data.published);
      }
      setLoading(false);
    };
    fetchPost();
  }, [slug, user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !title || !content) {
      return;
    }

    setSaving(true);
    try {
      const token = await user.getIdToken();
      const body = {
        title,
        content,
        excerpt: excerpt || truncate(content.replace(/<[^>]+>/g, ''), 160),
        coverImage: coverImage || null,
        published,
      };

      const res = await fetch(`/api/posts/${slug}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });

      if (res.ok) {
        router.push('/admin');
      }
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-[var(--muted)] border-t-[var(--primary)]" />
      </div>
    );
  }

  return (
    <div>
      <h1 className="mb-8 text-2xl font-bold">Edit Post</h1>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="mb-1.5 block text-sm font-medium">Title</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            className="w-full rounded-lg border border-[var(--border)] bg-transparent px-4 py-2.5 focus:border-[var(--primary)] focus:outline-none"
          />
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium">
            Excerpt (optional)
          </label>
          <textarea
            value={excerpt}
            onChange={(e) => setExcerpt(e.target.value)}
            rows={2}
            className="w-full rounded-lg border border-[var(--border)] bg-transparent px-4 py-2.5 focus:border-[var(--primary)] focus:outline-none"
          />
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium">
            Cover Image URL (optional)
          </label>
          <input
            type="url"
            value={coverImage}
            onChange={(e) => setCoverImage(e.target.value)}
            className="w-full rounded-lg border border-[var(--border)] bg-transparent px-4 py-2.5 focus:border-[var(--primary)] focus:outline-none"
          />
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium">Content</label>
          {content !== undefined && (
            <Editor content={content} onChange={setContent} />
          )}
        </div>

        <div className="flex items-center gap-6">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={published}
              onChange={(e) => setPublished(e.target.checked)}
              className="h-4 w-4 rounded"
            />
            <span className="text-sm">Published</span>
          </label>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => router.push('/admin')}
              className="rounded-lg border border-[var(--border)] px-4 py-2 text-sm font-medium transition-colors hover:bg-[var(--muted)]"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving || !title || !content}
              className="rounded-lg bg-[var(--primary)] px-4 py-2 text-sm font-medium text-[var(--primary-foreground)] transition-opacity hover:opacity-90 disabled:opacity-50"
            >
              {saving ? 'Saving…' : 'Update Post'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
