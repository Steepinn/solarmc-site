/** Разрешённые хосты для доказательств (скрин/видео) */
const ALLOWED_HOST_SUFFIXES = [
  "imgur.com",
  "i.imgur.com",
  "youtube.com",
  "youtu.be",
  "youtube-nocookie.com",
  "streamable.com",
  "medal.tv",
  "clip.medal.tv",
  "gyazo.com",
  "i.gyazo.com",
  "prnt.sc",
  "prntscr.com",
  "lightshot.com",
  "discord.com",
  "cdn.discordapp.com",
  "media.discordapp.net",
  "drive.google.com",
  "docs.google.com",
  "dropbox.com",
  "dl.dropboxusercontent.com",
  "pastebin.com",
  "pastes.io",
  "mclo.gs",
  "logs.mclo.gs",
  "tiktok.com",
  "vm.tiktok.com",
  "vimeo.com",
  "rutube.ru",
  "vk.com",
  "vkvideo.ru",
];

export function isAllowedEvidenceHost(hostname: string): boolean {
  const host = hostname.toLowerCase().replace(/^www\./, "");
  return ALLOWED_HOST_SUFFIXES.some(
    (allowed) => host === allowed || host.endsWith(`.${allowed}`),
  );
}

export function parseEvidenceUrls(input: unknown): {
  urls: string[];
  error?: string;
} {
  const raw = Array.isArray(input)
    ? input.map((x) => String(x ?? "").trim()).filter(Boolean)
    : String(input ?? "")
        .split(/[\n,\s]+/)
        .map((s) => s.trim())
        .filter(Boolean);

  if (raw.length > 5) {
    return { urls: [], error: "too_many_evidence" };
  }

  const urls: string[] = [];
  for (const item of raw) {
    let url: URL;
    try {
      url = new URL(item);
    } catch {
      return { urls: [], error: "invalid_evidence_url" };
    }
    if (url.protocol !== "https:" && url.protocol !== "http:") {
      return { urls: [], error: "invalid_evidence_url" };
    }
    if (!isAllowedEvidenceHost(url.hostname)) {
      return { urls: [], error: "evidence_host_not_allowed" };
    }
    urls.push(url.toString());
  }

  return { urls };
}

export const EVIDENCE_HINT =
  "Imgur, YouTube, Streamable, Medal, Gyazo, Lightshot, Discord CDN, Google Drive, Dropbox, mclo.gs";
