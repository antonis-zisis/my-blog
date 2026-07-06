import { revalidatePath } from 'next/cache';
import { NextRequest, NextResponse } from 'next/server';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { GET as getAll } from '@/app/api/posts/all/route';
import { DELETE, GET, PUT } from '@/app/api/posts/[slug]/route';
import { assertAdmin } from '@/lib/auth-utils';
import {
  deletePost,
  getAllPosts,
  getPost,
  updatePost,
} from '@/lib/posts-repository';

vi.mock('@/lib/posts-repository', () => ({
  getPost: vi.fn(),
  updatePost: vi.fn(),
  deletePost: vi.fn(),
  getAllPosts: vi.fn(),
}));

vi.mock('@/lib/auth-utils', () => ({
  assertAdmin: vi.fn(),
}));

vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
}));

type Post = Awaited<ReturnType<typeof getPost>>;

const params = { params: Promise.resolve({ slug: 'hello-world' }) };

function request(method = 'GET', body?: unknown): NextRequest {
  return new NextRequest('http://test/api/posts/hello-world', {
    method,
    body: body === undefined ? undefined : JSON.stringify(body),
    headers: { 'content-type': 'application/json' },
  });
}

function authorise(): void {
  vi.mocked(assertAdmin).mockResolvedValue(null);
}

function deny(): NextResponse {
  const denied = NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  vi.mocked(assertAdmin).mockResolvedValue(denied);

  return denied;
}

afterEach(() => {
  vi.clearAllMocks();
});

describe('GET /api/posts/[slug]', () => {
  it('returns 404 when the post does not exist', async () => {
    vi.mocked(getPost).mockResolvedValue(null);

    const response = await GET(request(), params);

    expect(response.status).toBe(404);
  });

  it('returns a published post without requiring auth', async () => {
    const post = { slug: 'hello-world', published: true } as unknown as Post;

    vi.mocked(getPost).mockResolvedValue(post);

    const response = await GET(request(), params);

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual(post);
    expect(assertAdmin).not.toHaveBeenCalled();
  });

  it('returns 404 (not 401) for an unpublished post without auth', async () => {
    const post = { slug: 'hello-world', published: false } as unknown as Post;

    vi.mocked(getPost).mockResolvedValue(post);
    deny();

    const response = await GET(request(), params);

    expect(response.status).toBe(404);
  });

  it('returns an unpublished post to the admin', async () => {
    const post = { slug: 'hello-world', published: false } as unknown as Post;

    vi.mocked(getPost).mockResolvedValue(post);
    authorise();

    const response = await GET(request(), params);

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual(post);
  });
});

describe('PUT /api/posts/[slug]', () => {
  const body = {
    title: 'Hello World',
    content: 'Updated body',
    excerpt: 'Short',
    coverImage: 'https://example.com/cover.png',
    published: true,
  };

  it('returns the auth error and never touches the repository', async () => {
    const denied = deny();

    const response = await PUT(request('PUT', body), params);

    expect(response).toBe(denied);
    expect(getPost).not.toHaveBeenCalled();
    expect(updatePost).not.toHaveBeenCalled();
    expect(revalidatePath).not.toHaveBeenCalled();
  });

  it('returns 404 when the post does not exist', async () => {
    authorise();
    vi.mocked(getPost).mockResolvedValue(null);

    const response = await PUT(request('PUT', body), params);

    expect(response.status).toBe(404);
    expect(updatePost).not.toHaveBeenCalled();
  });

  it('updates the post and revalidates both paths on success', async () => {
    authorise();
    vi.mocked(getPost).mockResolvedValue({
      slug: 'hello-world',
    } as unknown as Post);

    const response = await PUT(request('PUT', body), params);

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({ slug: 'hello-world' });
    expect(updatePost).toHaveBeenCalledWith('hello-world', body);
    expect(revalidatePath).toHaveBeenCalledWith('/');
    expect(revalidatePath).toHaveBeenCalledWith('/posts/hello-world');
  });
});

describe('DELETE /api/posts/[slug]', () => {
  it('returns the auth error and never touches the repository', async () => {
    const denied = deny();

    const response = await DELETE(request('DELETE'), params);

    expect(response).toBe(denied);
    expect(deletePost).not.toHaveBeenCalled();
    expect(revalidatePath).not.toHaveBeenCalled();
  });

  it('deletes the post and revalidates both paths on success', async () => {
    authorise();

    const response = await DELETE(request('DELETE'), params);

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({ success: true });
    expect(deletePost).toHaveBeenCalledWith('hello-world');
    expect(revalidatePath).toHaveBeenCalledWith('/');
    expect(revalidatePath).toHaveBeenCalledWith('/posts/hello-world');
  });
});

describe('GET /api/posts/all', () => {
  it('returns the auth error and never touches the repository', async () => {
    const denied = deny();

    const response = await getAll(request());

    expect(response).toBe(denied);
    expect(getAllPosts).not.toHaveBeenCalled();
  });

  it('returns all posts to the admin', async () => {
    const posts = [{ slug: 'draft', published: false }];

    authorise();
    vi.mocked(getAllPosts).mockResolvedValue(
      posts as Awaited<ReturnType<typeof getAllPosts>>
    );

    const response = await getAll(request());

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual(posts);
  });
});
