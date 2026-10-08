"use client";

import { useState } from "react";
import { Check, Sparkles, Sun, Infinity as InfinityIcon } from "lucide-react";
import { ContentCard } from "@/components/page-shell";
import {
  formatShopPrice,
  shopDurations,
  shopItems,
  shopPlans,
  type ShopDuration,
  type ShopItem,
  type ShopPlan,
} from "@/lib/shop-catalog";
import { cn } from "@/lib/utils";

export function ShopPageClient() {
  const [duration, setDuration] = useState<ShopDuration>("1m");
  const [notice, setNotice] = useState("");

  function selectPlan(plan: ShopPlan) {
    const label = shopDurations.find((d) => d.id === duration)?.label ?? "";
    setNotice(
      `Выбрано: ${plan.name} · ${label}. Оформление заказа скоро откроется.`,
    );
  }

  function selectItem(item: ShopItem) {
    setNotice(
      `Выбрано: «${item.name}». Оформление заказа скоро откроется.`,
    );
  }

  return (
    <div className="space-y-8">
      <section className="space-y-4">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="font-display text-xl font-bold sm:text-2xl">
              Подписки SONNE
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Только QoL и стиль (как на сервере). Без полёта, хила и лишнего лута.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {shopDurations.map((d) => (
            <button
              key={d.id}
              type="button"
              onClick={() => setDuration(d.id)}
              className={cn(
                "rounded-xl border px-3.5 py-2 text-left transition-colors",
                duration === d.id
                  ? "border-solar-gold/50 bg-solar-gold/15 text-foreground"
                  : "border-border bg-card/60 text-muted-foreground hover:bg-accent",
              )}
            >
              <span className="block text-sm font-semibold">{d.label}</span>
              <span className="block text-[11px] opacity-70">{d.hint}</span>
            </button>
          ))}
        </div>

        <div className="grid gap-5 lg:grid-cols-2">
          {shopPlans.map((plan) => (
            <PlanCard
              key={plan.id}
              plan={plan}
              duration={duration}
              onSelect={() => selectPlan(plan)}
            />
          ))}
        </div>
      </section>

      <section className="space-y-4">
        <div>
          <h2 className="font-display text-xl font-bold sm:text-2xl">
            Для души персонажа
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Разовые штуки, которые меняют твой путь в сезоне.
          </p>
        </div>

        <div className="grid gap-5 lg:grid-cols-2">
          {shopItems.map((item) => (
            <ItemCard
              key={item.id}
              item={item}
              onSelect={() => selectItem(item)}
            />
          ))}
        </div>
      </section>

      {notice ? (
        <p className="rounded-xl border border-solar-gold/30 bg-solar-gold/10 px-4 py-3 text-sm text-foreground">
          {notice}
        </p>
      ) : (
        <p className="text-sm text-muted-foreground">
          Это витрина: можно выбрать тариф и посмотреть привилегии. Оформление
          покупки подключим позже.
        </p>
      )}
    </div>
  );
}

function ItemCard({
  item,
  onSelect,
}: {
  item: ShopItem;
  onSelect: () => void;
}) {
  return (
    <ContentCard className="flex h-full flex-col border-solar-gold/25 bg-gradient-to-br from-solar-gold/10 via-transparent to-amber-700/5">
      <p className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-solar-gold">
        <Sparkles className="size-3.5" />
        Разовый предмет
      </p>
      <h3 className="font-display mt-2 text-2xl font-bold tracking-tight">
        {item.name}
      </h3>
      <p className="mt-1 text-sm font-medium text-solar-gold/90">
        {item.tagline}
      </p>
      <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
        {item.description}
      </p>
      <ul className="mt-4 flex-1 space-y-2">
        {item.privileges.map((privilege) => (
          <li
            key={privilege}
            className="flex items-start gap-2 text-sm text-foreground/90"
          >
            <Check className="mt-0.5 size-4 shrink-0 text-solar-gold" />
            <span>{privilege}</span>
          </li>
        ))}
      </ul>
      <div className="mt-5 rounded-2xl border border-border bg-card/70 px-4 py-4 text-center">
        <p className="text-xs uppercase tracking-wide text-muted-foreground">
          Цена
        </p>
        <p className="font-display mt-1 text-3xl font-bold text-solar-gold">
          {formatShopPrice(item.price)}
        </p>
        <button
          type="button"
          className="btn-primary mt-4 w-full"
          onClick={onSelect}
        >
          Выбрать
        </button>
      </div>
    </ContentCard>
  );
}

function PlanCard({
  plan,
  duration,
  onSelect,
}: {
  plan: ShopPlan;
  duration: ShopDuration;
  onSelect: () => void;
}) {
  const price = plan.prices[duration];
  const durationLabel =
    shopDurations.find((d) => d.id === duration)?.label ?? "";
  const isPlus = plan.id === "sonne_plus";

  return (
    <ContentCard
      className={cn(
        "flex h-full flex-col",
        isPlus && "border-solar-gold/40 shadow-[0_0_0_1px_rgb(255_242_0/0.08)]",
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.16em] text-solar-gold">
            {isPlus ? (
              <InfinityIcon className="size-3.5" />
            ) : (
              <Sun className="size-3.5" />
            )}
            Подписка
          </p>
          <h3 className="font-display mt-1.5 text-2xl font-bold tracking-tight">
            {plan.name}
          </h3>
          <p className="mt-1 text-sm text-muted-foreground">{plan.tagline}</p>
        </div>
        {isPlus ? (
          <span className="rounded-full bg-solar-gold/20 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-solar-gold">
            Лучший выбор
          </span>
        ) : null}
      </div>

      <div className="mt-5 rounded-xl border border-border/80 bg-muted/20 px-4 py-3">
        <p className="text-xs text-muted-foreground">{durationLabel}</p>
        <p className="font-display text-3xl font-bold text-solar-gold">
          {formatShopPrice(price)}
        </p>
      </div>

      <ul className="mt-5 flex-1 space-y-2.5">
        {plan.privileges.map((p) => (
          <li key={p} className="flex items-start gap-2 text-sm">
            <Check className="mt-0.5 size-4 shrink-0 text-solar-gold" />
            <span>{p}</span>
          </li>
        ))}
      </ul>

      <button type="button" className="btn-primary mt-6 w-full" onClick={onSelect}>
        Выбрать {plan.name}
      </button>
    </ContentCard>
  );
}
