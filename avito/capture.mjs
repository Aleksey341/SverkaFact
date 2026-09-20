import { chromium } from "playwright";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const outDir = __dirname;

const shots = [
  {
    file: "screenshot-main.html",
    out: "avito-01-glavnyj-ekran.png",
    viewport: { width: 1280, height: 820 }
  },
  {
    file: "screenshot-report.html",
    out: "avito-02-otchet.png",
    viewport: { width: 1280, height: 900 }
  }
];

const browser = await chromium.launch();
const page = await browser.newPage({ deviceScaleFactor: 2 });

for (const shot of shots) {
  await page.setViewportSize(shot.viewport);
  const url = "file:///" + path.join(outDir, shot.file).replace(/\\/g, "/");
  await page.goto(url, { waitUntil: "networkidle" });
  await page.waitForTimeout(300);
  await page.screenshot({
    path: path.join(outDir, shot.out),
    fullPage: false
  });
  console.log("Saved:", shot.out);
}

await browser.close();
