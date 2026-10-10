import { randomUUID } from "crypto";
import { mkdir, readFile, writeFile } from "fs/promises";
import path from "path";
const FILE = path.join(process.cwd(), "data", "feed-posts.json");

export type FeedComment = {
  id: string;
  discordId: string;
  authorName: string;
  authorSlug: string;
  avatar: string;
  content: string;
  createdAt: string;
};

export type FeedPost = {
  id: string;
  discordId: string;
  authorName: string;
  authorSlug: string;
  avatar: string;
  content: string;
  createdAt: string;
  likedBy: string[];
  mediaUrl?: string;
  mediaType?: "image" | "video";
  comments: FeedComment[];
};

type Store = { posts: FeedPost[] };

function normalizePost(p: FeedPost): FeedPost {
  return { ...p, comments: p.comments ?? [] };
}

async function readStore(): Promise<Store> {
  try {
    await mkdir(path.dirname(FILE), { recursive: true });
    const raw = JSON.parse(await readFile(FILE, "utf8")) as Store;
    return { posts: (raw.posts ?? []).map(normalizePost) };
  } catch {
    return { posts: [] };
  }
}

async function writeStore(store: Store) {
  await mkdir(path.dirname(FILE), { recursive: true });
  await writeFile(FILE, JSON.stringify(store, null, 2), "utf8");
}

export async function listFeedPosts(limit = 50): Promise<FeedPost[]> {
  const { posts } = await readStore();
  return [...posts]
    .sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt))
    .slice(0, limit);
}

export async function listFeedPostsByDiscordId(
  discordId: string,
  limit = 40,
): Promise<FeedPost[]> {
  const { posts } = await readStore();
  return [...posts]
    .filter((p) => p.discordId === discordId)
    .sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt))
    .slice(0, limit);
}

export async function createFeedPost(input: {
  discordId: string;
  username: string;
  mcNick?: string | null;
  avatar: string;
  content: string;
  mediaUrl?: string | null;
  mediaType?: "image" | "video" | null;
}): Promise<FeedPost> {
  const text = input.content.trim();
  if (text.length > 2000) throw new Error("invalid_content");
  if (text.length < 1 && !input.mediaUrl) throw new Error("invalid_content");

  const authorSlug =
    input.mcNick?.trim() || input.username.trim() || input.discordId;
  const post: FeedPost = {
    id: randomUUID(),
    discordId: input.discordId,
    authorName: input.mcNick?.trim() || input.username,
    authorSlug,
    avatar: input.avatar || "/logo.png",
    content: text,
    createdAt: new Date().toISOString(),
    likedBy: [],
    ...(input.mediaUrl && input.mediaType
      ? { mediaUrl: input.mediaUrl, mediaType: input.mediaType }
      : {}),
    comments: [],
  };

  const store = await readStore();
  store.posts.unshift(post);
  if (store.posts.length > 200) {
    store.posts = store.posts.slice(0, 200);
  }
  await writeStore(store);
  return post;
}

export async function addFeedComment(
  postId: string,
  input: {
    discordId: string;
    username: string;
    mcNick?: string | null;
    avatar: string;
    content: string;
  },
): Promise<FeedComment | null> {
  const text = input.content.trim();
  if (text.length < 1 || text.length > 1000) throw new Error("invalid_content");

  const store = await readStore();
  const post = store.posts.find((p) => p.id === postId);
  if (!post) return null;

  const authorSlug =
    input.mcNick?.trim() || input.username.trim() || input.discordId;
  const comment: FeedComment = {
    id: randomUUID(),
    discordId: input.discordId,
    authorName: input.mcNick?.trim() || input.username,
    authorSlug,
    avatar: input.avatar || "/logo.png",
    content: text,
    createdAt: new Date().toISOString(),
  };
  post.comments.push(comment);
  if (post.comments.length > 100) {
    post.comments = post.comments.slice(-100);
  }
  await writeStore(store);
  return comment;
}

export async function getFeedPost(postId: string) {
  const store = await readStore();
  return store.posts.find((p) => p.id === postId) ?? null;
}

export async function toggleFeedLike(postId: string, discordId: string) {
  const store = await readStore();
  const post = store.posts.find((p) => p.id === postId);
  if (!post) return null;

  const set = new Set(post.likedBy);
  if (set.has(discordId)) set.delete(discordId);
  else set.add(discordId);
  post.likedBy = [...set];
  await writeStore(store);
  return post;
}
