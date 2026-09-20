/**
 * Excel: колонка «Важность» первой (как в UI); ширина; _* уже отфильтровываются.
 * + лёгкая сверка маркеров в обоих HTML.
 */
const fs = require("fs");
const path = require("path");
const { execFileSync } = require("child_process");

const dir = "C:/Users/cobra/Desktop/Папки РС/Сверка актов 1 С/";
const FILES = ["SverkaFact _v2.html", "SverkaFact _v2.1.html"];

function mustReplace(src, from, to, label) {
  const n = src.split(from).length - 1;
  if (n !== 1) throw new Error(label + ": " + n);
  return src.replace(from, to);
}

const NEW_ROWS_TO_TABLE = `function rowsToTable(rows, emptyText) {
  if (!rows || !rows.length) return { headers: ["Сообщение"], data: [[emptyText || NO_MATCHES_TEXT]] };
  const keys = Object.keys(rows[0]).filter(k => !k.startsWith("_"));
  const headers = keys.includes("Важность")
    ? ["Важность", ...keys.filter(k => k !== "Важность")]
    : keys;
  const data = rows.map(r => headers.map(h => r[h] ?? ""));
  return { headers, data, meta: rows };
}`;

for (const file of FILES) {
  const p = dir + file;
  let src = fs.readFileSync(p, "utf8").replace(/\r\n/g, "\n");

  src = mustReplace(src,
    `function rowsToTable(rows, emptyText) {
  if (!rows || !rows.length) return { headers: ["Сообщение"], data: [[emptyText || NO_MATCHES_TEXT]] };
  const headers = Object.keys(rows[0]).filter(k => !k.startsWith("_"));
  const data = rows.map(r => headers.map(h => r[h] ?? ""));
  return { headers, data, meta: rows };
}`,
    NEW_ROWS_TO_TABLE,
    "rowsToTable");

  if (!src.includes('"важность":')) {
    src = mustReplace(src,
      `    "причина": 44,
    "сделать": 36,`,
      `    "причина": 44,
    "сделать": 36,
    "важность": 14,`,
      "col widths");
  }

  fs.writeFileSync(p, src.replace(/\n/g, "\r\n"), "utf8");
  console.log("patched", file);
}

// syntax check
const tmp = path.join(__dirname, ".syn3");
fs.mkdirSync(tmp, { recursive: true });
let fail = 0;
for (const file of FILES) {
  const src = fs.readFileSync(dir + file, "utf8");
  if (!src.includes('keys.includes("Важность")')) { console.log("MISS order", file); fail++; }
  const re = /<script(?![^>]*\bsrc=)[^>]*>([\s\S]*?)<\/script>/g;
  let i = 0, m;
  while ((m = re.exec(src))) {
    i++;
    const f = path.join(tmp, "s" + i + ".js");
    fs.writeFileSync(f, m[1], "utf8");
    try { execFileSync(process.execPath, ["--check", f], { stdio: "pipe" }); }
    catch (e) { fail++; console.log(file, i, String(e.stderr || e).slice(0, 400)); }
  }
  console.log(file, "scripts OK");
}
fs.rmSync(tmp, { recursive: true, force: true });
console.log(fail ? "FAIL " + fail : "ALL OK");
process.exit(fail ? 1 : 0);
