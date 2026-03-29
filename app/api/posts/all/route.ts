import { NextRequest, NextResponse } from 'next/server';
import { assertAdmin } from '@/lib/auth-utils';
import { getAllPosts } from '@/lib/posts-repository';

export async function GET(request: NextRequest) {
  const authError = await assertAdmin(request);
  if (authError) {
    return authError;
  }

  const posts = await getAllPosts();
  return NextResponse.json(posts);
}
