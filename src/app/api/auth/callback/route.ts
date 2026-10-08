import { NextRequest, NextResponse } from "next/server";
import {
  attachSessionCookie,
  buildSessionUser,
  createSessionToken,
  fetchGuildMember,
  fetchGuildMemberByBot,
  getDiscordRedirectUri,
} from "@/lib/auth";
import {
  completeLauncherDevice,
  failLauncherDevice,
  parseLauncherState,
} from "@/lib/launcher-auth";

export async function GET(req: NextRequest) {
  const origin = req.nextUrl.origin;
  const code = req.nextUrl.searchParams.get("code");
  const error = req.nextUrl.searchParams.get("error");
  const launcherDevice = parseLauncherState(req.nextUrl.searchParams.get("state"));

  if (error || !code) {
    if (launcherDevice) {
      await failLauncherDevice(launcherDevice, error ?? "no_code");
      return NextResponse.redirect(`${origin}/launcher/done?ok=0&error=${error ?? "no_code"}`);
    }
    return NextResponse.redirect(
      `${origin}/auth/discord?login=fail&error=${error ?? "no_code"}`,
    );
  }

  const clientId = process.env.DISCORD_CLIENT_ID;
  const clientSecret = process.env.DISCORD_CLIENT_SECRET;
  const redirectUri = getDiscordRedirectUri(origin);

  if (!clientId || !clientSecret) {
    if (launcherDevice) {
      await failLauncherDevice(launcherDevice, "oauth_not_configured");
      return NextResponse.redirect(`${origin}/launcher/done?ok=0&error=oauth_not_configured`);
    }
    return NextResponse.redirect(`${origin}/auth/discord?login=fail&error=oauth_not_configured`);
  }

  const tokenRes = await fetch("https://discord.com/api/oauth2/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      grant_type: "authorization_code",
      code,
      redirect_uri: redirectUri,
    }),
  });

  if (!tokenRes.ok) {
    if (launcherDevice) {
      await failLauncherDevice(launcherDevice, "token_failed");
      return NextResponse.redirect(`${origin}/launcher/done?ok=0&error=token_failed`);
    }
    return NextResponse.redirect(`${origin}/auth/discord?login=fail&error=token_failed`);
  }

  const tokenData = (await tokenRes.json()) as { access_token: string };

  const userRes = await fetch("https://discord.com/api/users/@me", {
    headers: { Authorization: `Bearer ${tokenData.access_token}` },
  });

  if (!userRes.ok) {
    if (launcherDevice) {
      await failLauncherDevice(launcherDevice, "user_failed");
      return NextResponse.redirect(`${origin}/launcher/done?ok=0&error=user_failed`);
    }
    return NextResponse.redirect(`${origin}/auth/discord?login=fail&error=user_failed`);
  }

  const user = (await userRes.json()) as {
    id: string;
    username: string;
    global_name?: string;
    avatar?: string;
  };

  let botMember = await fetchGuildMember(user.id, tokenData.access_token);
  const viaBot = await fetchGuildMemberByBot(user.id);
  if (viaBot) botMember = viaBot;

  const avatar = user.avatar
    ? `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png`
    : "/logo.png";

  const sessionUser = await buildSessionUser({
    id: user.id,
    username: user.username,
    globalName: user.global_name,
    avatar,
    roles: botMember?.roles,
    discordNick: botMember?.nick,
  });

  const { isUserBlocked } = await import("@/lib/site-blocks");
  if (await isUserBlocked(sessionUser.discordId)) {
    if (launcherDevice) {
      await failLauncherDevice(launcherDevice, "blocked");
      return NextResponse.redirect(`${origin}/launcher/done?ok=0&error=blocked`);
    }
    return NextResponse.redirect(`${origin}/?login=fail&error=blocked`);
  }

  const { upsertSiteUser, profilePath } = await import("@/lib/site-users");
  await upsertSiteUser({
    discordId: sessionUser.discordId,
    username: sessionUser.username,
    mcNick: sessionUser.mcNick,
    avatar: sessionUser.avatar,
  });

  const token = await createSessionToken(sessionUser);

  const finish = (url: string) => {
    const res = NextResponse.redirect(url);
    attachSessionCookie(res, token);
    return res;
  };

  if (launcherDevice) {
    const nick = sessionUser.mcNick?.trim();
    if (!nick) {
      await failLauncherDevice(launcherDevice, "no_mc_nick");
      return finish(`${origin}/launcher/done?ok=0&error=no_mc_nick`);
    }
    await completeLauncherDevice(launcherDevice, sessionUser, nick);
    return finish(`${origin}/launcher/done?ok=1&nick=${encodeURIComponent(nick)}`);
  }

  const to = profilePath({
    mcNick: sessionUser.mcNick,
    discordId: sessionUser.discordId,
    username: sessionUser.username,
  });
  return finish(`${origin}${to}?login=ok`);
}
