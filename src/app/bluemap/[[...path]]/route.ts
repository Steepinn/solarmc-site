import { NextRequest, NextResponse } from "next/server";
import { getMapUpstream } from "@/lib/map-config";

export const runtime = "nodejs";

type Params = { params: Promise<{ path?: string[] }> };

const PROXY_PREFIX = "/bluemap";
const ASSET_BUST = "s4";

function cachePolicy(path: string) {
  const lower = path.toLowerCase();
  if (lower.includes("/live/")) {
    return {
      fetchCache: "force-cache" as const,
      revalidate: 2,
      responseCache: "public, max-age=2, stale-while-revalidate=5",
    };
  }
  if (
    lower.includes("/tiles/") ||
    /\.(prbm|png|jpg|jpeg|webp|gif|svg|woff2?|ttf|otf)$/i.test(lower)
  ) {
    return {
      fetchCache: "force-cache" as const,
      revalidate: 3600,
      responseCache: "public, max-age=3600, stale-while-revalidate=86400",
    };
  }
  if (/\.(js|css|json|map)$/i.test(lower) && !lower.includes("/live/")) {
    return {
      fetchCache: "force-cache" as const,
      revalidate: 300,
      responseCache: "public, max-age=300, stale-while-revalidate=3600",
    };
  }
  return {
    fetchCache: "no-store" as const,
    revalidate: undefined as number | undefined,
    responseCache: "no-store",
  };
}

async function proxy(req: NextRequest, pathParts: string[] = []) {
  const upstreamBase = getMapUpstream();
  const path = pathParts.join("/");
  const target = path
    ? `${upstreamBase}/${path}${req.nextUrl.search}`
    : `${upstreamBase}/${req.nextUrl.search}`;

  const policy = cachePolicy(path);

  let upstream: Response;
  try {
    upstream = await fetch(target, {
      method: req.method,
      headers: {
        Accept: req.headers.get("accept") ?? "*/*",
        "User-Agent": "SolarMC-MapProxy/1.0",
      },
      cache: policy.fetchCache,
      next:
        policy.revalidate != null ? { revalidate: policy.revalidate } : undefined,
      redirect: "follow",
      signal: AbortSignal.timeout(45_000),
    });
  } catch {
    return NextResponse.json(
      {
        error: "map_unreachable",
        message:
          "Сервер карты не отвечает. Проверь, что BlueMap запущен (localhost:8100).",
        upstream: upstreamBase,
      },
      { status: 502 },
    );
  }

  const headers = new Headers();
  for (const key of [
    "content-type",
    "etag",
    "last-modified",
    "accept-ranges",
  ]) {
    const value = upstream.headers.get(key);
    if (value) headers.set(key, value);
  }
  headers.delete("x-frame-options");
  headers.delete("content-security-policy");
  headers.set("Cache-Control", policy.responseCache);

  const contentType = upstream.headers.get("content-type") ?? "";

  if (contentType.includes("text/html")) {
    let html = await upstream.text();
    if (!/<\s*base\s/i.test(html)) {
      html = html.replace(
        /<\s*head([^>]*)>/i,
        `<head$1><base href="${PROXY_PREFIX}/">`,
      );
    }
    if (!html.includes("solar-map-cursor")) {
      html = html.replace(
        /<\s*head([^>]*)>/i,
        `<head$1><style id="solar-map-cursor">
*,*::before,*::after,canvas{cursor:url("/cursors/sunrise/pointer.svg") 0 0,auto!important}
a,button,.svg-button,[role="button"]{cursor:url("/cursors/sunrise/link.svg") 0 0,pointer!important}
</style>`,
      );
    }
    html = html.replace(
      /(\.\/assets\/[^"']+\.(?:js|css))/g,
      `$1?${ASSET_BUST}`,
    );
    headers.delete("content-length");
    headers.set("Cache-Control", "no-store");
    return new NextResponse(html, { status: upstream.status, headers });
  }

  return new NextResponse(upstream.body, {
    status: upstream.status,
    headers,
  });
}

export async function GET(req: NextRequest, { params }: Params) {
  const { path = [] } = await params;
  return proxy(req, path);
}

export async function HEAD(req: NextRequest, { params }: Params) {
  const { path = [] } = await params;
  return proxy(req, path);
}
