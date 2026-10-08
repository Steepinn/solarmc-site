import { Suspense } from "react";
import { headers } from "next/headers";
import {
  buildPublicOrigin,
  getDiscordRedirectUri,
  getEnvDiscordRedirectUri,
} from "@/lib/auth";
import DiscordAuthPage from "./discord-auth-client";

export const metadata = { title: "Авторизация" };

async function getRequestOrigin() {
  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host") ?? "localhost:3000";
  return buildPublicOrigin(host, h.get("x-forwarded-proto"), `http://${host}`);
}

export default async function Page() {
  const origin = await getRequestOrigin();
  const redirectUri = getDiscordRedirectUri(origin);
  const envRedirectUri = getEnvDiscordRedirectUri();
  const clientId = process.env.DISCORD_CLIENT_ID ?? "";
  const hasSecret = Boolean(process.env.DISCORD_CLIENT_SECRET?.trim());

  return (
    <Suspense fallback={<p className="p-8 text-muted-foreground">Загрузка...</p>}>
      <DiscordAuthPage
        redirectUri={redirectUri}
        envRedirectUri={envRedirectUri}
        clientId={clientId}
        hasSecret={hasSecret}
      />
    </Suspense>
  );
}
