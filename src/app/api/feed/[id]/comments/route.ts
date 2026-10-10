import { NextRequest, NextResponse } from "next/server";
import { getEnrichedSession } from "@/lib/auth";
import { addFeedComment, getFeedPost } from "@/lib/feed-posts";

export const dynamic = "force-dynamic";

type Ctx = { params: Promise<{ id: string }> };

export async function POST(req: NextRequest, ctx: Ctx) {
  const session = await getEnrichedSession();
  if (!session) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const { id } = await ctx.params;
  let body: { content?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid" }, { status: 400 });
  }

  try {
    const comment = await addFeedComment(id, {
      discordId: session.discordId,
      username: session.username,
      mcNick: session.mcNick,
      avatar: session.avatar,
      content: body.content ?? "",
    });
    if (!comment) {
      return NextResponse.json({ error: "not_found" }, { status: 404 });
    }
    return NextResponse.json({ comment });
  } catch (e) {
    if (e instanceof Error && e.message === "invalid_content") {
      return NextResponse.json({ error: "invalid_content" }, { status: 400 });
    }
    throw e;
  }
}

export async function GET(_req: NextRequest, ctx: Ctx) {
  const { id } = await ctx.params;
  const post = await getFeedPost(id);
  if (!post) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }
  return NextResponse.json({ comments: post.comments });
}
