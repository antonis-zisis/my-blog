import { NextRequest, NextResponse } from 'next/server';
import { adminDb, adminAuth } from '@/lib/firebase-admin';

async function verifyAdmin(request: NextRequest): Promise<boolean> {
  const token = request.headers.get('authorization')?.split('Bearer ')[1];
  if (!token) {
    return false;
  }
  try {
    const decoded = await adminAuth.verifyIdToken(token);
    return decoded.uid === process.env.NEXT_PUBLIC_ADMIN_UID;
  } catch {
    return false;
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const doc = await adminDb.collection('posts').doc(slug).get();

  if (!doc.exists) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  const data = doc.data()!;

  // If not published, require admin auth
  if (!data.published) {
    const isAdmin = await verifyAdmin(request);
    if (!isAdmin) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }
  }

  return NextResponse.json({
    slug: doc.id,
    title: data.title,
    content: data.content,
    excerpt: data.excerpt,
    coverImage: data.coverImage || null,
    published: data.published,
    createdAt: data.createdAt?.toDate().toISOString(),
    updatedAt: data.updatedAt?.toDate().toISOString(),
  });
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const isAdmin = await verifyAdmin(request);
  if (!isAdmin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { slug } = await params;
  const doc = await adminDb.collection('posts').doc(slug).get();

  if (!doc.exists) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  const body = await request.json();
  const { title, content, excerpt, coverImage, published } = body;

  const updates: Record<string, unknown> = { updatedAt: new Date() };
  if (title !== undefined) {
    updates.title = title;
  }
  if (content !== undefined) {
    updates.content = content;
  }
  if (excerpt !== undefined) {
    updates.excerpt = excerpt;
  }
  if (coverImage !== undefined) {
    updates.coverImage = coverImage;
  }
  if (published !== undefined) {
    updates.published = published;
  }

  await adminDb.collection('posts').doc(slug).update(updates);

  return NextResponse.json({ slug });
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const isAdmin = await verifyAdmin(request);
  if (!isAdmin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { slug } = await params;
  await adminDb.collection('posts').doc(slug).delete();

  return NextResponse.json({ success: true });
}
