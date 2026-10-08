"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { siteConfig } from "@/config/site";

const hourOptions = ["До 1 часа", "От 1 до 3 часов", "От 3 до 5 часов", "6+ часов"];
const yesNo = ["Да", "Нет"];

export function ApplicationForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [rulesAgreed, setRulesAgreed] = useState(false);
  const [ageConfirmed, setAgeConfirmed] = useState(false);
  const [form, setForm] = useState({
    mcNick: "",
    realName: "",
    age: "",
    hobby: "",
    source: "",
    aboutSelf: "",
    experience: "",
    plans: "",
    rulesRead: "Да",
    weekdayHours: hourOptions[1],
    weekendHours: hourOptions[2],
    ideaKnown: "Да",
  });

  const update = (key: string, value: string) =>
    setForm((f) => ({ ...f, [key]: value }));

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((d) => {
        const nick = d.user?.mcNick?.trim();
        if (nick) setForm((f) => (f.mcNick ? f : { ...f, mcNick: nick }));
      })
      .catch(() => undefined);
  }, []);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!rulesAgreed || !ageConfirmed) {
      setError("Подтверди согласие с правилами и возраст 14+");
      return;
    }
    setLoading(true);
    setError("");

    const res = await fetch("/api/applications", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, rulesAgreed, ageConfirmed }),
    });

    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      if (data.error === "not_in_guild") {
        setError("__not_in_guild__");
      } else {
        const errors: Record<string, string> = {
          unauthorized: "Войди через Discord",
          pending_exists: "У тебя уже есть заявка на рассмотрении",
          cooldown: "Можно подать новую заявку через 24 часа",
          already_whitelisted: "У тебя уже есть проходка",
          agreement_required: "Нужно подтвердить правила и возраст",
          age_min_14: "Минимальный возраст — 14 лет",
        };
        setError(errors[data.error] ?? "Не удалось отправить заявку");
      }
      return;
    }

    const id = data.application?.id as string | undefined;
    router.push(id ? `/applications/${id}` : "/applications?sent=1");
    router.refresh();
  }

  return (
    <form onSubmit={submit} className="space-y-5">
      <div className="rounded-xl border border-border bg-muted/20 p-4 text-sm text-muted-foreground">
        <p>
          После отправки в Discord появится канал{" "}
          <strong className="text-foreground">заявка-N</strong> с кнопками одобрения (как у
          SOLARBOT). Переписка с модераторами —{" "}
          <strong className="text-foreground">на сайте</strong>. Нужно быть на{" "}
          <a
            href={siteConfig.links.discord}
            target="_blank"
            rel="noopener noreferrer"
            className="text-solar-gold hover:underline"
          >
            Discord-сервере Solar
          </a>{" "}
          и привязать MC через <strong className="text-foreground">/dslink</strong>.
        </p>
        <p className="mt-2">
          <Link href="/docs/informaciya/rules" className="text-solar-gold hover:underline">
            Правила проекта
          </Link>{" "}
          — обязательны к прочтению.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {[
          { key: "mcNick", label: "Ник в Minecraft", placeholder: "Steve" },
          { key: "realName", label: "Имя", placeholder: "Как к тебе обращаться" },
          { key: "age", label: "Возраст", placeholder: "16", type: "number" },
          { key: "source", label: "Откуда узнал о Solar?", placeholder: "YouTube, друг..." },
        ].map((field) => (
          <label key={field.key} className="block sm:col-span-1">
            <span className="text-sm font-medium">{field.label}</span>
            <input
              required
              type={field.type ?? "text"}
              min={field.type === "number" ? 14 : undefined}
              value={form[field.key as keyof typeof form]}
              onChange={(e) => update(field.key, e.target.value)}
              placeholder={field.placeholder}
              className="input-field mt-1.5 w-full"
            />
          </label>
        ))}
      </div>

      {[
        { key: "hobby", label: "Хобби / спорт", placeholder: "Строительство, футбол..." },
        { key: "aboutSelf", label: "О себе", placeholder: "Кратко о себе и стиле игры" },
        { key: "experience", label: "Опыт в Minecraft", placeholder: "Vanilla, моды, сервера..." },
        { key: "plans", label: "Планы на сервере", placeholder: "Город, ферма, торговля..." },
      ].map((field) => (
        <label key={field.key} className="block">
          <span className="text-sm font-medium">{field.label}</span>
          <textarea
            required
            rows={2}
            value={form[field.key as keyof typeof form]}
            onChange={(e) => update(field.key, e.target.value)}
            placeholder={field.placeholder}
            className="input-field mt-1.5 w-full resize-y"
          />
        </label>
      ))}

      <div className="grid gap-4 sm:grid-cols-2">
        {[
          { key: "rulesRead", label: "Прочитал правила?", options: yesNo },
          { key: "weekdayHours", label: "Часы в будни", options: hourOptions },
          { key: "weekendHours", label: "Часы в выходные", options: hourOptions },
          { key: "ideaKnown", label: "Знаешь идею проекта?", options: yesNo },
        ].map((field) => (
          <label key={field.key} className="block">
            <span className="text-sm font-medium">{field.label}</span>
            <select
              value={form[field.key as keyof typeof form]}
              onChange={(e) => update(field.key, e.target.value)}
              className="input-field mt-1.5 w-full"
            >
              {field.options.map((o) => (
                <option key={o} value={o}>
                  {o}
                </option>
              ))}
            </select>
          </label>
        ))}
      </div>

      <div className="space-y-3 rounded-xl border border-solar-gold/20 bg-solar-gold/5 p-4">
        <label className="flex cursor-pointer items-start gap-3 text-sm">
          <input
            type="checkbox"
            checked={rulesAgreed}
            onChange={(e) => setRulesAgreed(e.target.checked)}
            className="mt-1 size-4 rounded border-border accent-solar-gold"
          />
          <span>
            Я согласен с{" "}
            <Link href="/docs/informaciya/rules" className="text-solar-gold hover:underline">
              правилами проекта
            </Link>{" "}
            и готов их соблюдать.
          </span>
        </label>
        <label className="flex cursor-pointer items-start gap-3 text-sm">
          <input
            type="checkbox"
            checked={ageConfirmed}
            onChange={(e) => setAgeConfirmed(e.target.checked)}
            className="mt-1 size-4 rounded border-border accent-solar-gold"
          />
          <span>Подтверждаю, что мне исполнилось 14 лет.</span>
        </label>
      </div>

      {error === "__not_in_guild__" ? (
        <p className="text-sm text-red-400">
          Сначала зайди на{" "}
          <a
            href={siteConfig.links.discord}
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-solar-gold underline hover:no-underline"
          >
            Discord-сервер Solar
          </a>
        </p>
      ) : error ? (
        <p className="text-sm text-red-400">{error}</p>
      ) : null}

      <button type="submit" disabled={loading} className="btn-primary w-full text-base">
        {loading ? "Отправка..." : "Подать заявку"}
      </button>
    </form>
  );
}
