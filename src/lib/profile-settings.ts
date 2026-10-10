import { mkdir, readFile, writeFile } from "fs/promises";
import path from "path";

const FILE = path.join(process.cwd(), "data", "profile-settings.json");

export const BANNER_PRESETS = {
  default: "",
  solar: "linear-gradient(135deg, #fff200 0%, #ff9500 45%, #1a1200 100%)",
  dusk: "linear-gradient(160deg, #2d1b4e 0%, #ff6b35 55%, #0d0d0d 100%)",
  ocean: "linear-gradient(145deg, #0ea5e9 0%, #0369a1 50%, #0c1222 100%)",
  forest: "linear-gradient(145deg, #22c55e 0%, #14532d 55%, #0a0f0a 100%)",
} as const;

export type BannerPreset = keyof typeof BANNER_PRESETS;

export type ProfileSettings = {
  discordId: string;
  bio: string;
  bannerPreset: BannerPreset;
  bannerUrl: string | null;
  updatedAt: string;
};

type Store = Record<string, ProfileSettings>;

async function readStore(): Promise<Store> {
  try {
    return JSON.parse(await readFile(FILE, "utf8")) as Store;
  } catch {
    return {};
  }
}

async function writeStore(store: Store) {
  await mkdir(path.dirname(FILE), { recursive: true });
  await writeFile(FILE, JSON.stringify(store, null, 2), "utf8");
}

export async function getProfileSettings(discordId: string): Promise<ProfileSettings> {
  const store = await readStore();
  return (
    store[discordId] ?? {
      discordId,
      bio: "",
      bannerPreset: "default",
      bannerUrl: null,
      updatedAt: new Date(0).toISOString(),
    }
  );
}

export async function updateProfileSettings(
  discordId: string,
  patch: { bio?: string; bannerPreset?: BannerPreset; bannerUrl?: string | null },
): Promise<ProfileSettings> {
  const store = await readStore();
  const prev = await getProfileSettings(discordId);
  const bio =
    patch.bio !== undefined
      ? patch.bio.trim().slice(0, 500)
      : prev.bio;
  const bannerPreset = patch.bannerPreset ?? prev.bannerPreset;
  const bannerUrl =
    patch.bannerUrl !== undefined ? patch.bannerUrl : prev.bannerUrl;

  const next: ProfileSettings = {
    discordId,
    bio,
    bannerPreset: bannerPreset in BANNER_PRESETS ? bannerPreset : "default",
    bannerUrl,
    updatedAt: new Date().toISOString(),
  };
  store[discordId] = next;
  await writeStore(store);
  return next;
}

export function resolveBannerStyle(settings: ProfileSettings): {
  backgroundImage: string;
  backgroundSize?: string;
  backgroundPosition?: string;
} {
  if (settings.bannerUrl) {
    return {
      backgroundImage: `url(${settings.bannerUrl})`,
      backgroundSize: "cover",
      backgroundPosition: "center",
    };
  }
  const preset = BANNER_PRESETS[settings.bannerPreset] || BANNER_PRESETS.default;
  if (!preset) {
    return {
      backgroundImage: "linear-gradient(135deg, rgba(255,242,0,0.25) 0%, transparent 60%)",
    };
  }
  return { backgroundImage: preset };
}
