const fs = require("fs");
const dir = "C:/Users/cobra/Desktop/Папки РС/Сверка актов 1 С/";

for (const f of ["SverkaFact _v2.html", "SverkaFact _v2.1.html"]) {
  let s = fs.readFileSync(dir + f, "utf8");
  s = s.replace(/font-weight:\s*650/g, "font-weight: 600");
  // Excel headers → teal of Clear Desk
  s = s.replace(/title:\s*"FF1F4E79"/g, 'title: "FF0F5C5C"');
  s = s.replace(/header:\s*"FFD9EAF7"/g, 'header: "FFE4F2F1"');
  s = s.replace(/kpi:\s*"FFEAF2F8"/g, 'kpi: "FFE8F6EE"');
  s = s.replace(/border:\s*"FFD9E2F3"/g, 'border: "FFC9D4E0"');
  fs.writeFileSync(dir + f, s);
  console.log("fw+xl", f);
}

let s = fs.readFileSync(dir + "SverkaFact _v2.html", "utf8");
if (!s.includes('getElementById("page-hub")')) {
  s = s.replace(
    'document.getElementById("hubGrid").addEventListener("click", (e) => {',
    'document.getElementById("page-hub").addEventListener("click", (e) => {'
  );
}
s = s.replace(
  'tag.textContent = open ? "✓ PRO открыт" : "🔒 PRO";',
  'tag.textContent = open ? "PRO открыт" : "PRO";'
);
s = s.replace("<b>🔒 Демо завершено.</b>", "<b>Демо завершено.</b>");
s = s.replace(/🔒 /g, "");
fs.writeFileSync(dir + "SverkaFact _v2.html", s);
console.log("hub fix v2");

// syntax
const { execFileSync } = require("child_process");
const path = require("path");
const tmp = path.join(__dirname, ".syn-desk");
fs.mkdirSync(tmp, { recursive: true });
let fail = 0;
for (const f of ["SverkaFact _v2.html", "SverkaFact _v2.1.html"]) {
  const src = fs.readFileSync(dir + f, "utf8");
  if (!src.includes("--accent: #0f5c5c")) { console.log("MISS accent", f); fail++; }
  if (!src.includes("hub-lanes")) { console.log("MISS hub-lanes", f); fail++; }
  const re = /<script(?![^>]*\bsrc=)[^>]*>([\s\S]*?)<\/script>/g;
  let i = 0, m;
  while ((m = re.exec(src))) {
    i++;
    const file = path.join(tmp, "s" + i + ".js");
    fs.writeFileSync(file, m[1], "utf8");
    try { execFileSync(process.execPath, ["--check", file], { stdio: "pipe" }); }
    catch (e) { fail++; console.log(f, i, String(e.stderr || e).slice(0, 500)); }
  }
  console.log(f, "OK scripts");
}
fs.rmSync(tmp, { recursive: true, force: true });
process.exit(fail ? 1 : 0);
