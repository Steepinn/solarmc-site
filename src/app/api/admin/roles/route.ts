import { NextRequest, NextResponse } from "next/server";
import { getEnrichedSession } from "@/lib/auth";
import { filterDirectory, listAdminDirectory } from "@/lib/admin-directory";
import {
  getSiteRoleKeys,
  setSiteRoleKeys,
} from "@/lib/site-roles";
import { projectRoles, type ProjectRoleKey } from "@/lib/roles";

export async function GET(req: NextRequest) {
  const session = await getEnrichedSession();
  if (!session?.isAdmin) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  const q = req.nextUrl.searchParams.get("q")?.trim() ?? "";
  const directory = filterDirectory(await listAdminDirectory(), q);

  const users = [];
  for (const u of directory) {
    if (!u.discordId) continue; // роли только у Discord-аккаунтов
    const roles = await getSiteRoleKeys(u.discordId);
    users.push({
      discordId: u.discordId,
      username: u.username,
      mcNick: u.mcNick,
      avatar: u.avatar,
      sources: u.sources,
      roles,
    });
  }

  return NextResponse.json({
    users,
    total: users.length,
    me: session.discordId,
    roles: Object.entries(projectRoles).map(([key, v]) => ({
      key,
      label: v.label,
      siteManaged: true,
    })),
  });
}

export async function POST(req: NextRequest) {
  const session = await getEnrichedSession();
  if (!session?.isAdmin) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  const { discordId, roles } = (await req.json()) as {
    discordId?: string;
    roles?: ProjectRoleKey[];
  };

  if (!discordId?.trim() || !Array.isArray(roles)) {
    return NextResponse.json({ error: "invalid" }, { status: 400 });
  }

  const saved = await setSiteRoleKeys(discordId.trim(), roles);
  return NextResponse.json({ ok: true, roles: saved });
}
