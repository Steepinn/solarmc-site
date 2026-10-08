import Image from "next/image";
import { ContentCard, PageShell } from "@/components/page-shell";

const team = [
  { name: "Steepy3", role: "ровынй типок", color: "text-emerald-400" },
  { name: "tyuere", role: "говноед вася", color: "text-amber-400" },
];

export const metadata = { title: "Команда" };
export const dynamic = "force-static";

export default function TeamPage() {
  return (
    <PageShell
      title="Команда"
      description="Люди, которые следят за атмосферой и развитием SolarMC."
      eyebrow="О проекте"
    >
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {team.map((member) => (
          <ContentCard key={member.name} className="flex items-center gap-4">
            <div className="flex size-14 items-center justify-center rounded-xl bg-solar-yellow/10">
              <Image src="/logo.png" alt="" width={32} height={32} />
            </div>
            <div>
              <p className="font-semibold">{member.name}</p>
              <p className={`text-sm ${member.color}`}>{member.role}</p>
            </div>
          </ContentCard>
        ))}
      </div>
    </PageShell>
  );
}
