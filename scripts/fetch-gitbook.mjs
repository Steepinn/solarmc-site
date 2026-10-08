const BASE = "https://mcsolar.gitbook.io/solar";

const candidates = [
  "/informaciya/home",
  "/informaciya/pravila-proekta",
  "/informaciya/razreshennye-i-zapreshchennye-modifikacii",
  "/informaciya/zapreshchennye-slova",
  "/informaciya/chasto-zadavaemye-voprosy",
  "/informaciya/poluchenie-pomoshchi",
  "/informaciya/kak-nachat-igru-na-servere",
  "/informaciya/gaid-po-resurs-paku",
  "/informaciya/gaid-po-plastinkam",
  "/informaciya/gaid-po-napitkam",
  "/informaciya/recepty-napitkov",
  "/informaciya/poleznye-komandy-dlya-igrokov",
  "/informaciya/nastroika-golosovogo-chata",
];

async function main() {
  const html = await fetch(BASE).then((r) => r.text());
  const hrefs = [...html.matchAll(/href="(\/solar\/[^"#?]+)"/g)].map((m) => m[1]);
  const unique = [...new Set([...hrefs, ...candidates.map((c) => `/solar${c}`)])];

  for (const path of unique) {
    const mdUrl = `https://mcsolar.gitbook.io${path}.md`;
    try {
      const res = await fetch(mdUrl);
      if (res.ok) {
        const text = await res.text();
        console.log("OK", path, text.slice(0, 80).replace(/\n/g, " "));
      } else {
        console.log("FAIL", path, res.status);
      }
    } catch (e) {
      console.log("ERR", path, e.message);
    }
  }
}

main();
