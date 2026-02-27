import { NextRequest, NextResponse } from "next/server";
import { adminDb, adminAuth } from "@/lib/firebase-admin";

export async function GET(request: NextRequest) {
  const token = request.headers.get("authorization")?.split("Bearer ")[1];
  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const decoded = await adminAuth.verifyIdToken(token);
    if (decoded.uid !== process.env.NEXT_PUBLIC_ADMIN_UID) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
  } catch {
    return NextResponse.json({ error: "Invalid token" }, { status: 401 });
  }

  const snapshot = await adminDb
    .collection("posts")
    .orderBy("createdAt", "desc")
    .get();

  const posts = snapshot.docs.map((doc) => {
    const data = doc.data();
    return {
      slug: doc.id,
      title: data.title,
      excerpt: data.excerpt,
      published: data.published,
      createdAt: data.createdAt?.toDate().toISOString(),
      updatedAt: data.updatedAt?.toDate().toISOString(),
    };
  });

  return NextResponse.json(posts);
}
