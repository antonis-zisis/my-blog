import { revalidatePath } from 'next/cache';
import { NextRequest, NextResponse } from 'next/server';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { GET, POST } from '@/app/api/posts/route';
import { assertAdmin } from '@/lib/auth-utils';
import {
  createPost,
  getPublishedPosts,
  postExists,
} from '@/lib/posts-repository';

vi.mock('@/lib/posts-repository', () => ({
  getPublishedPosts: vi.fn(),
  postExists: vi.fn(),
  createPost: vi.fn(),
}));

vi.mock('@/lib/auth-utils', () => ({
  assertAdmin: vi.fn(),
}));

vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
}));

function postRequest(body: unknown): NextRequest {
  return new NextRequest('http://test/api/posts', {
    method: 'POST',
    body: JSON.stringify(body),
    headers: { 'content-type': 'application/json' },
  });
}

function authorise(): void {
  vi.mocked(assertAdmin).mockResolvedValue(null);
}

afterEach(() => {
  vi.clearAllMocks();
});

describe('GET /api/posts', () => {
  it('returns published posts as JSON without requiring auth', async () => {
    const posts = [{ slug: 'hello-world', title: 'Hello World' }];

    vi.mocked(getPublishedPosts).mockResolvedValue(
      posts as Awaited<ReturnType<typeof getPublishedPosts>>
    );

    const response = await GET();

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual(posts);
    expect(assertAdmin).not.toHaveBeenCalled();
  });
});

describe('POST /api/posts', () => {
  it('returns the auth error and never touches the repository', async () => {
    const denied = NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );

    vi.mocked(assertAdmin).mockResolvedValue(denied);

    const response = await POST(postRequest({ title: 'A', content: 'B' }));

    expect(response).toBe(denied);
    expect(postExists).not.toHaveBeenCalled();
    expect(createPost).not.toHaveBeenCalled();
    expect(revalidatePath).not.toHaveBeenCalled();
  });

  it('returns 400 when the title is missing', async () => {
    authorise();

    const response = await POST(postRequest({ content: 'Body' }));

    expect(response.status).toBe(400);
    expect(createPost).not.toHaveBeenCalled();
  });

  it('returns 400 when the content is missing', async () => {
    authorise();

    const response = await POST(postRequest({ title: 'Title' }));

    expect(response.status).toBe(400);
    expect(createPost).not.toHaveBeenCalled();
  });

  it('returns 409 when a post with the same slug already exists', async () => {
    authorise();
    vi.mocked(postExists).mockResolvedValue(true);

    const response = await POST(
      postRequest({ title: 'Hello World', content: 'Body' })
    );

    expect(response.status).toBe(409);
    expect(postExists).toHaveBeenCalledWith('hello-world');
    expect(createPost).not.toHaveBeenCalled();
    expect(revalidatePath).not.toHaveBeenCalled();
  });

  it('creates the post and revalidates both paths on success', async () => {
    authorise();
    vi.mocked(postExists).mockResolvedValue(false);

    const body = {
      title: 'Hello World',
      content: 'Body',
      excerpt: 'Short',
      coverImage: 'https://example.com/cover.png',
      published: true,
    };
    const response = await POST(postRequest(body));

    expect(response.status).toBe(201);
    await expect(response.json()).resolves.toEqual({ slug: 'hello-world' });
    expect(createPost).toHaveBeenCalledWith('hello-world', body);
    expect(revalidatePath).toHaveBeenCalledWith('/');
    expect(revalidatePath).toHaveBeenCalledWith('/posts/hello-world');
  });
});
