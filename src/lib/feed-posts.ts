import { randomUUID } from "crypto";
import { mkdir, readFile, writeFile } from "fs/promises";
import path from "path";
const FILE = path.join(process.cwd(), "data", "feed-posts.json");

export type FeedPost = {
  id: string;
  discordId: string;
  authorName: string;
  authorSlug: string;
  avatar: string;
  content: string;
  createdAt: string;
  likedBy: string[];
};

type Store = { posts: FeedPost[] };

async function readStore(): Promise<Store> {
  try {
    await mkdir(path.dirname(FILE), { recursive: true });
    return JSON.parse(await readFile(FILE, "utf8")) as Store;
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

export async function createFeedPost(input: {
  discordId: string;
  username: string;
  mcNick?: string | null;
  avatar: string;
  content: string;
}): Promise<FeedPost> {
  const text = input.content.trim();
  if (text.length < 1 || text.length > 2000) {
    throw new Error("invalid_content");
  }

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
  };

  const store = await readStore();
  store.posts.unshift(post);
  if (store.posts.length > 200) {
    store.posts = store.posts.slice(0, 200);
  }
  await writeStore(store);
  return post;
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
