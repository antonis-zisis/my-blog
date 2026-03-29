import 'server-only';
import { adminDb } from '@/lib/firebase-admin';
import { readingTime } from '@/lib/utils';

export type Post = {
  slug: string;
  title: string;
  excerpt: string;
  coverImage: string | null;
  published: boolean;
  createdAt: string;
  updatedAt: string;
};

export type PostWithContent = Post & { content: string };

export type PostSummary = Post & { readingTime: number };

export type CreatePostInput = {
  title: string;
  content: string;
  excerpt: string;
  coverImage: string | null;
  published: boolean;
};

export type UpdatePostInput = Partial<
  Pick<
    CreatePostInput,
    'title' | 'content' | 'excerpt' | 'coverImage' | 'published'
  >
>;

function toPost(doc: FirebaseFirestore.QueryDocumentSnapshot): Post {
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
}

export async function getPublishedPosts(): Promise<PostSummary[]> {
  const snapshot = await adminDb
    .collection('posts')
    .where('published', '==', true)
    .orderBy('createdAt', 'desc')
    .get();

  return snapshot.docs.map((doc) => ({
    ...toPost(doc),
    readingTime: readingTime(doc.data().content ?? ''),
  }));
}

export async function getAllPosts(): Promise<PostSummary[]> {
  const snapshot = await adminDb
    .collection('posts')
    .orderBy('createdAt', 'desc')
    .get();

  return snapshot.docs.map((doc) => ({
    ...toPost(doc),
    readingTime: readingTime(doc.data().content ?? ''),
  }));
}

export async function getPost(slug: string): Promise<PostWithContent | null> {
  const doc = await adminDb.collection('posts').doc(slug).get();

  if (!doc.exists) {
    return null;
  }

  const data = doc.data()!;

  return {
    slug: doc.id,
    title: data.title,
    excerpt: data.excerpt,
    coverImage: data.coverImage || null,
    published: data.published,
    createdAt: data.createdAt?.toDate().toISOString(),
    updatedAt: data.updatedAt?.toDate().toISOString(),
    content: data.content,
  };
}

export async function postExists(slug: string): Promise<boolean> {
  const doc = await adminDb.collection('posts').doc(slug).get();
  return doc.exists;
}

export async function createPost(
  slug: string,
  input: CreatePostInput
): Promise<void> {
  const now = new Date();
  await adminDb
    .collection('posts')
    .doc(slug)
    .set({
      slug,
      ...input,
      excerpt: input.excerpt || '',
      coverImage: input.coverImage || null,
      published: input.published ?? false,
      authorId: process.env.NEXT_PUBLIC_ADMIN_UID,
      createdAt: now,
      updatedAt: now,
    });
}

export async function updatePost(
  slug: string,
  input: UpdatePostInput
): Promise<void> {
  const updates: Record<string, unknown> = { updatedAt: new Date() };

  if (input.title !== undefined) {
    updates.title = input.title;
  }

  if (input.content !== undefined) {
    updates.content = input.content;
  }

  if (input.excerpt !== undefined) {
    updates.excerpt = input.excerpt;
  }

  if (input.coverImage !== undefined) {
    updates.coverImage = input.coverImage;
  }

  if (input.published !== undefined) {
    updates.published = input.published;
  }

  await adminDb.collection('posts').doc(slug).update(updates);
}

export async function deletePost(slug: string): Promise<void> {
  await adminDb.collection('posts').doc(slug).delete();
}
