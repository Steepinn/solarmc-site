import { NextRequest, NextResponse } from "next/server";
import { getEnrichedSession } from "@/lib/auth";
import { createFeedPost, listFeedPosts } from "@/lib/feed-posts";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await getEnrichedSession();
  const posts = await listFeedPosts();
  return NextResponse.json({
    posts: posts.map((p) => ({
      id: p.id,
      author: p.authorName,
      authorSlug: p.authorSlug,
      avatar: p.avatar,
      content: p.content,
      createdAt: p.createdAt,
      mediaUrl: p.mediaUrl ?? null,
      mediaType: p.mediaType ?? null,
      commentCount: p.comments.length,
      comments: p.comments.map((c) => ({
        id: c.id,
        author: c.authorName,
        authorSlug: c.authorSlug,
        avatar: c.avatar,
        content: c.content,
        createdAt: c.createdAt,
      })),
      likes: p.likedBy.length,
      liked: session ? p.likedBy.includes(session.discordId) : false,
    })),
  });
}

export async function POST(req: NextRequest) {
  const session = await getEnrichedSession();
  if (!session) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  let body: {
    content?: string;
    mediaUrl?: string | null;
    mediaType?: "image" | "video" | null;
  };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid" }, { status: 400 });
  }

  const mediaUrl =
    typeof body.mediaUrl === "string" && body.mediaUrl.startsWith("/uploads/")
      ? body.mediaUrl
      : null;
  const mediaType =
    mediaUrl && (body.mediaType === "image" || body.mediaType === "video")
      ? body.mediaType
      : null;

  try {
    const post = await createFeedPost({
      discordId: session.discordId,
      username: session.username,
      mcNick: session.mcNick,
      avatar: session.avatar,
      content: body.content ?? "",
      mediaUrl,
      mediaType,
    });
    return NextResponse.json({
      post: {
        id: post.id,
        author: post.authorName,
        authorSlug: post.authorSlug,
        avatar: post.avatar,
        content: post.content,
        createdAt: post.createdAt,
        mediaUrl: post.mediaUrl ?? null,
        mediaType: post.mediaType ?? null,
        commentCount: 0,
        comments: [],
        likes: 0,
        liked: false,
      },
    });
  } catch (e) {
    if (e instanceof Error && e.message === "invalid_content") {
      return NextResponse.json({ error: "invalid_content" }, { status: 400 });
    }
    throw e;
  }
}
