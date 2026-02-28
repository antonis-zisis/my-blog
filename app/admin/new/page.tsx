'use client';

import { useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { useRouter } from 'next/navigation';
import Editor from '@/components/Editor';
import { truncate } from '@/lib/utils';

export default function NewPostPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [coverImage, setCoverImage] = useState('');
  const [published, setPublished] = useState(false);
  const [saving, setSaving] = useState(false);

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
        coverImage: coverImage || undefined,
        published,
      };

      const res = await fetch('/api/posts', {
        method: 'POST',
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

  return (
    <div>
      <h1 className="mb-8 text-2xl font-bold">New Post</h1>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="mb-1.5 block text-sm font-medium">Title</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            className="w-full rounded-lg border border-(--border) bg-transparent px-4 py-2.5 focus:border-(--primary) focus:outline-none"
            placeholder="Post title"
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
            className="w-full rounded-lg border border-(--border) bg-transparent px-4 py-2.5 focus:border-(--primary) focus:outline-none"
            placeholder="Brief description (auto-generated if empty)"
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
            className="w-full rounded-lg border border-(--border) bg-transparent px-4 py-2.5 focus:border-(--primary) focus:outline-none"
            placeholder="https://example.com/image.jpg"
          />
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium">Content</label>
          <Editor content={content} onChange={setContent} />
        </div>

        <div className="flex items-center gap-6">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={published}
              onChange={(e) => setPublished(e.target.checked)}
              className="h-4 w-4 rounded"
            />
            <span className="text-sm">Publish immediately</span>
          </label>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => router.push('/admin')}
              className="cursor-pointer rounded-lg border border-(--border) px-4 py-2 text-sm font-medium transition-colors hover:bg-(--muted)"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving || !title || !content}
              className="cursor-pointer rounded-lg bg-(--primary) px-4 py-2 text-sm font-medium text-(--primary-foreground) transition-opacity hover:opacity-90 disabled:opacity-50"
            >
              {saving ? 'Saving…' : 'Save Post'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
