import fs from "fs";
import path from "path";

const galleryDir = path.join(process.cwd(), "public", "gallery");
const patterns = [
  "260614",
  "15.47",
  "asdasdsadad",
  "asdasdadadasd",
  "asdsadasdsadsadasdsad",
  "image-b3",
  "06.05",
  "13.44",
];

const files = fs.readdirSync(galleryDir);
let i = 1;
for (const pattern of patterns) {
  const match = files.find((f) => f.includes(pattern));
  if (match) {
    fs.copyFileSync(
      path.join(galleryDir, match),
      path.join(galleryDir, `screenshot-${i}.png`),
    );
    console.log(`screenshot-${i}.png <- ${match}`);
    i++;
  }
}
