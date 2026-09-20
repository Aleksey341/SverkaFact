const XLSX = require("xlsx");
const core = require("./osv-core.cjs");

const dir = "C:/Users/cobra/Desktop/Папки РС/Сверка актов 1 С/";
function load(f) {
  const wb = XLSX.readFile(dir + f, { cellDates: true });
  const sh = wb.Sheets[wb.SheetNames[0]];
  return XLSX.utils.sheet_to_json(sh, { header: 1, raw: true, defval: null });
}

const m60 = load("Оборотно_сальдовая_ведомость_по_счету_60_за_3_квартал_2026_г_ТРИ.xlsx");
const m76 = load("Оборотно_сальдовая_ведомость_по_счету_76_ВА_за_3_квартал_2026_г.xlsx");

console.log("header60:", core.findOsvHeaderRow(m60), "cols:", JSON.stringify(core.resolveOsvAmountCols(m60, core.findOsvHeaderRow(m60)).debEnd));
const d60 = core.parseOsv6062(m60, "osv60");
const d76 = core.parseOsv6062(m76, "osv76va");
console.log("60: account=", d60.mainAccount, "items=", d60.items.length, "skippedDocs=", d60.skippedDocs);
console.log("76: account=", d76.mainAccount, "kind=", d76.vatKind, "items=", d76.items.length, "skippedDocs=", d76.skippedDocs);

const winner60 = d60.items.filter(i => /виннер/i.test(i.name));
console.log("ВИННЕР в 60:", JSON.stringify(winner60));
console.log("ВИННЕР в 76.ВА:", JSON.stringify(d76.items.filter(i => /виннер/i.test(i.name))));
console.log("76.ВА контрагенты:", d76.items.map(i => i.name + " | Кт=" + i.credit + " ДтОб=" + i.debitTurn).join("\n  "));

const idx = core.buildVatAdvanceIndex(d76);
const res = core.checkAdvanceVat(d60, idx, { minAdvance: 1000 });
console.log("\n=== Аванс без авансовой СФ (" + res.kind + "):", res.missing.length,
  "| сумма", res.advTotal, "| НДС~", res.vatTotal, "| мелких пропущено", res.smallSkipped, res.smallSkippedSum);
res.missing.slice(0, 30).forEach(r => console.log("  ", r["Контрагент"], "|", r["Аванс выданный (Дт 60)"],
  "| оплата в периоде", r["Оплачено в периоде (Дт 60 оборот)"], "|", r["Период аванса"], "| НДС~", r["НДС 20/120 расчётно"]));
console.log("\n=== " + res.kind + " без аванса (не восстановлен НДС):", res.notRestored.length);
res.notRestored.forEach(r => console.log("  ", r["Контрагент"], "|", r[res.kind + " сальдо"]));

const totalAdv = d60.items.reduce((s, i) => s + (i.debit > 0 ? i.debit : 0), 0);
console.log("\nИтого Дт-сальдо по 60:", Math.round(totalAdv * 100) / 100, "(в файле итог 5950346.45)");
