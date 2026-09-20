/**
 * Перенос расширенных PRO-модулей из SverkaFact _v2.html → _v2.1.html
 * (без лицензии / демо-гейтов).
 */
const fs = require("fs");
const path = require("path");

const dir = path.join("C:", "Users", "cobra", "Desktop", "Папки РС", "Сверка актов 1 С");
const srcPath = path.join(dir, "SverkaFact _v2.html");
const dstPath = path.join(dir, "SverkaFact _v2.1.html");

let src = fs.readFileSync(srcPath, "utf8").replace(/\r\n/g, "\n");
let dst = fs.readFileSync(dstPath, "utf8").replace(/\r\n/g, "\n");

function extract(html, startMarker, endMarker) {
  const a = html.indexOf(startMarker);
  const b = html.indexOf(endMarker);
  if (a < 0 || b < 0 || b <= a) throw new Error("extract fail: " + startMarker.slice(0, 40));
  return html.slice(a, b);
}

function mustReplace(label, search, repl) {
  if (typeof search === "string") {
    if (!dst.includes(search)) throw new Error("NOT FOUND: " + label);
    dst = dst.replace(search, repl);
  } else {
    if (!search.test(dst)) throw new Error("NOT FOUND (re): " + label);
    search.lastIndex = 0;
    dst = dst.replace(search, repl);
  }
}

// --- Hub texts ---
mustReplace(
  "hub r6062",
  `<button type="button" class="hub-card" data-mode="r6062"><div class="ico">💰</div><h3>Доктор 60/62</h3><p>ОСВ взаиморасчётов: развёрнутое сальдо, аванс+долг, красное сальдо.</p><span class="tag">готово</span></button>`,
  `<button type="button" class="hub-card" data-mode="r6062"><div class="ico">💰</div><h3>Доктор 60/62</h3><p>Развёрнутое сальдо, 76.АВ/ВА, просрочка, дубли, аванс без СФ, шаблон корректировки.</p><span class="tag">готово</span></button>`
);
mustReplace(
  "hub nds",
  `<button type="button" class="hub-card" data-mode="nds"><div class="ico">🧮</div><h3>Сверка НДС</h3><p>Два реестра счетов-фактур / книги покупок и продаж.</p><span class="tag">готово</span></button>`,
  `<button type="button" class="hub-card" data-mode="nds"><div class="ico">🧮</div><h3>Сверка НДС</h3><p>СФ: ИНН/КПП, ставки, исправления, корр. СФ, дубли и причины расхождений.</p><span class="tag">готово</span></button>`
);
mustReplace(
  "hub acq",
  `<button type="button" class="hub-card" data-mode="acq"><div class="ico">💳</div><h3>Эквайринг</h3><p>Реестр терминала ↔ банковская выписка: комиссия и недоплата.</p><span class="tag">готово</span></button>`,
  `<button type="button" class="hub-card" data-mode="acq"><div class="ico">💳</div><h3>Эквайринг</h3><p>Построчно: дата, сумма, комиссия, возвраты, нет зачисления, дубли.</p><span class="tag">готово</span></button>`
);

// --- UI pages from v2 ---
const pageOsv = extract(src, '    <div id="page-r6062"', '    <div id="page-nds"');
const pageNds = extract(src, '    <div id="page-nds"', '    <div id="page-acq"');
const pageAcq = extract(src, '    <div id="page-acq"', '  </div>\n\n<script>');

mustReplace(
  "page osv",
  /    <div id="page-r6062"[\s\S]*?(?=    <div id="page-nds")/,
  pageOsv
);
mustReplace(
  "page nds",
  /    <div id="page-nds"[\s\S]*?(?=    <div id="page-acq")/,
  pageNds
);
mustReplace(
  "page acq",
  /    <div id="page-acq"[\s\S]*?(?=  <\/div>\n\n<script>)/,
  pageAcq
);

// --- JS block from normalizePartnerKey to clearMsg ---
let js = extract(src, "function normalizePartnerKey(name) {", "function clearMsg(id) {");

// Strip license gates
js = js.replace(
  /\n  if \(!hasModuleAccess\("[^"]+"\) && window\.__DEMO_MODE !== "[^"]+"\) \{\n    showMsgIn\("[^"]+", "Модуль PRO\. Откройте «Демо» с главного экрана или активируйте ключ\.", "err"\);\n    return;\n  \}\n/g,
  "\n"
);

// Replace demo gate patterns with always-show full HTML
function ungate(mode, panelsId, fullVar, kpiVar, okMsg, demoMsg) {
  // Pattern variants differ slightly - do generic replacements below
}

// OSV demo gate
js = js.replace(
  `    const demoOsv = gateAfterProRun("r6062", "panelsOsv", () => fullOsv, kpiOsv + '<div class="reason-box">Найдено проблем: <b>' + diag.issues.length + '</b></div>');
    document.getElementById("btnOsvReset").classList.remove("hidden");
    if (!demoOsv) document.getElementById("btnOsvXlsx").classList.remove("hidden");
    showMsgIn("msgOsv", demoOsv ? "Демо: итоги посчитаны. Строки скрыты." : "Проверка 60/62 выполнена.", "ok");`,
  `    document.getElementById("panelsOsv").innerHTML = fullOsv;
    document.getElementById("btnOsvReset").classList.remove("hidden");
    document.getElementById("btnOsvXlsx").classList.remove("hidden");
    showMsgIn("msgOsv", "Проверка 60/62 выполнена.", "ok");`
);

// NDS demo gate
js = js.replace(
  /    const demoNds = gateAfterProRun\("nds", "panelsNds", \(\) => fullNds, kpiNds \+ '<div class="reason-box">Проблемных позиций: <b>' \+ \(problemCount \+ dupCount\) \+ '<\/b><\/div>'\);\n    document\.getElementById\("btnNdsReset"\)\.classList\.remove\("hidden"\);\n    if \(!demoNds\) document\.getElementById\("btnNdsXlsx"\)\.classList\.remove\("hidden"\);\n    showMsgIn\("msgNds", demoNds \? "Демо: итоги посчитаны\. Строки скрыты\." : "Сверка НДС выполнена\.", "ok"\);/,
  `    document.getElementById("panelsNds").innerHTML = fullNds;
    document.getElementById("btnNdsReset").classList.remove("hidden");
    document.getElementById("btnNdsXlsx").classList.remove("hidden");
    showMsgIn("msgNds", "Сверка НДС выполнена.", "ok");`
);

// ACQ demo gate
js = js.replace(
  /    const demoAcq = gateAfterProRun\("acq", "panelsAcq", \(\) => fullAcq, kpiAcq \+ '<div class="reason-box">Расхождение: <b>' \+ fmtMoney\(diff\) \+ '<\/b>; нет зачислений: <b>' \+ line\.missBank\.length \+ '<\/b><\/div>'\);\n    document\.getElementById\("btnAcqReset"\)\.classList\.remove\("hidden"\);\n    if \(!demoAcq\) document\.getElementById\("btnAcqXlsx"\)\.classList\.remove\("hidden"\);\n    showMsgIn\("msgAcq", demoAcq \? "Демо: итоги посчитаны\. Детали скрыты\." : "Сверка эквайринга выполнена\.", "ok"\);/,
  `    document.getElementById("panelsAcq").innerHTML = fullAcq;
    document.getElementById("btnAcqReset").classList.remove("hidden");
    document.getElementById("btnAcqXlsx").classList.remove("hidden");
    showMsgIn("msgAcq", "Сверка эквайринга выполнена.", "ok");`
);

if (js.includes("gateAfterProRun") || js.includes("hasModuleAccess")) {
  console.error("Still has license refs");
  const m = js.match(/gateAfterProRun|hasModuleAccess/g);
  console.error(m);
  process.exit(1);
}

mustReplace(
  "js modules",
  /function parseOsv6062\(matrix, fileName\) \{[\s\S]*?(?=function clearMsg\(id\) \{)/,
  js
);

// resetOsvMode already in js? No - resetOsvMode is after clearMsg in v2. Update reset in v2.1 separately.
mustReplace(
  "reset osv",
  `function resetOsvMode() {
  LAST_OSV = null;
  document.getElementById("osvFile").value = "";
  document.getElementById("panelsOsv").innerHTML = "";
  document.getElementById("reportOsv").classList.add("hidden");
  document.getElementById("btnOsvXlsx").classList.add("hidden");
  document.getElementById("btnOsvReset").classList.add("hidden");
  clearMsg("msgOsv");
}`,
  `function resetOsvMode() {
  LAST_OSV = null;
  document.getElementById("osvFile").value = "";
  const sf = document.getElementById("osvSfFile");
  if (sf) sf.value = "";
  document.getElementById("panelsOsv").innerHTML = "";
  document.getElementById("reportOsv").classList.add("hidden");
  document.getElementById("btnOsvXlsx").classList.add("hidden");
  document.getElementById("btnOsvReset").classList.add("hidden");
  clearMsg("msgOsv");
}`
);

fs.writeFileSync(dstPath, dst.replace(/\n/g, "\r\n"), "utf8");

const h = fs.readFileSync(dstPath, "utf8");
const start = h.lastIndexOf("<script>");
const end = h.lastIndexOf("</script>");
try {
  new Function(h.slice(start + 8, end));
  console.log("JS OK", fs.statSync(dstPath).size);
} catch (e) {
  console.error("JS FAIL", e.message);
  process.exit(1);
}

const checks = {
  osvSf: h.includes("osvSfFile"),
  overdue: h.includes("osvOverdueDays"),
  partnerKey: h.includes("normalizePartnerKey"),
  vatRate: h.includes("parseVatRate"),
  matchAcq: h.includes("matchAcqRows"),
  noLicense: !h.includes("hasModuleAccess") && !h.includes("gateAfterProRun"),
  hub76: h.includes("76.АВ/ВА"),
  fullOsv: h.includes('panelsOsv").innerHTML = fullOsv')
};
console.log(checks);
if (Object.values(checks).some((v) => !v)) process.exit(1);
console.log("v2.1 synced");
