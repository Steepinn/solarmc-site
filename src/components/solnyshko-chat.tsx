"use client";

import Link from "next/link";
import {
  FormEvent,
  type ReactNode,
  useEffect,
  useRef,
  useState,
} from "react";
import { Loader2, Send, Sun, X } from "lucide-react";
import { cn } from "@/lib/utils";

type ChatMsg = {
  id: string;
  role: "user" | "bot";
  text: string;
  sources?: { title: string; href: string }[];
  mode?: string;
  /** печатать по буквам */
  animate?: boolean;
};

const WELCOMES = [
  "Йо, друг ☀ Чем могу помочь по Solar?",
  "Привет-привет! Солнышко на связи — чё надо?",
  "Здарова ☀ Готов помочь: команды, донат, старт. Спрашивай.",
  "Хей! Я Солнышко. Кидай вопрос — отвечу коротко и по делу.",
  "Привет, чемпион. Что ищем: гайд, донат или команду?",
  "Опа, кто-то пришёл ☀ Ну давай, чем помочь?",
  "Салют! Я местный гайд по Solar. Вали вопрос.",
  "Добро пожаловать в чат ☀ Координаты данжей не сливаю, остальное — легко.",
];

const CHAT_STORAGE_KEY = "solarmc-solnyshko-chat-v1";
const CHAT_MAX = 24;

function loadStoredMessages(): ChatMsg[] | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(CHAT_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as ChatMsg[];
    if (!Array.isArray(parsed) || parsed.length === 0) return null;
    return parsed.slice(-CHAT_MAX).map((m) => ({ ...m, animate: false }));
  } catch {
    return null;
  }
}

function saveMessages(msgs: ChatMsg[]) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(msgs.slice(-CHAT_MAX)));
  } catch {
    /* quota */
  }
}

function pickWelcome(): ChatMsg {
  const text = WELCOMES[Math.floor(Math.random() * WELCOMES.length)]!;
  return { id: `welcome-${Date.now()}`, role: "bot", text, animate: true };
}

const PATH_LABELS: Record<string, string> = {
  "/launcher": "лаунчер",
  "/applications": "заявки",
  "/map": "карту",
  "/docs": "вики",
  "/shop": "магазин",
  "/status": "статус",
  "/support": "поддержку",
  "/ask": "вопросы модерам",
  "/report": "жалобу",
  "/api/auth/discord": "войти через Discord",
};

function labelForPath(path: string): string {
  const clean = path.replace(/\/+$/, "") || path;
  if (PATH_LABELS[clean]) return PATH_LABELS[clean]!;
  if (clean.startsWith("/docs/")) return "вики";
  if (clean.startsWith("/applications/")) return "заявку";
  return clean;
}

const SITE_PATH_RE =
  /(?<![\w/])(\/(?:api\/auth\/discord|applications(?:\/[\w-]+)?|docs(?:\/[\w\-./]+)*|launcher|map|shop|status|support|ask|report))(?![\w/])/gi;

const CMD_RE =
  /(?<![\w`/])(\/(?!applications\b|docs\b|map\b|shop\b|status\b|support\b|ask\b|report\b|launcher\b|api\/)[a-zA-Z][\w:-]*(?:\s+(?:"[^"]*"|'[^']*'|[^\s.,;:!?`\]]+))*)/g;

/** В обычном тексте: сайт-пути → ссылки; игровые команды → код. */
function enrichPlainText(text: string, keyBase: string): ReactNode[] {
  type Seg =
    | { kind: "text"; v: string }
    | { kind: "link"; label: string; href: string }
    | { kind: "code"; v: string };

  const segs: Seg[] = [{ kind: "text", v: text }];

  function mapText(fn: (t: string) => Seg[]) {
    const next: Seg[] = [];
    for (const s of segs) {
      if (s.kind !== "text") {
        next.push(s);
        continue;
      }
      next.push(...fn(s.v));
    }
    segs.length = 0;
    segs.push(...next);
  }

  mapText((t) => {
    const out: Seg[] = [];
    let last = 0;
    const re = new RegExp(SITE_PATH_RE.source, "gi");
    let m: RegExpExecArray | null;
    while ((m = re.exec(t)) !== null) {
      if (m.index > last) out.push({ kind: "text", v: t.slice(last, m.index) });
      const path = m[1]!;
      out.push({ kind: "link", label: labelForPath(path), href: path });
      last = m.index + m[0].length;
    }
    if (last < t.length) out.push({ kind: "text", v: t.slice(last) });
    return out.length ? out : [{ kind: "text", v: t }];
  });

  mapText((t) => {
    const out: Seg[] = [];
    let last = 0;
    const re = new RegExp(CMD_RE.source, "g");
    let m: RegExpExecArray | null;
    while ((m = re.exec(t)) !== null) {
      if (m.index > last) out.push({ kind: "text", v: t.slice(last, m.index) });
      out.push({ kind: "code", v: m[1]! });
      last = m.index + m[0].length;
    }
    if (last < t.length) out.push({ kind: "text", v: t.slice(last) });
    return out.length ? out : [{ kind: "text", v: t }];
  });

  return segs.map((s, i) => {
    if (s.kind === "link") {
      return (
        <Link
          key={`${keyBase}-l-${i}`}
          href={s.href}
          className="font-semibold text-solar-gold underline-offset-2 hover:underline"
        >
          {s.label}
        </Link>
      );
    }
    if (s.kind === "code") {
      return (
        <code key={`${keyBase}-c-${i}`} className="sol-md-code">
          {s.v}
        </code>
      );
    }
    return s.v ? <span key={`${keyBase}-t-${i}`}>{s.v}</span> : null;
  });
}

function renderInlineMarkdown(text: string, keyBase: string): ReactNode[] {
  const out: ReactNode[] = [];
  let cursor = 0;
  let idx = 0;

  const flush = (to: number) => {
    if (to > cursor) {
      out.push(
        ...enrichPlainText(text.slice(cursor, to), `${keyBase}-p${idx++}`),
      );
    }
    cursor = to;
  };

  while (cursor < text.length) {
    const rest = text.slice(cursor);

    if (rest.startsWith("`")) {
      const end = rest.indexOf("`", 1);
      if (end > 1 && !rest.slice(1, end).includes("\n")) {
        flush(cursor);
        out.push(
          <code key={`${keyBase}-code-${idx++}`} className="sol-md-code">
            {rest.slice(1, end)}
          </code>,
        );
        cursor += end + 1;
        continue;
      }
    }

    if (rest.startsWith("[")) {
      const link = rest.match(/^\[([^\]]+)\]\(([^)\s]+)\)/);
      if (link) {
        flush(cursor);
        const label = link[1]!;
        const href = link[2]!;
        if (href.startsWith("/")) {
          out.push(
            <Link
              key={`${keyBase}-a-${idx++}`}
              href={href}
              className="font-semibold text-solar-gold underline-offset-2 hover:underline"
            >
              {label}
            </Link>,
          );
        } else {
          out.push(
            <a
              key={`${keyBase}-a-${idx++}`}
              href={href}
              target="_blank"
              rel="noreferrer"
              className="font-semibold text-solar-gold underline-offset-2 hover:underline"
            >
              {label}
            </a>,
          );
        }
        cursor += link[0].length;
        continue;
      }
    }

    if (rest.startsWith("**")) {
      const end = rest.indexOf("**", 2);
      if (end > 2) {
        flush(cursor);
        out.push(
          <strong
            key={`${keyBase}-b-${idx++}`}
            className="font-semibold text-foreground"
          >
            {rest.slice(2, end)}
          </strong>,
        );
        cursor += end + 2;
        continue;
      }
    }

    if (rest.startsWith("*") && !rest.startsWith("**")) {
      const end = rest.indexOf("*", 1);
      if (end > 1 && !rest.slice(1, end).includes("\n")) {
        flush(cursor);
        out.push(
          <em
            key={`${keyBase}-i-${idx++}`}
            className="italic text-foreground/90"
          >
            {rest.slice(1, end)}
          </em>,
        );
        cursor += end + 1;
        continue;
      }
    }

    if (rest.startsWith("_")) {
      const end = rest.indexOf("_", 1);
      if (end > 1 && !rest.slice(1, end).includes("\n")) {
        flush(cursor);
        out.push(
          <em
            key={`${keyBase}-u-${idx++}`}
            className="italic text-foreground/90"
          >
            {rest.slice(1, end)}
          </em>,
        );
        cursor += end + 1;
        continue;
      }
    }

    const nextSpecial = rest.search(/[`[*_]/);
    if (nextSpecial === -1) {
      flush(text.length);
      break;
    }
    if (nextSpecial === 0) {
      // одиночный спецсимвол без пары — как обычный текст
      flush(cursor + 1);
      continue;
    }
    flush(cursor + nextSpecial);
  }

  flush(text.length);
  return out;
}

function renderBotText(text: string) {
  const blocks = text.split(/(```[\s\S]*?```)/g);
  return blocks.map((block, bi) => {
    const fence = block.match(/^```(?:\w+)?\n?([\s\S]*?)```$/);
    if (fence) {
      return (
        <pre key={`pre-${bi}`} className="sol-md-pre">
          <code>{fence[1]!.replace(/\n$/, "")}</code>
        </pre>
      );
    }
    return (
      <span key={`p-${bi}`} className="whitespace-pre-wrap">
        {renderInlineMarkdown(block, `i${bi}`)}
      </span>
    );
  });
}

function TypewriterText({
  text,
  active,
  onTick,
}: {
  text: string;
  active: boolean;
  onTick?: () => void;
}) {
  // Короткие приветствия можно «печатать»; длинные ответы — сразу целиком,
  // иначе кажется, что текст обрезан / бот «тупит».
  const useTypewriter = active && text.length <= 80;
  const [shown, setShown] = useState(useTypewriter ? "" : text);
  const [done, setDone] = useState(!useTypewriter);
  const tickRef = useRef(onTick);
  tickRef.current = onTick;

  useEffect(() => {
    if (!useTypewriter) {
      setShown(text);
      setDone(true);
      tickRef.current?.();
      return;
    }
    setShown("");
    setDone(false);
    let i = 0;
    const step = Math.max(1, Math.ceil(text.length / 40));
    const id = window.setInterval(() => {
      i = Math.min(text.length, i + step);
      setShown(text.slice(0, i));
      tickRef.current?.();
      if (i >= text.length) {
        window.clearInterval(id);
        setDone(true);
        tickRef.current?.();
      }
    }, 16);
    return () => window.clearInterval(id);
  }, [text, useTypewriter]);

  if (!done) {
    return (
      <span className="whitespace-pre-wrap break-words">
        {shown}
        <span className="ml-0.5 inline-block h-3.5 w-1.5 animate-pulse bg-solar-gold/80 align-middle" />
      </span>
    );
  }

  return <div className="sol-md break-words">{renderBotText(text)}</div>;
}

export function SolnyshkoChat() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<ChatMsg[]>([]);
  const listRef = useRef<HTMLDivElement>(null);

  const scrollBottom = () => {
    const el = listRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  };

  useEffect(() => {
    const stored = loadStoredMessages();
    setMessages(stored ?? [pickWelcome()]);
  }, []);

  useEffect(() => {
    if (messages.length > 0) saveMessages(messages);
  }, [messages]);

  // При открытии не подкидывать новое «привет», если чат уже живой
  useEffect(() => {
    if (!open) return;
    setMessages((prev) => {
      if (prev.length === 0) return [pickWelcome()];
      return prev;
    });
  }, [open]);

  useEffect(() => {
    if (!open) return;
    scrollBottom();
  }, [messages, open, loading]);

  async function send(e?: FormEvent) {
    e?.preventDefault();
    const text = input.trim();
    if (!text || loading) return;

    const userMsg: ChatMsg = {
      id: `u-${Date.now()}`,
      role: "user",
      text,
    };
    const nextMessages = [...messages, userMsg];
    setMessages(nextMessages);
    setInput("");
    setLoading(true);

    try {
      // история = реальный диалог, welcome тоже можно оставить как контекст «уже поздоровались»
      const history = nextMessages
        .filter((m) => !m.id.startsWith("welcome"))
        .slice(-12)
        .map((m) => ({ role: m.role, text: m.text }));

      const res = await fetch("/api/solnyshko", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: text,
          history,
          continued: nextMessages.some((m) => !m.id.startsWith("welcome")),
        }),
      });
      const data = (await res.json()) as {
        answer?: string;
        error?: string;
        sources?: { title: string; href: string }[];
        mode?: string;
      };

      setMessages((m) => [
        ...m,
        {
          id: `b-${Date.now()}`,
          role: "bot",
          text:
            data.answer ??
            data.error ??
            "Не вышло ответить, бро. Глянь /docs или /support.",
          sources: data.sources,
          mode: data.mode,
          animate: true,
        },
      ]);
    } catch {
      setMessages((m) => [
        ...m,
        {
          id: `b-${Date.now()}`,
          role: "bot",
          text: "Сеть лежит. Попробуй ещё раз или [вики](/docs).",
          animate: true,
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="solnyshko-dock pointer-events-none fixed bottom-4 right-4 z-[80] flex flex-col items-end gap-3 sm:bottom-6 sm:right-6">
      {open ? (
        <div
          className="pointer-events-auto flex h-[min(70vh,520px)] w-[min(100vw-1.5rem,380px)] flex-col overflow-hidden rounded-2xl border border-solar-gold/35 bg-card shadow-[var(--neon-glow-strong)]"
          role="dialog"
          aria-label="Солнышко — помощник Solar"
        >
          <header className="flex items-center justify-between gap-2 border-b border-border bg-gradient-to-r from-solar-gold/20 via-solar-yellow/10 to-transparent px-3 py-2.5">
            <div className="flex min-w-0 items-center gap-2">
              <span className="flex size-9 items-center justify-center rounded-full bg-solar-gold/25 text-solar-gold shadow-[var(--neon-glow)]">
                <Sun className="size-5" />
              </span>
              <div className="min-w-0">
                <p className="font-display text-sm font-bold tracking-wide">
                  Солнышко
                </p>
                <p className="truncate text-[11px] text-muted-foreground">
                  Помощник по серверу · бесплатно
                </p>
              </div>
            </div>
            <button
              type="button"
              className="wiki-nav-btn rounded-lg p-1.5 text-muted-foreground hover:bg-accent hover:text-foreground"
              aria-label="Закрыть"
              onClick={() => setOpen(false)}
            >
              <X className="size-4" />
            </button>
          </header>

          <div
            ref={listRef}
            className="min-h-0 flex-1 space-y-3 overflow-y-auto overscroll-contain px-3 py-3 pb-4"
          >
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={cn(
                  "max-w-[92%] rounded-2xl px-3 py-2 text-sm leading-relaxed break-words",
                  msg.role === "user"
                    ? "ml-auto bg-solar-gold/25 text-foreground"
                    : "mr-auto border border-border/80 bg-muted/40 text-foreground/95",
                )}
              >
                {msg.role === "bot" ? (
                  <TypewriterText
                    text={msg.text}
                    active={Boolean(msg.animate)}
                    onTick={scrollBottom}
                  />
                ) : (
                  <div className="whitespace-pre-wrap">{msg.text}</div>
                )}
                {msg.sources && msg.sources.length > 0 ? (
                  <div className="mt-2 flex flex-wrap gap-1.5 border-t border-border/50 pt-2">
                    {msg.sources.slice(0, 3).map((s) => (
                      <Link
                        key={s.href}
                        href={s.href}
                        className="rounded-full bg-solar-gold/15 px-2 py-0.5 text-[10px] font-semibold text-solar-gold hover:bg-solar-gold/25"
                      >
                        {s.title}
                      </Link>
                    ))}
                  </div>
                ) : null}
              </div>
            ))}
            {loading ? (
              <p className="flex items-center gap-2 text-xs text-muted-foreground">
                <Loader2 className="size-3.5 animate-spin text-solar-gold" />
                Солнышко печатает…
              </p>
            ) : null}
          </div>

          <form
            onSubmit={send}
            className="flex items-end gap-2 border-t border-border bg-card/90 p-2.5"
          >
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              rows={2}
              maxLength={500}
              placeholder="Как получить проходку? Что даёт SONNE?"
              className="min-h-[44px] flex-1 resize-none rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:border-solar-gold/50"
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  void send();
                }
              }}
            />
            <button
              type="submit"
              disabled={loading || input.trim().length < 2}
              className="btn-primary inline-flex size-10 shrink-0 items-center justify-center rounded-xl p-0 disabled:opacity-40"
              aria-label="Отправить"
            >
              <Send className="size-4" />
            </button>
          </form>
        </div>
      ) : null}

      <button
        type="button"
        className={cn(
          "pointer-events-auto group relative flex size-14 items-center justify-center rounded-full border border-solar-gold/50 bg-gradient-to-br from-solar-yellow via-solar-gold to-solar-amber text-[#1a1408] shadow-[var(--neon-glow-strong)] transition-transform hover:scale-105",
          open && "ring-2 ring-solar-gold/40",
        )}
        aria-expanded={open}
        aria-label={open ? "Закрыть Солнышко" : "Открыть Солнышко"}
        onClick={() => setOpen((v) => !v)}
      >
        {open ? <X className="size-6" /> : <Sun className="size-7" />}
        {!open ? (
          <span className="absolute -left-1 top-0 max-w-0 overflow-hidden whitespace-nowrap rounded-full bg-card px-0 text-[11px] font-semibold text-foreground opacity-0 shadow-md transition-all group-hover:left-auto group-hover:right-16 group-hover:max-w-[10rem] group-hover:px-2.5 group-hover:py-1 group-hover:opacity-100">
            Спросить Солнышко
          </span>
        ) : null}
      </button>
    </div>
  );
}
