const fs = require("fs");
const path = require("path");
const dir = path.join("C:", "Users", "cobra", "Desktop", "Папки РС", "Сверка актов 1 С");
let v2 = fs.readFileSync(path.join(dir, "SverkaFact _v2.html"), "utf8");
const v21 = fs.readFileSync(path.join(dir, "SverkaFact _v2.1.html"), "utf8");

const start = 'id="page-regs"';
const end = "<script>";
const a21 = v21.indexOf(start);
const b21 = v21.indexOf(end);
const a2 = v2.indexOf(start);
const b2 = v2.indexOf(end);
if (a21 < 0 || b21 < 0 || a2 < 0 || b2 < 0) throw new Error("page markers");
v2 = v2.slice(0, a2) + v21.slice(a21, b21) + v2.slice(b2);

function ensureShow(hay, xlsxId, resetId) {
  const needle = `document.getElementById("${xlsxId}").classList.remove("hidden");`;
  const add = `${needle}\n    document.getElementById("${resetId}").classList.remove("hidden");`;
  if (hay.includes(`document.getElementById("${resetId}").classList.remove("hidden")`)) return hay;
  if (!hay.includes(needle)) throw new Error("no " + xlsxId);
  return hay.replace(needle, add);
}

v2 = ensureShow(v2, "btnRegXlsx", "btnRegReset");
v2 = ensureShow(v2, "btnOsvXlsx", "btnOsvReset");
v2 = ensureShow(v2, "btnNdsXlsx", "btnNdsReset");
v2 = ensureShow(v2, "btnAcqXlsx", "btnAcqReset");

const fnStart = "function clearMsg(id)";
const fnEnd = 'document.getElementById("btnRun").addEventListener';
if (!v2.includes(fnStart)) {
  const i21 = v21.indexOf(fnStart);
  const j21 = v21.indexOf(fnEnd);
  const j2 = v2.indexOf(fnEnd);
  if (i21 < 0 || j21 < 0 || j2 < 0) throw new Error("fn markers");
  v2 = v2.slice(0, j2) + v21.slice(i21, j21) + v2.slice(j2);
}

fs.writeFileSync(path.join(dir, "SverkaFact _v2.html"), v2);
const s = v2.slice(v2.lastIndexOf("<script>") + 8, v2.lastIndexOf("</script>"));
try { new Function(s); console.log("v2 OK"); } catch (e) { console.log("v2 FAIL", e.message); process.exit(1); }
console.log("resets", ["btnRegReset", "btnOsvReset", "btnNdsReset", "btnAcqReset"].every(id => v2.includes(id)));
