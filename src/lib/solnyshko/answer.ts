import {
  searchKnowledge,
  type KnowledgeChunk,
} from "@/lib/solnyshko/knowledge";
import { buildCoreContext } from "@/lib/solnyshko/core-context";
import { tryFaqAnswer } from "@/lib/solnyshko/faq-answers";
import {
  answerCookingHowto,
  searchFoodRecipes,
} from "@/lib/solnyshko/recipe-index";
import { answerClientModPresence } from "@/lib/solnyshko/client-mods-index";
import { answerFishQuestion } from "@/lib/solnyshko/fish-index";
import { sanitizeChatMarkdown } from "@/lib/solnyshko/format-answer";
import {
  angerLevel,
  checkBlockedQuestion,
  shouldMirrorRoughTone,
  systemPromptFor,
  tryRoughBanter,
  trySmallTalk,
  type SolAudience,
} from "@/lib/solnyshko/policy";

export type ChatTurn = { role: "user" | "bot"; text: string };

/** Сначала lite/новые — у 2.0 часто уже сгорела дневная квота. */
const MODEL_CHAIN = [
  process.env.GEMINI_MODEL?.trim(),
  "gemini-flash-lite-latest",
  "gemini-3.1-flash-lite",
  "gemini-3.5-flash-lite",
  "gemma-4-26b-a4b-it",
  "gemini-2.0-flash-lite",
  "gemini-2.0-flash",
].filter((m, i, a): m is string => Boolean(m) && a.indexOf(m) === i);

function sourcesOf(chunks: KnowledgeChunk[]) {
  return [...new Map(chunks.map((c) => [c.href, c])).values()].map((c) => ({
    title: c.title,
    href: c.href,
  }));
}

function formatHistory(history: ChatTurn[]) {
  if (!history.length) return "ИСТОРИЯ: (начало диалога)\n";
  const lines = history.slice(-8).map((t) => {
    const who = t.role === "user" ? "Игрок" : "Солнышко";
    return `${who}: ${t.text.slice(0, 320)}`;
  });
  return `ИСТОРИЯ ЭТОГО ЧАТА (уже поздоровались — не начинай с привета):\n${lines.join("\n")}\n`;
}

function synthesizeFromChunks(chunks: KnowledgeChunk[]): string {
  const top = chunks
    .filter((c) => !c.staffOnly && !/staff|luckperms|ранг/i.test(c.title))
    .slice(0, 2);
  const use = top.length ? top : chunks.slice(0, 2);
  const bits = use.map((c) =>
    sanitizeChatMarkdown(c.text.slice(0, 280).replace(/\s+/g, " ").trim()),
  );
  return `${bits.join("\n\n")}\n\nЕсли уточнишь — разверну.`;
}

export function polishBotAnswer(text: string): string {
  return sanitizeChatMarkdown(text);
}

/** Запасной путь без Gemini. */
export function answerFromWiki(
  question: string,
  audience: SolAudience,
  history: ChatTurn[] = [],
): {
  answer: string;
  sources: { title: string; href: string }[];
  mode: "wiki";
} {
  const small = trySmallTalk(question);
  if (small) return { mode: "wiki", sources: [], answer: small };

  const banter = tryRoughBanter(question, history);
  if (banter) return { mode: "wiki", sources: [], answer: banter };

  const blocked = checkBlockedQuestion(question, audience);
  if (blocked) return { mode: "wiki", sources: [], answer: blocked };

  const food = searchFoodRecipes(question);
  if (food) return { mode: "wiki", ...food };

  const modPresence = answerClientModPresence(question);
  if (modPresence) return { mode: "wiki", ...modPresence };

  const fish = answerFishQuestion(question);
  if (fish) return { mode: "wiki", ...fish };

  const faq = tryFaqAnswer(question);
  if (faq) return { mode: "wiki", ...faq };

  const chunks = searchKnowledge(question, audience, 4);
  if (chunks.length) {
    return {
      mode: "wiki",
      sources: sourcesOf(chunks),
      answer: synthesizeFromChunks(chunks),
    };
  }

  if (history.length > 0) {
    return {
      mode: "wiki",
      sources: [],
      answer:
        "Ок, я тут ☀ Сформулируй ещё раз чуть яснее — или спроси про расы, еду FD, SONNE, команды, как зайти.",
    };
  }

  return {
    mode: "wiki",
    sources: [],
    answer:
      "Слушаю ☀ Спроси что угодно по Solar: расы, кухня/рецепты, донат, команды, старт…",
  };
}

export function buildGeminiPrompt(
  question: string,
  chunks: KnowledgeChunk[],
  audience: SolAudience,
  history: ChatTurn[] = [],
  extra = "",
) {
  const rough = shouldMirrorRoughTone(question, history);
  const anger = angerLevel(question, history);
  const ctx = chunks
    .map(
      (c, i) =>
        `[${i + 1}] ${c.title} (${c.href})\n${sanitizeChatMarkdown(c.text.slice(0, 900))}`,
    )
    .join("\n\n");

  return `${systemPromptFor(audience, { rough, anger })}

БАЗА:
${buildCoreContext(audience)}

${extra ? `СПРАВКА (перефразируй своими словами, не копируй блоком):\n${extra}\n` : ""}
КОНТЕКСТ ВИКИ:
${ctx || "(пусто — опирайся на БАЗУ и историю)"}

${formatHistory(history)}
СООБЩЕНИЕ ИГРОКА:
${question}

${history.length > 0 ? "В этом чате уже общались — НЕ здоровайся снова.\n" : ""}${rough || anger >= 2 ? `Игрок на мате/пошлости (уровень злости ${anger}/3) — отвечай ТАК ЖЕ. Не читай мораль про приличие.\n` : "Без мата, пока игрок сам не начал.\n"}Ответь живо и по делу. Факты только из БАЗЫ/КОНТЕКСТА. Не пиши «открой /docs» вместо ответа. Без HTML-тегов. Сразу ответ игроку:`;
}

async function callGemini(opts: {
  key: string;
  model: string;
  prompt: string;
  maxOutputTokens: number;
  rough?: boolean;
}): Promise<{ text: string; finishReason?: string } | null> {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${opts.model}:generateContent`;
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-goog-api-key": opts.key,
      },
      body: JSON.stringify({
        contents: [{ parts: [{ text: opts.prompt }] }],
        generationConfig: {
          temperature: opts.rough ? 0.85 : 0.7,
          maxOutputTokens: opts.maxOutputTokens,
        },
        ...(opts.rough
          ? {
              safetySettings: [
                {
                  category: "HARM_CATEGORY_HARASSMENT",
                  threshold: "BLOCK_NONE",
                },
                {
                  category: "HARM_CATEGORY_HATE_SPEECH",
                  threshold: "BLOCK_NONE",
                },
                {
                  category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
                  threshold: "BLOCK_NONE",
                },
                {
                  category: "HARM_CATEGORY_DANGEROUS_CONTENT",
                  threshold: "BLOCK_ONLY_HIGH",
                },
              ],
            }
          : {}),
      }),
      signal: AbortSignal.timeout(18_000),
    });

    if (!res.ok) {
      const errBody = (await res.text().catch(() => "")).slice(0, 220);
      console.warn("[solnyshko] gemini", opts.model, res.status, errBody);
      if (res.status === 429 || res.status === 403) {
        return { text: "", finishReason: "QUOTA" };
      }
      return null;
    }

    const data = (await res.json()) as {
      candidates?: {
        finishReason?: string;
        content?: { parts?: { text?: string; thought?: boolean }[] };
      }[];
    };
    const cand = data.candidates?.[0];
    let text =
      cand?.content?.parts
        ?.filter((p) => !p.thought)
        .map((p) => p.text ?? "")
        .join("") ?? "";

    // убрать мусор вида «* User's prompt:» у gemma
    text = text
      .replace(/^\*+\s*User['']?s?\s*prompt:[\s\S]*?(?=\n\n|$)/i, "")
      .replace(/^\*+\s*User asks:[\s\S]*?(?=\n\n|$)/i, "")
      .trim();

    return { text, finishReason: cand?.finishReason };
  } catch (err) {
    console.warn("[solnyshko] gemini error", opts.model, err);
    return null;
  }
}

export async function answerWithGemini(
  question: string,
  audience: SolAudience,
  history: ChatTurn[] = [],
): Promise<{
  answer: string;
  sources: { title: string; href: string }[];
  mode: "gemini" | "wiki";
} | null> {
  const small = trySmallTalk(question);
  if (small) return { mode: "wiki", answer: small, sources: [] };

  const banter = tryRoughBanter(question, history);
  if (banter) return { mode: "wiki", answer: banter, sources: [] };

  const blocked = checkBlockedQuestion(question, audience);
  if (blocked) return { mode: "wiki", answer: blocked, sources: [] };

  const faqEarly = tryFaqAnswer(question);
  if (
    faqEarly &&
    /выдач|команд|give|сфер|орб|перерож|смен.{0,24}рас|расм|origin|происхожд|orb_of_origin/i.test(
      question,
    )
  ) {
    return { mode: "wiki", answer: faqEarly.answer, sources: faqEarly.sources };
  }

  const key =
    process.env.GEMINI_API_KEY?.trim() ||
    process.env.GOOGLE_GENERATIVE_AI_API_KEY?.trim();
  if (!key) return null;

  // Кухня «где рецепты» — до ответа про jar (иначе FD → «мод уже в сборке»)
  const cookHowto = answerCookingHowto(question);
  if (cookHowto) {
    return { mode: "wiki", answer: cookHowto.answer, sources: cookHowto.sources };
  }

  // Факты про состав сборки — сразу из реальных jar, без фантазий модели
  const modPresence = answerClientModPresence(question);
  if (modPresence) {
    return { mode: "wiki", answer: modPresence.answer, sources: modPresence.sources };
  }

  const fishQ = answerFishQuestion(question);
  if (fishQ) {
    return { mode: "wiki", answer: fishQ.answer, sources: fishQ.sources };
  }

  // Критичные FAQ — сразу из базы, без ожидания Gemini
  const faqDirect = tryFaqAnswer(question);
  if (
    faqDirect &&
    /лаунчер|официал|tlauncher|тлаунчер|лиценз|сборк|динамическ|mouse\s*tweak|маус\s*твик|как\s+(начать|зайти)|проходк|заявк|кораб|shippy|\bsonne\b|рас\w*|origin|перерожден|орб|сфер|перепрок|сброс.{0,20}(навык|скилл)|выдач|команд.{0,20}(рас|сфер|орб)|рыбалк|tide|раци|стационар|динамик(?!ическ)|микрофон|антенн|\bрадио\b|пинг|metka|метк|мебел|жител|fdguide|fdbook|виног|vinery|faunus|звер/i.test(
      question,
    )
  ) {
    return { mode: "wiki", answer: faqDirect.answer, sources: faqDirect.sources };
  }

  // FAQ/еда — только факты в промпт, ответ генерит модель
  const food = searchFoodRecipes(question);
  const faq = faqDirect ?? tryFaqAnswer(question);
  const extra = [food?.answer, faq?.answer].filter(Boolean).join("\n\n");

  const chunks = searchKnowledge(question, audience, 8);
  const sources = food?.sources ?? faq?.sources ?? sourcesOf(chunks);
  const rough = shouldMirrorRoughTone(question, history);
  const anger = angerLevel(question, history);
  const prompt = buildGeminiPrompt(
    question,
    chunks,
    audience,
    history,
    extra,
  );

  for (const model of MODEL_CHAIN) {
    const result = await callGemini({
      key,
      model,
      prompt,
      maxOutputTokens: 1024,
      rough: rough || anger >= 2,
    });
    if (result?.finishReason === "QUOTA") continue;
      if (result?.text && result.text.length >= 2) {
      let answer = polishBotAnswer(result.text);
      if (
        /нет\s+(?:никакой\s+)?команд|команды\s+нет|не\s+существует\s+команд/i.test(
          answer,
        ) &&
        /выдач|сфер|орб|перерож|рас\w*|origin|give/i.test(question)
      ) {
        const fix = tryFaqAnswer(question);
        if (fix) return { mode: "wiki", answer: fix.answer, sources: fix.sources };
      }
      if (history.length > 0) {
        answer = answer.replace(
          /^(?:привет|здаров\w*|хей|хай|йо|салют|добрый\s+(?:день|вечер)|доброе\s+утро)[!.☀🌞❤️,\s]*/i,
          "",
        );
      }
      return { mode: "gemini", answer: answer.trim() || result.text, sources };
    }
  }

  return null;
}
