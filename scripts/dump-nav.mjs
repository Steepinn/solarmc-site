const html = await fetch("https://mcsolar.gitbook.io/solar").then((r) => r.text());
const links = [...html.matchAll(/href="(\/solar\/[^"#?]+)"/g)].map((m) => m[1]);
console.log([...new Set(links)].join("\n"));
