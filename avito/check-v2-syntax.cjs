const fs = require("fs");
const path = require("path");
const file = path.join("C:", "Users", "cobra", "Desktop", "Папки РС", "Сверка актов 1 С", "SverkaFact _v2.html");
const h = fs.readFileSync(file, "utf8");
const m = h.match(/<script>([\s\S]*)<\/script>\s*<\/body>/);
if (!m) { console.log("no script"); process.exit(1); }
try {
  new Function(m[1]);
  console.log("JS syntax OK", m[1].length);
} catch (e) {
  console.error("JS ERR", e.message);
  process.exit(1);
}
// spot-check bad escapes
const bad = m[1].match(/г\\\\./g);
console.log("bad date escapes", bad && bad.length);
const dt = m[1].includes("\\bдт\\b");
console.log("has word boundary dt", dt);
