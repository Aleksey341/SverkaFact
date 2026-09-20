/**
 * Убирает лицензию из SverkaFact _v2.1.html (тестовая версия без ключей)
 */
const fs = require("fs");
const path = require("path");

const file = path.join(
  "C:", "Users", "cobra", "Desktop", "Папки РС", "Сверка актов 1 С",
  "SverkaFact _v2.1.html"
);

let html = fs.readFileSync(file, "utf8");

html = html.replace(
  /<title>[\s\S]*?<\/title>/,
  "<title>СверкаФакт v2.1 — тест (без лицензии)</title>"
);

html = html.replace(
  /    \.app-locked \.page-hub \{ opacity: 1; pointer-events: auto; \}\r?\n/,
  ""
);

// Remove license CSS block
html = html.replace(
  /\n    \.license-bar \{[\s\S]*?\.app-locked #btnRun \{ pointer-events: none; \}\r?\n/,
  "\n"
);

// Also remove leftover app-locked work-area if any
html = html.replace(
  /\n    \.app-locked \.page-mode \{[\s\S]*?pointer-events: none;[\s\S]*?\}\r?\n/g,
  "\n"
);
html = html.replace(
  /\n    \.app-locked \.work-area \{[\s\S]*?\}\r?\n/g,
  "\n"
);
html = html.replace(
  /\n    \.app-locked #btnRun \{[\s\S]*?\}\r?\n/g,
  "\n"
);

// Remove license bar HTML
html = html.replace(
  /\n    <section id="licenseBar"[\s\S]*?<\/section>\r?\n\r?\n/,
  "\n\n"
);

// Remove license JS from comment through assertLicenseOrThrow
html = html.replace(
  /\/\* ========== Лицензия:[\s\S]*?function assertLicenseOrThrow\(\) \{[\s\S]*?\n\}\r?\n\r?\n/,
  "/* ========== СверкаФакт v2.1 — тестовая версия без лицензии ========== */\n\n"
);

// Remove assertLicense calls
html = html.replace(
  /\s*try \{ assertLicenseOrThrow\(\); \} catch \(e\) \{ showMsgIn\("[^"]+", e\.message, "err"\); return; \}\r?\n/g,
  "\n"
);
html = html.replace(
  /\s*try \{ assertLicenseOrThrow\(\); \} catch \(e\) \{ showMsg\(e\.message, "err"\); return; \}\r?\n/g,
  "\n"
);

// Remove license event listeners and refreshLicenseUI at end
html = html.replace(
  /\r?\ndocument\.getElementById\("btnShowLicense"\)\.addEventListener\([\s\S]*?refreshLicenseUI\(\)\.catch\([\s\S]*?\}\);\r?\n/,
  "\n"
);

// Hero note for testers
html = html.replace(
  "Универсальный бухгалтерский контролёр: акты, реестры двух баз, 60/62, НДС и эквайринг. Загрузили выгрузки → увидели расхождения и что проверить. Обработка на вашем ПК.",
  "Тестовая сборка v2.1 без лицензии. Универсальный бухгалтерский контролёр: акты, реестры, 60/62, НДС и эквайринг. Обработка на вашем ПК."
);

fs.writeFileSync(file, html, "utf8");

const left = [];
for (const w of [
  "LICENSE_CFG", "assertLicense", "licenseBar", "btnShowLicense",
  "btnActivateKey", "refreshLicenseUI", "sverkapro_license", "app-locked"
]) {
  if (html.includes(w)) left.push(w);
}
console.log("Saved", file, "bytes", fs.statSync(file).size);
console.log("Leftover:", left.length ? left.join(", ") : "none");
