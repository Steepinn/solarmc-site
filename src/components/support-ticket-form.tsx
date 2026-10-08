"use client";

import Link from "next/link";
import { useState } from "react";
import { EVIDENCE_HINT } from "@/lib/support-evidence";
import { supportCategoryLabels } from "@/lib/support-labels";
import type { SupportTicketCategory } from "@/lib/types";

const categories = Object.entries(supportCategoryLabels) as [
  SupportTicketCategory,
  string,
][];

function needsEvidenceHint(category: SupportTicketCategory) {
  return category === "report" || category === "bug";
}

export function SupportTicketForm({
  onCreated,
}: {
  onCreated?: (ticketId: string) => void;
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [category, setCategory] = useState<SupportTicketCategory>("question");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [evidence, setEvidence] = useState("");
  const [rulePoint, setRulePoint] = useState("");
  const [reportedPlayer, setReportedPlayer] = useState("");
  const [incidentDate, setIncidentDate] = useState("");
  const [incidentTime, setIncidentTime] = useState("");

  const isReport = category === "report";

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const res = await fetch("/api/support", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        category,
        subject,
        body,
        evidence,
        rulePoint: isReport ? rulePoint : undefined,
        reportedPlayer: isReport ? reportedPlayer : undefined,
        incidentDate: isReport ? incidentDate : undefined,
        incidentTime: isReport ? incidentTime : undefined,
      }),
    });
    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      const errors: Record<string, string> = {
        unauthorized: "Войди через Discord",
        not_in_guild: "Сначала зайди на Discord-сервер Solar",
        too_many_open: "У тебя уже 3 открытых тикета — закрой старые",
        invalid_subject: "Тема обязательна (до 120 символов)",
        invalid_body: "Опиши проблему подробнее (от 10 символов)",
        invalid_category: "Выбери категорию",
        missing_rule_point: "Укажи пункт правил, который нарушили",
        missing_reported_player: "Укажи ник нарушителя",
        missing_incident_time: "Укажи дату и время нарушения",
        invalid_incident_time: "Некорректные дата или время",
        incident_in_future: "Дата/время не могут быть в будущем",
        evidence_required: "Для жалобы нужны ссылки на доказательства",
        invalid_evidence_url: "Проверь ссылки — нужен полный URL",
        evidence_host_not_allowed: `Только известные сервисы: ${EVIDENCE_HINT}`,
        too_many_evidence: "Максимум 5 ссылок",
      };
      setError(errors[data.error] ?? "Не удалось создать тикет");
      return;
    }

    setSubject("");
    setBody("");
    setEvidence("");
    setRulePoint("");
    setReportedPlayer("");
    setIncidentDate("");
    setIncidentTime("");
    onCreated?.(data.ticket.id);
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <label className="block">
        <span className="text-sm font-medium">Категория</span>
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value as SupportTicketCategory)}
          className="input-field mt-1.5 w-full"
        >
          {categories.map(([key, label]) => (
            <option key={key} value={key}>
              {label}
            </option>
          ))}
        </select>
      </label>

      <label className="block">
        <span className="text-sm font-medium">Тема</span>
        <input
          required
          maxLength={120}
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          placeholder={
            isReport ? "Жалоба на игрока …" : "Кратко: что случилось"
          }
          className="input-field mt-1.5 w-full"
        />
      </label>

      {isReport ? (
        <div className="space-y-4 rounded-xl border border-amber-500/25 bg-amber-500/5 p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-amber-300">
            Жалоба — заполни обязательно
          </p>

          <label className="block">
            <span className="text-sm font-medium">Ник нарушителя</span>
            <input
              required
              maxLength={32}
              value={reportedPlayer}
              onChange={(e) => setReportedPlayer(e.target.value)}
              placeholder="Steve"
              className="input-field mt-1.5 w-full"
            />
          </label>

          <label className="block">
            <span className="text-sm font-medium">Пункт правил</span>
            <input
              required
              maxLength={80}
              value={rulePoint}
              onChange={(e) => setRulePoint(e.target.value)}
              placeholder="Например: 3.1 / читы / гриферство"
              className="input-field mt-1.5 w-full"
            />
            <span className="mt-1 block text-xs text-muted-foreground">
              Смотри{" "}
              <Link
                href="/docs/informaciya/rules"
                className="text-solar-gold hover:underline"
                target="_blank"
              >
                правила проекта
              </Link>
            </span>
          </label>

          <div className="grid gap-3 sm:grid-cols-2">
            <label className="block">
              <span className="text-sm font-medium">Дата нарушения</span>
              <input
                required
                type="date"
                value={incidentDate}
                onChange={(e) => setIncidentDate(e.target.value)}
                className="input-field mt-1.5 w-full"
              />
            </label>
            <label className="block">
              <span className="text-sm font-medium">Время нарушения</span>
              <input
                required
                type="time"
                value={incidentTime}
                onChange={(e) => setIncidentTime(e.target.value)}
                className="input-field mt-1.5 w-full"
              />
            </label>
          </div>
        </div>
      ) : null}

      <label className="block">
        <span className="text-sm font-medium">Описание</span>
        <textarea
          required
          rows={4}
          maxLength={4000}
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder={
            isReport
              ? "Что именно сделал нарушитель, где (координаты/город), детали"
              : "Ник, что произошло, детали"
          }
          className="input-field mt-1.5 w-full resize-y"
        />
      </label>

      <label className="block">
        <span className="text-sm font-medium">
          Доказательства (ссылки)
          {isReport ? " *" : needsEvidenceHint(category) ? " — желательно" : ""}
        </span>
        <textarea
          required={isReport}
          rows={3}
          value={evidence}
          onChange={(e) => setEvidence(e.target.value)}
          placeholder={"https://imgur.com/...\nhttps://youtu.be/..."}
          className="input-field mt-1.5 w-full resize-y font-mono text-sm"
        />
        <span className="mt-1 block text-xs text-muted-foreground">
          Одна ссылка на строку. Разрешено: {EVIDENCE_HINT}
        </span>
      </label>

      {error ? <p className="text-sm text-red-400">{error}</p> : null}

      <button type="submit" disabled={loading} className="btn-primary w-full">
        {loading ? "Отправка..." : "Создать тикет"}
      </button>
    </form>
  );
}
