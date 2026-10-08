import botSync from "@/config/bot-sync.json";

const LOCAL_MAP_FALLBACK = "http://localhost:8100/";

function normalizeMapUrl(url: string) {
  const trimmed = url.trim();
  return trimmed.endsWith("/") ? trimmed : `${trimmed}/`;
}

function isLocalDevHost() {
  if (typeof window !== "undefined") {
    const h = window.location.hostname;
    return h === "localhost" || h === "127.0.0.1";
  }
  const site = process.env.SITE_URL ?? process.env.NEXT_PUBLIC_SITE_URL ?? "";
  return (
    process.env.NODE_ENV === "development" ||
    /localhost|127\.0\.0\.1/.test(site)
  );
}

/** Прямой URL BlueMap (новая вкладка). */
export function getMapExternalUrl() {
  if (typeof window !== "undefined") {
    const pub = process.env.NEXT_PUBLIC_MAP_URL?.trim();
    if (pub) {
      const h = window.location.hostname;
      if (
        (h === "localhost" || h === "127.0.0.1") &&
        /127\.0\.0\.1|localhost/.test(pub)
      ) {
        return `http://${h}:8100/`;
      }
      return normalizeMapUrl(pub);
    }
    if (isLocalDevHost()) {
      return `http://${window.location.hostname}:8100/`;
    }
  } else {
    const server =
      process.env.MAP_UPSTREAM?.trim() ||
      process.env.NEXT_PUBLIC_MAP_URL?.trim();
    if (server) return normalizeMapUrl(server);
    if (isLocalDevHost()) return LOCAL_MAP_FALLBACK;
  }

  const fromSync = botSync.serverInfo.dynmap?.trim();
  if (fromSync) return normalizeMapUrl(fromSync);
  return LOCAL_MAP_FALLBACK;
}

/** Same-origin прокси — нужен, чтобы кастомный курсор работал поверх карты */
export function getMapEmbedUrl() {
  return "/bluemap";
}

export function getMapUpstream() {
  const raw =
    process.env.MAP_UPSTREAM?.trim() ||
    process.env.NEXT_PUBLIC_MAP_URL?.trim() ||
    (isLocalDevHost() ? LOCAL_MAP_FALLBACK : botSync.serverInfo.dynmap) ||
    LOCAL_MAP_FALLBACK;
  return normalizeMapUrl(raw).replace(/\/$/, "");
}
