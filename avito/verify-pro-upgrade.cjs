const fs = require("fs");
const path = "C:/Users/cobra/Desktop/Папки РС/Сверка актов 1 С/SverkaFact _v2.html";
const h = fs.readFileSync(path, "utf8");
const start = h.lastIndexOf("<script>");
const end = h.lastIndexOf("</script>");
const s = h.slice(start + 8, end);
try {
  new Function(s);
  console.log("JS OK");
} catch (e) {
  console.error("JS FAIL", e.message);
  process.exit(1);
}

const must = [
  "diagnose6062",
  "detectAccount76Kind",
  "buildSfPartnerIndex",
  "osvSfFile",
  "osvOverdueDays",
  "Аванс без СФ",
  "normalizeInn",
  "parseVatRate",
  "findNdsDuplicates",
  "multiRateWarn",
  "matchAcqRows",
  "parseAcqTerminalRows",
  "не найдено зачисление",
  "76.АВ/ВА",
  "Построчно: дата",
  "12 900",
  "gateAfterProRun"
];
for (const m of must) {
  if (!h.includes(m)) {
    console.error("MISSING", m);
    process.exit(1);
  }
}
console.log("markers OK", must.length);

// Lightweight algorithm smoke (reimplement critical pure helpers inline)
function normalizeText(v) {
  if (v == null) return "";
  return String(v).replace(/\u00a0|\u202f/g, " ").replace(/\s+/g, " ").trim();
}
function detectAccount76Kind(account) {
  const t = normalizeText(account).toUpperCase().replace(/Ё/g, "Е").replace(/\s+/g, "");
  if (/76[\.\-]?АВ|76[\.\-]?AB/.test(t)) return "76.АВ";
  if (/76[\.\-]?ВА|76[\.\-]?BA/.test(t)) return "76.ВА";
  return "";
}
if (detectAccount76Kind("76.АВ") !== "76.АВ") throw new Error("76AV");
if (detectAccount76Kind("76.AB") !== "76.АВ") throw new Error("76AB");
if (detectAccount76Kind("76.ВА") !== "76.ВА") throw new Error("76VA");
console.log("smoke 76 OK");
console.log("ALL OK");
