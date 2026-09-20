const fs = require("fs");
const path = require("path");
const { execFileSync } = require("child_process");
const XLSX = require("xlsx");
const core = require("./osv-core.cjs");

const dir = "C:/Users/cobra/Desktop/Папки РС/Сверка актов 1 С/";
const samples = path.join(dir, "kb/_samples");
let fail = 0;

function load(f) {
  const wb = XLSX.readFile(path.join(samples, f), { cellDates: true });
  return XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]], { header: 1, raw: true, defval: null });
}

const d60 = core.parseOsv6062(load("osv-60-advance.xlsx"), "60");
const d76 = core.parseOsv6062(load("osv-76va-advance.xlsx"), "76");
const idx = core.buildVatAdvanceIndex(d76);
const res = core.checkAdvanceVat(d60, idx, { minAdvance: 1000 });
const winner = res.missing.find(r => /виннер/i.test(r["Контрагент"]));
console.log("items60=", d60.items.length, "items76=", d76.items.length, "missing=", res.missing.length);
console.log("winner=", winner ? winner["Аванс выданный (Дт 60)"] : "NOT FOUND");
if (!winner) fail++;
if (!(winner && winner["Аванс выданный (Дт 60)"] > 661000)) fail++;

const tmp = path.join(__dirname, ".syntax-tmp");
fs.mkdirSync(tmp, { recursive: true });
for (const f of ["SverkaFact _v2.html", "SverkaFact _v2.1.html"]) {
  const src = fs.readFileSync(dir + f, "utf8");
  for (const m of ["function severityMeta", "function withSeverity", "sev-error", "sevLegend"]) {
    if (!src.includes(m)) { console.log("MISS", f, m); fail++; }
  }
  if ((src.split("function severityMeta").length - 1) !== 1) {
    console.log("DUP severityMeta", f); fail++;
  }
  const re = /<script(?![^>]*\bsrc=)[^>]*>([\s\S]*?)<\/script>/g;
  let i = 0, m;
  while ((m = re.exec(src))) {
    i++;
    const file = path.join(tmp, f.replace(/\W/g, "_") + "_" + i + ".js");
    fs.writeFileSync(file, m[1], "utf8");
    try {
      execFileSync(process.execPath, ["--check", file], { stdio: "pipe" });
      console.log(f, "script", i, "OK");
    } catch (e) {
      fail++;
      console.log(f, "script", i, "FAIL", String(e.stderr || e.message).slice(0, 800));
    }
  }
}
console.log(fail ? "FAIL " + fail : "ALL OK");
process.exit(fail ? 1 : 0);
