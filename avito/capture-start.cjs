const { chromium } = require("playwright");
const path = require("path");
const fs = require("fs");

(async () => {
  const htmlPath = path.join(__dirname, "screenshot-main.html");
  const outPath = path.join(__dirname, "screenshot-start-sverkafact.png");
  const url = "file:///" + htmlPath.replace(/\\/g, "/");

  const browser = await chromium.launch({
    channel: "msedge",
    headless: true
  });
  const page = await browser.newPage({
    viewport: { width: 1280, height: 900 },
    deviceScaleFactor: 2
  });
  await page.goto(url, { waitUntil: "networkidle" });
  await page.waitForTimeout(300);
  await page.screenshot({
    path: outPath,
    fullPage: true,
    type: "png"
  });
  await browser.close();
  const st = fs.statSync(outPath);
  console.log("Saved:", outPath, st.size, "bytes");
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
