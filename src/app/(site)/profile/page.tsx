import { redirect } from "next/navigation";
import { getEnrichedSession } from "@/lib/auth";
import { profilePath } from "@/lib/site-users";

export const metadata = { title: "Профиль" };

/** Единый профиль = /u/[slug]. Кабинет просто ведёт туда. */
export default async function ProfilePage() {
  const session = await getEnrichedSession();
  if (!session) redirect("/auth/discord");

  redirect(
    profilePath({
      mcNick: session.mcNick,
      discordId: session.discordId,
      username: session.username,
    }),
  );
}
