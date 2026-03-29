import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { generateSlug } from '@/lib/utils';
import { assertAdmin } from '@/lib/auth-utils';
import {
  getPublishedPosts,
  postExists,
  createPost,
} from '@/lib/posts-repository';

export async function GET() {
  const posts = await getPublishedPosts();
  return NextResponse.json(posts);
}

export async function POST(request: NextRequest) {
  const authError = await assertAdmin(request);
  if (authError) {
    return authError;
  }

  const body = await request.json();
  const { title, content, excerpt, coverImage, published } = body;

  if (!title || !content) {
    return NextResponse.json(
      { error: 'Title and content are required' },
      { status: 400 }
    );
  }

  const slug = generateSlug(title);

  if (await postExists(slug)) {
    return NextResponse.json(
      {
        error:
          'A post with a similar title already exists. Please use a different title.',
      },
      { status: 409 }
    );
  }

  await createPost(slug, { title, content, excerpt, coverImage, published });

  revalidatePath('/');
  revalidatePath(`/posts/${slug}`);

  return NextResponse.json({ slug }, { status: 201 });
}
