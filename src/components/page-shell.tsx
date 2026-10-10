import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type PageShellProps = {
  title: string;
  description?: string;
  eyebrow?: string;
  children?: ReactNode;
  className?: string;
};

export function PageShell({
  title,
  description,
  eyebrow,
  children,
  className,
}: PageShellProps) {
  return (
    <div
      className={cn(
        "relative z-[1] mx-auto max-w-[1400px] min-w-0 px-3 py-3 sm:px-4 sm:py-5",
        className,
      )}
    >
      <div className="panel-surface rounded-2xl px-4 py-3 sm:px-7 sm:py-5">
        {eyebrow && (
          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-solar-gold sm:text-xs">
            {eyebrow}
          </p>
        )}
        <h1
          className={cn(
            "font-display text-2xl font-bold tracking-tight break-words sm:text-3xl lg:text-4xl",
            eyebrow ? "mt-1" : undefined,
          )}
        >
          {title}
        </h1>
        {description && (
          <p className="user-content mt-1.5 max-w-3xl text-sm leading-relaxed text-muted-foreground sm:text-base lg:text-lg">
            {description}
          </p>
        )}
      </div>
      {children && <div className="mt-3 min-w-0 sm:mt-4">{children}</div>}
    </div>
  );
}

export function ContentCard({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "panel-surface min-w-0 rounded-2xl p-4 sm:p-6",
        className,
      )}
    >
      {children}
    </div>
  );
}

export function StatGrid({
  items,
}: {
  items: { label: string; value: string; hint?: string }[];
}) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {items.map((item) => (
        <ContentCard key={item.label}>
          <p className="text-sm text-muted-foreground">{item.label}</p>
          <p className="mt-1 font-display text-2xl font-bold">{item.value}</p>
          {item.hint && (
            <p className="mt-1 text-xs text-muted-foreground">{item.hint}</p>
          )}
        </ContentCard>
      ))}
    </div>
  );
}
