import { existsSync } from "fs";
import path from "path";
import { Download } from "lucide-react";
import Link from "next/link";
import { ContentCard, PageShell } from "@/components/page-shell";
import { launcherBuilds, type LauncherBuild } from "@/config/launcher";
import { cn } from "@/lib/utils";

export const metadata = { title: "Лаунчер" };
export const dynamic = "force-dynamic";

function resolveHref(file: string): { href: string | null; ready: boolean } {
  if (/^https?:\/\//i.test(file)) {
    return { href: file, ready: true };
  }
  const rel = file.replace(/^\//, "");
  const abs = path.join(process.cwd(), "public", rel);
  if (!existsSync(abs)) {
    return { href: null, ready: false };
  }
  return { href: `/${rel}`, ready: true };
}

function BuildChoice({
  build,
  ready,
  href,
}: {
  build: LauncherBuild;
  ready: boolean;
  href: string | null;
}) {
  return (
    <ContentCard
      className={cn(
        "flex flex-col gap-4 transition-[border-color,box-shadow]",
        ready && "hover:border-solar-gold/40",
      )}
    >
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-solar-gold">
          {build.subtitle}
        </p>
        <h2 className="mt-1 font-display text-2xl font-bold tracking-tight">
          {build.title}
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          {build.description}
        </p>
        <p className="mt-2 text-xs text-muted-foreground">{build.hint}</p>
      </div>

      {ready && href ? (
        <a
          href={href}
          download
          className="btn-primary inline-flex w-full items-center justify-center gap-2 sm:w-auto"
        >
          <Download className="size-4" aria-hidden />
          Скачать
        </a>
      ) : (
        <p className="rounded-xl border border-dashed border-border px-4 py-3 text-sm text-muted-foreground">
          Файл ещё не залит. Скоро появится кнопка скачивания.
        </p>
      )}
    </ContentCard>
  );
}

export default function LauncherPage() {
  const builds = launcherBuilds.map((build) => {
    const { href, ready } = resolveHref(build.file);
    return { build, href, ready };
  });

  return (
    <PageShell
      title="Лаунчер"
      eyebrow="Скачать"
      description="Единственный способ зайти на SolarMC: скачай сборку под свой клиент и запускай мир из лаунчера."
    >
      <div className="grid gap-4 lg:grid-cols-2">
        {builds.map(({ build, href, ready }) => (
          <BuildChoice
            key={build.id}
            build={build}
            href={href}
            ready={ready}
          />
        ))}
      </div>

      <ContentCard className="mt-4">
        <p className="text-sm text-muted-foreground">
          После установки запускай сервер из лаунчера — он подставит адрес сам. Нужна проходка —{" "}
          <Link
            href="/applications"
            className="font-semibold text-solar-gold underline-offset-2 hover:underline"
          >
            подай заявку
          </Link>
          . Гайд по модам:{" "}
          <Link
            href="/docs/mods/client-mods"
            className="font-semibold text-solar-gold underline-offset-2 hover:underline"
          >
            клиентские моды
          </Link>
          .
        </p>
      </ContentCard>
    </PageShell>
  );
}
