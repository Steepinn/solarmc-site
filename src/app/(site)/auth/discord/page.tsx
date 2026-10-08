import { Suspense } from "react";
import { headers } from "next/headers";
import { getDiscordRedirectUri } from "@/lib/auth";
import DiscordAuthPage from "./discord-auth-client";

export const metadata = { title: "Авторизация" };

async function getRequestOrigin() {
  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host") ?? "localhost:3000";
  const proto =
    h.get("x-forwarded-proto") ??
    (host.includes("localhost") || host.startsWith("127.") ? "http" : "https");
  return `${proto}://${host}`;
}

export default async function Page() {
  const origin = await getRequestOrigin();
  const redirectUri = getDiscordRedirectUri(origin);
  const clientId = process.env.DISCORD_CLIENT_ID ?? "";
  const hasSecret = Boolean(process.env.DISCORD_CLIENT_SECRET?.trim());

  return (
    <Suspense fallback={<p className="p-8 text-muted-foreground">Загрузка...</p>}>
      <DiscordAuthPage
        redirectUri={redirectUri}
        clientId={clientId}
        hasSecret={hasSecret}
      />
    </Suspense>
  );
}
