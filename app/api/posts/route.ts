import { NextRequest, NextResponse } from 'next/server';
import { adminDb, adminAuth } from '@/lib/firebase-admin';
import { generateSlug } from '@/lib/utils';

export async function GET() {
  const snapshot = await adminDb
    .collection('posts')
    .where('published', '==', true)
    .orderBy('createdAt', 'desc')
    .get();

  const posts = snapshot.docs.map((doc) => {
    const data = doc.data();
    return {
      slug: doc.id,
      title: data.title,
      excerpt: data.excerpt,
      coverImage: data.coverImage || null,
      published: data.published,
      createdAt: data.createdAt?.toDate().toISOString(),
      updatedAt: data.updatedAt?.toDate().toISOString(),
    };
  });

  return NextResponse.json(posts);
}

export async function POST(request: NextRequest) {
  const token = request.headers.get('authorization')?.split('Bearer ')[1];
  if (!token) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const decoded = await adminAuth.verifyIdToken(token);
    if (decoded.uid !== process.env.NEXT_PUBLIC_ADMIN_UID) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
  } catch {
    return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
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
  const now = new Date();

  const existing = await adminDb.collection('posts').doc(slug).get();
  if (existing.exists) {
    return NextResponse.json(
      {
        error:
          'A post with a similar title already exists. Please use a different title.',
      },
      { status: 409 }
    );
  }

  await adminDb
    .collection('posts')
    .doc(slug)
    .set({
      slug,
      title,
      content,
      excerpt: excerpt || '',
      coverImage: coverImage || null,
      published: published ?? false,
      createdAt: now,
      updatedAt: now,
      authorId: process.env.NEXT_PUBLIC_ADMIN_UID,
    });

  return NextResponse.json({ slug }, { status: 201 });
}
