import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { assertAdmin } from '@/lib/auth-utils';
import { getPost, updatePost, deletePost } from '@/lib/posts-repository';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const post = await getPost(slug);

  if (!post) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  if (!post.published) {
    const authError = await assertAdmin(request);
    if (authError) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }
  }

  return NextResponse.json(post);
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const authError = await assertAdmin(request);
  if (authError) {
    return authError;
  }

  const { slug } = await params;
  const post = await getPost(slug);

  if (!post) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  const { title, content, excerpt, coverImage, published } =
    await request.json();
  await updatePost(slug, { title, content, excerpt, coverImage, published });

  revalidatePath('/');
  revalidatePath(`/posts/${slug}`);

  return NextResponse.json({ slug });
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const authError = await assertAdmin(request);
  if (authError) {
    return authError;
  }

  const { slug } = await params;
  await deletePost(slug);

  revalidatePath('/');
  revalidatePath(`/posts/${slug}`);

  return NextResponse.json({ success: true });
}
