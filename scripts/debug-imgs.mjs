const html = await fetch("https://mcsolar.gitbook.io/solar/informaciya/rules").then((r) =>
  r.text(),
);
const imgs = [...html.matchAll(/<img[^>]+src="([^"]+)"/g)].map((m) => m[1]);
imgs.forEach((src, i) => console.log(i, src.slice(0, 120)));
