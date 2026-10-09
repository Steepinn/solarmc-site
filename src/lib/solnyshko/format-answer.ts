/** Убирает GitBook/HTML из текста вики — в чате только markdown. */
export function sanitizeChatMarkdown(text: string): string {
  let t = text;

  t = t.replace(/<mark[^>]*>([\s\S]*?)<\/mark>/gi, (_, inner: string) => {
    const clean = inner.replace(/<\/?[^>]+>/g, "").trim();
    return clean ? `**${clean}**` : "";
  });
  t = t.replace(/<\/?mark[^>]*>/gi, "");
  t = t.replace(/<sup[^>]*>([\s\S]*?)<\/sup>/gi, "$1");
  t = t.replace(/<\/?[^>]+>/g, "");
  t = t.replace(/\\(?=\s)/g, "");
  t = t.replace(/\&#xNAN;/g, "");
  t = t.replace(/\*\*\s*\*\*/g, "");

  return t.replace(/[ \t]+\n/g, "\n").trim();
}
