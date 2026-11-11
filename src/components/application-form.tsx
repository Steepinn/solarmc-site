"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { siteConfig } from "@/config/site";

const hourOptions = ["До 1 часа", "От 1 до 3 часов", "От 3 до 5 часов", "6+ часов"];
const yesNo = ["Да", "Нет"];

export function ApplicationForm() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const formRef = useRef<HTMLFormElement>(null);
  const stepTitles = ["Знакомство", "Твоя история", "Перед входом"];
  function nextStep() {
    const fields = formRef.current?.querySelectorAll<HTMLInputElement | HTMLTextAreaElement>("fieldset:not([disabled]) input, fieldset:not([disabled]) textarea");
    if (fields) for (const field of fields) if (!field.reportValidity()) return;
    setError("");
    setStep(current => Math.min(2, current + 1));
  }
  useEffect(() => {
    formRef.current?.querySelector<HTMLElement>("fieldset:not([disabled]) legend")?.focus();
  }, [step]);
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
    if (loading) return;
    if (step < 2) { nextStep(); return; }
    if (!rulesAgreed || !ageConfirmed) {
      setError("Подтверди согласие с правилами и возраст 14+");
      return;
    }
    setLoading(true);
    setError("");

    try {
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
    } catch {
      setError("Не удалось связаться с сервером. Ответы сохранены в форме — попробуй отправить ещё раз.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form ref={formRef} onSubmit={submit} className="solar-application-form space-y-5" aria-busy={loading}>
      <ol className="application-progress" aria-label="Этапы заявки">{stepTitles.map((title, index) => <li key={title} aria-current={index === step ? "step" : undefined} data-complete={index < step}><span>{index < step ? "✓" : `0${index + 1}`}</span><strong>{title}</strong></li>)}</ol>
      <p className="application-step-caption" role="status">Шаг {step + 1} из 3 · {stepTitles[step]}</p>
      <div className="rounded-xl border border-border bg-muted/20 p-4 text-sm text-muted-foreground">
        <p>
          Заполни анкету, чтобы мы могли познакомиться. После отправки следи за статусом и общайся с модераторами{" "}
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

      <fieldset disabled={step !== 0 || loading} hidden={step !== 0} className="application-fieldset space-y-5"><legend tabIndex={-1}>Давай познакомимся</legend><p className="application-help">Начнём с самого простого: как тебя зовут и как найти тебя в игре.</p>
      <div className="grid gap-4 sm:grid-cols-2">
        {[
          { key: "mcNick", label: "Ник в Minecraft", placeholder: "Steve" },
          { key: "realName", label: "Имя", placeholder: "Как к тебе обращаться" },
          { key: "age", label: "Возраст", placeholder: "16", type: "number" },
          { key: "source", label: "Откуда узнал о Solar?", placeholder: "YouTube, друг..." },
        ].map((field) => (
          <label key={field.key} htmlFor={`application-${field.key}`} className="block sm:col-span-1">
            <span className="text-sm font-medium">{field.label}</span>
            <input
              id={`application-${field.key}`}
              name={field.key}
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

      </fieldset>
      <fieldset disabled={step !== 1 || loading} hidden={step !== 1} className="application-fieldset space-y-5"><legend tabIndex={-1}>Теперь — твоя история</legend><p className="application-help">Расскажи своими словами. Нам интересно, какой ты игрок и что хочешь создать.</p>
      {[
        { key: "hobby", label: "Хобби / спорт", placeholder: "Строительство, футбол..." },
        { key: "aboutSelf", label: "О себе", placeholder: "Кратко о себе и стиле игры" },
        { key: "experience", label: "Опыт в Minecraft", placeholder: "Vanilla, моды, сервера..." },
        { key: "plans", label: "Планы на сервере", placeholder: "Город, ферма, торговля..." },
      ].map((field) => (
        <label key={field.key} htmlFor={`application-${field.key}`} className="block">
          <span className="text-sm font-medium">{field.label}</span>
          <textarea
            id={`application-${field.key}`}
            name={field.key}
            required
            rows={2}
            value={form[field.key as keyof typeof form]}
            onChange={(e) => update(field.key, e.target.value)}
            placeholder={field.placeholder}
            className="input-field mt-1.5 w-full resize-y"
          />
        </label>
      ))}

      </fieldset>
      <fieldset disabled={step !== 2 || loading} hidden={step !== 2} className="application-fieldset space-y-5"><legend tabIndex={-1}>Всё готово к знакомству?</legend><p className="application-help">Осталось рассказать о своём ритме игры и подтвердить правила.</p>
      <div className="grid gap-4 sm:grid-cols-2">
        {[
          { key: "rulesRead", label: "Прочитал правила?", options: yesNo },
          { key: "weekdayHours", label: "Часы в будни", options: hourOptions },
          { key: "weekendHours", label: "Часы в выходные", options: hourOptions },
          { key: "ideaKnown", label: "Знаешь идею проекта?", options: yesNo },
        ].map((field) => (
          <label key={field.key} htmlFor={`application-${field.key}`} className="block">
            <span className="text-sm font-medium">{field.label}</span>
            <select
              id={`application-${field.key}`}
              name={field.key}
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

      </fieldset>
      <div role="alert" aria-live="polite">
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

      </div>
      <div className="application-form-actions">
        {step > 0 && <button type="button" disabled={loading} onClick={() => { setStep(step - 1); setError(""); }} className="application-back">← Назад</button>}
        {step < 2 ? <button key="next" type="button" onClick={nextStep} className="btn-primary">Продолжить →</button> : <button key="submit" type="submit" disabled={loading} className="btn-primary">{loading ? "Отправляем заявку…" : "Отправить заявку ↗"}</button>}
      </div>
      <p className="application-help">Ответы сохраняются при переходе между шагами, пока открыта эта страница.</p>
    </form>
  );
}
