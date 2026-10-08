const html = await fetch("https://mcsolar.gitbook.io/solar/guides/gaid-po-resurs-paku").then((r) =>
  r.text(),
);
const imgs = [...html.matchAll(/https:\/\/[^"'\s>]+\.(webp|png|jpg|jpeg|gif)/gi)].map((m) => m[0]);
console.log([...new Set(imgs)].join("\n"));
