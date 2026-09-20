/**
 * Патчит SverkaFact _v2.html: хаб + причины + реестры + 60/62 + НДС + эквайринг
 */
const fs = require("fs");
const path = require("path");

const file = path.join(
  "C:", "Users", "cobra", "Desktop", "Папки РС", "Сверка актов 1 С",
  "SverkaFact _v2.html"
);

let html = fs.readFileSync(file, "utf8");

if (html.includes("id=\"page-hub\"")) {
  console.log("Already patched, skip body. Will refresh modules if needed.");
}

const cssExtra = `
    .page { display: none; }
    .page.active { display: block; }
    .hub-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
      gap: 14px;
    }
    .hub-card {
      text-align: left;
      background: #fff;
      border: 1px solid var(--line);
      border-radius: 16px;
      padding: 18px 18px 16px;
      cursor: pointer;
      box-shadow: 0 8px 24px rgba(26, 35, 50, .05);
      transition: border-color .15s, transform .15s, box-shadow .15s;
      width: 100%;
      color: inherit;
      font: inherit;
    }
    .hub-card:hover {
      border-color: #9ec5e8;
      transform: translateY(-2px);
      box-shadow: 0 12px 28px rgba(22, 58, 104, .12);
    }
    .hub-card .ico { font-size: 28px; line-height: 1; margin-bottom: 10px; }
    .hub-card h3 { margin: 0 0 6px; font-size: 17px; color: var(--accent); }
    .hub-card p { margin: 0; color: var(--muted); font-size: 13px; line-height: 1.45; font-weight: 500; }
    .hub-card .tag {
      display: inline-block;
      margin-top: 10px;
      font-size: 11px;
      font-weight: 700;
      color: #0f766e;
      background: #e9f8ef;
      padding: 3px 8px;
      border-radius: 999px;
    }
    .nav-back {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      margin-bottom: 12px;
      background: #fff;
      color: var(--accent);
      border: 1.5px solid var(--accent);
      border-radius: 10px;
      padding: 8px 12px;
      font-weight: 700;
      font-size: 13px;
      cursor: pointer;
    }
    .nav-back:hover { background: #eef5fb; }
    .mode-title { margin: 0 0 4px; font-size: 20px; color: var(--accent); }
    .mode-sub { margin: 0 0 14px; color: var(--muted); font-size: 14px; line-height: 1.45; }
    .reason-box {
      border-left: 4px solid var(--accent);
      background: #f5f9fc;
      padding: 10px 12px;
      border-radius: 0 10px 10px 0;
      margin: 8px 0 14px;
      font-size: 14px;
      line-height: 1.45;
    }
    .kpi-row {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
      gap: 10px;
      margin: 0 0 14px;
    }
    .kpi {
      background: #f5f9fc;
      border: 1px solid var(--line);
      border-radius: 12px;
      padding: 12px 14px;
    }
    .kpi .n { font-size: 22px; font-weight: 800; color: var(--accent); }
    .kpi .l { font-size: 12px; color: var(--muted); margin-top: 2px; }
    .app-locked .page-hub { opacity: 1; pointer-events: auto; }
`;

if (!html.includes(".hub-grid")) {
  html = html.replace(
    "    .hero p { margin: 0; max-width: 820px; line-height: 1.5; opacity: .95; }",
    "    .hero p { margin: 0; max-width: 820px; line-height: 1.5; opacity: .95; }" + cssExtra
  );
}

html = html.replace(/<title>[\s\S]*?<\/title>/, "<title>СверкаФакт v2 — бухгалтерский контролёр</title>");

html = html.replace(
  `.app-locked .work-area { opacity: .45; pointer-events: none; user-select: none; }
    .app-locked #btnRun { pointer-events: none; }`,
  `.app-locked .page-mode { opacity: .45; pointer-events: none; user-select: none; }
    .app-locked #btnRun { pointer-events: none; }`
);

const newBody = `<section class="hero">
      <h1>СверкаФакт</h1>
      <p>Универсальный бухгалтерский контролёр: акты, реестры двух баз, 60/62, НДС и эквайринг. Загрузили выгрузки → увидели расхождения и что проверить. Обработка на вашем ПК.</p>
    </section>

    <section id="licenseBar" class="license-bar trial">
      <div class="status" id="licenseStatus">Проверка лицензии…</div>
      <div class="license-actions">
        <button type="button" class="secondary" id="btnShowLicense" style="padding:8px 12px;font-size:13px">Активировать ключ</button>
        <button type="button" class="reset" id="btnCopyMachine" style="padding:8px 12px;font-size:13px">Код ПК</button>
      </div>
      <div class="license-panel" id="licensePanel">
        <div class="hint" style="margin:0 0 8px">После оплаты пришлите продавцу <b>код ПК</b> — получите ключ на 2 года для этого компьютера.</div>
        <div class="row" style="margin:0">
          <input id="licenseKeyInput" type="text" placeholder="Вставьте ключ лицензии" autocomplete="off" spellcheck="false">
          <button type="button" id="btnActivateKey">Активировать</button>
        </div>
        <div class="hint" id="licenseHint" style="margin-top:8px"></div>
      </div>
    </section>

    <div id="page-hub" class="page page-hub active">
      <section class="card">
        <h2 class="mode-title">Что хотите проверить?</h2>
        <p class="mode-sub">Выберите режим. Каждый работает с Excel/CSV (акты — ещё и PDF с текстом). Файлы никуда не отправляются.</p>
        <div class="hub-grid">
          <button type="button" class="hub-card" data-mode="acts"><div class="ico">🧾</div><h3>Акты сверки</h3><p>Сопоставление двух актов + причины расхождений и что проверить.</p><span class="tag">готово</span></button>
          <button type="button" class="hub-card" data-mode="regs"><div class="ico">🔄</div><h3>Две базы / реестры</h3><p>УТ ↔ БП, ERP ↔ БП или любые два Excel-реестра документов.</p><span class="tag">готово</span></button>
          <button type="button" class="hub-card" data-mode="r6062"><div class="ico">💰</div><h3>Доктор 60/62</h3><p>ОСВ взаиморасчётов: развёрнутое сальдо, аванс+долг, красное сальдо.</p><span class="tag">готово</span></button>
          <button type="button" class="hub-card" data-mode="nds"><div class="ico">🧮</div><h3>Сверка НДС</h3><p>Два реестра счетов-фактур / книги покупок и продаж.</p><span class="tag">готово</span></button>
          <button type="button" class="hub-card" data-mode="acq"><div class="ico">💳</div><h3>Эквайринг</h3><p>Реестр терминала ↔ банковская выписка: комиссия и недоплата.</p><span class="tag">готово</span></button>
        </div>
      </section>
    </div>

    <div id="page-acts" class="page page-mode">
      <button type="button" class="nav-back" data-back>← К выбору режима</button>
      <h2 class="mode-title">Акты сверки</h2>
      <p class="mode-sub">Загрузите два акта (Excel или PDF). Программа сопоставит операции и объяснит вероятные причины расхождений.</p>
      <div class="work-area">
      <section class="card">
        <div class="grid2">
          <div class="file">
            <label for="act1">Акт 1</label>
            <input id="act1" type="file" accept=".xlsx,.xls,.csv,.xlsb,.pdf">
            <div class="hint">Колонки Дата / Документ / Дебет / Кредит. Поддерживается PDF.</div>
          </div>
          <div class="file">
            <label for="act2">Акт 2</label>
            <input id="act2" type="file" accept=".xlsx,.xls,.csv,.xlsb,.pdf">
            <div class="hint">Второй акт: .xlsx, .xls, .csv, .pdf.</div>
          </div>
        </div>
        <div class="opts">
          <div class="optbox">
            <h3>Методы поиска</h3>
            <div class="checks">
              <label><input type="checkbox" id="m1" checked> 1 — Дата+Номер+Сумма</label>
              <label><input type="checkbox" id="m2" checked> 2 — Номер+Сумма</label>
              <label><input type="checkbox" id="m3" checked> 3 — Дата+Сумма</label>
              <label><input type="checkbox" id="m4" checked> 4 — только Сумма</label>
            </div>
          </div>
          <div class="optbox">
            <h3>Номер документа</h3>
            <div class="checks">
              <label><input type="radio" name="num1" value="inside" checked> Акт 1: номер из скобок</label>
              <label><input type="radio" name="num1" value="outside"> Акт 1: номер вне скобок</label>
              <label><input type="radio" name="num2" value="inside" checked> Акт 2: номер из скобок</label>
              <label><input type="radio" name="num2" value="outside"> Акт 2: номер вне скобок</label>
            </div>
          </div>
        </div>
        <div class="row">
          <button id="btnRun" type="button">Сверить акты</button>
          <button id="btnXlsx" class="secondary hidden" type="button">Скачать Excel-отчёт</button>
          <button id="btnReset" class="reset hidden" type="button">Новая сверка</button>
          <span class="hint" style="margin:0">Обработка полностью в браузере.</span>
        </div>
        <div id="msg" class="msg"></div>
      </section>
      <section id="report" class="card hidden">
        <div class="tabs" id="tabs"></div>
        <div id="panels"></div>
      </section>
      </div>
    </div>

    <div id="page-regs" class="page page-mode">
      <button type="button" class="nav-back" data-back>← К выбору режима</button>
      <h2 class="mode-title">Две базы / реестры документов</h2>
      <p class="mode-sub">Выгрузки из УТ и БП (или любых систем): дата, номер/документ, сумма; контрагент желателен.</p>
      <section class="card">
        <div class="grid2">
          <div class="file"><label for="reg1">Реестр A (источник)</label><input id="reg1" type="file" accept=".xlsx,.xls,.csv"></div>
          <div class="file"><label for="reg2">Реестр B (приёмник)</label><input id="reg2" type="file" accept=".xlsx,.xls,.csv"></div>
        </div>
        <div class="row">
          <button id="btnRegRun" type="button">Сверить реестры</button>
          <button id="btnRegXlsx" class="secondary hidden" type="button">Скачать Excel</button>
        </div>
        <div id="msgReg" class="msg"></div>
      </section>
      <section id="reportReg" class="card hidden"><div id="panelsReg"></div></section>
    </div>

    <div id="page-r6062" class="page page-mode">
      <button type="button" class="nav-back" data-back>← К выбору режима</button>
      <h2 class="mode-title">Доктор 60/62</h2>
      <p class="mode-sub">ОСВ по 60/62: развёрнутое сальдо, красное сальдо, долг и аванс одновременно.</p>
      <section class="card">
        <div class="file">
          <label for="osvFile">ОСВ / выгрузка взаиморасчётов</label>
          <input id="osvFile" type="file" accept=".xlsx,.xls,.csv">
          <div class="hint">Колонки: Контрагент (Договор), Сальдо Дт, Сальдо Кт — или конечное сальдо.</div>
        </div>
        <div class="row">
          <button id="btnOsvRun" type="button">Проверить 60/62</button>
          <button id="btnOsvXlsx" class="secondary hidden" type="button">Скачать Excel</button>
        </div>
        <div id="msgOsv" class="msg"></div>
      </section>
      <section id="reportOsv" class="card hidden"><div id="panelsOsv"></div></section>
    </div>

    <div id="page-nds" class="page page-mode">
      <button type="button" class="nav-back" data-back>← К выбору режима</button>
      <h2 class="mode-title">Сверка НДС</h2>
      <p class="mode-sub">Два реестра СФ или книги. Номера нормализуются (000125 = 125).</p>
      <section class="card">
        <div class="grid2">
          <div class="file"><label for="nds1">Реестр / книга A</label><input id="nds1" type="file" accept=".xlsx,.xls,.csv"></div>
          <div class="file"><label for="nds2">Реестр / книга B</label><input id="nds2" type="file" accept=".xlsx,.xls,.csv"></div>
        </div>
        <div class="row">
          <button id="btnNdsRun" type="button">Сверить НДС</button>
          <button id="btnNdsXlsx" class="secondary hidden" type="button">Скачать Excel</button>
        </div>
        <div id="msgNds" class="msg"></div>
      </section>
      <section id="reportNds" class="card hidden"><div id="panelsNds"></div></section>
    </div>

    <div id="page-acq" class="page page-mode">
      <button type="button" class="nav-back" data-back>← К выбору режима</button>
      <h2 class="mode-title">Эквайринг</h2>
      <p class="mode-sub">Реестр терминала и банковские перечисления: продажи, комиссия, факт зачисления.</p>
      <section class="card">
        <div class="grid2">
          <div class="file">
            <label for="acqTerm">Реестр эквайринга</label>
            <input id="acqTerm" type="file" accept=".xlsx,.xls,.csv">
            <div class="hint">Суммы продаж и желательно колонка комиссии.</div>
          </div>
          <div class="file">
            <label for="acqBank">Банковская выписка</label>
            <input id="acqBank" type="file" accept=".xlsx,.xls,.csv">
            <div class="hint">Поступления от банка-эквайера.</div>
          </div>
        </div>
        <div class="row">
          <button id="btnAcqRun" type="button">Сверить эквайринг</button>
          <button id="btnAcqXlsx" class="secondary hidden" type="button">Скачать Excel</button>
        </div>
        <div id="msgAcq" class="msg"></div>
      </section>
      <section id="reportAcq" class="card hidden"><div id="panelsAcq"></div></section>
    </div>
  </div>

`;

if (!html.includes('id="page-hub"')) {
  const bodyStart = html.indexOf('<section class="hero">');
  const bodyEnd = html.indexOf("<script>", bodyStart);
  if (bodyStart < 0 || bodyEnd < 0) throw new Error("body markers not found");
  html = html.slice(0, bodyStart) + newBody + html.slice(bodyEnd);
}

const reasonsFn = `
function normDocNum(n) {
  let s = String(n || "").toUpperCase().replace(/\\s+/g, "");
  s = s.replace(/^№/, "").replace(/[^0-9A-ZА-Я\\-]/gi, "");
  s = s.replace(/^0+/, "") || "0";
  return s;
}

function buildActReasons(act1, act2, comp) {
  const rows = [];
  const used2 = new Set();

  for (const r of (comp.diffDateNumber || [])) {
    rows.push({
      "Тип": "Сумма отличается",
      "Вероятная причина": "Документ найден по дате и номеру, но суммы разные. Возможны корректировка, частичное отражение, НДС или ошибка ввода.",
      "Что сделать": "Открыть оба документа в учёте и сверить сумму с первичкой / УПД.",
      "Дата Акт 1": r["Дата Акт 1"],
      "Документ Акт 1": r["Документ Акт 1"],
      "Дата Акт 2": r["Дата Акт 2"],
      "Документ Акт 2": r["Документ Акт 2"],
      "Разница": r["Разница"]
    });
  }
  for (const r of (comp.diffNumberSum || [])) {
    rows.push({
      "Тип": "Дата отличается",
      "Вероятная причина": "Одна операция: номер и сумма совпали, даты отражения разные (дата проводки vs дата документа).",
      "Что сделать": "Проверить дату в первичке и дату проведения в обоих учётах.",
      "Дата Акт 1": r["Дата Акт 1"],
      "Документ Акт 1": r["Документ Акт 1"],
      "Дата Акт 2": r["Дата Акт 2"],
      "Документ Акт 2": r["Документ Акт 2"],
      "Разница": r["Разница"]
    });
  }

  const idx2ByNum = new Map();
  for (const op of act2.operations) {
    if (!op.number) continue;
    const k = normDocNum(op.number);
    if (!idx2ByNum.has(k)) idx2ByNum.set(k, []);
    idx2ByNum.get(k).push(op);
  }
  const idx2ByAmt = new Map();
  for (const op of act2.operations) {
    const k = amtKey(op.amount);
    if (!idx2ByAmt.has(k)) idx2ByAmt.set(k, []);
    idx2ByAmt.get(k).push(op);
  }

  for (const op1 of (comp.notFound1 || [])) {
    let tip = "Документ не найден у контрагента";
    let cause = "В акте 2 нет пары с близкими реквизитами. Возможно, документ отсутствует в учёте контрагента или оформлен под другим номером.";
    let todo = "Запросить у контрагента подтверждение операции / первичку.";
    let pairDoc = "", pairDate = "";

    if (op1.number) {
      const cands = idx2ByNum.get(normDocNum(op1.number)) || [];
      const free = cands.find(o => !o.matched && !used2.has(o));
      if (free) {
        tip = "Номер есть, не сошлось по сумме/дате/стороне";
        cause = "В акте 2 есть документ с тем же номером, но сверка не связала строки (сумма, дата или сторона Дт/Кт).";
        todo = "Сверить вручную документ " + (free.doc || free.number) + ".";
        pairDoc = free.doc; pairDate = fmtDate(free.date);
        used2.add(free);
      }
    }
    if (!pairDoc) {
      const cands = (idx2ByAmt.get(amtKey(op1.amount)) || []).filter(o => !o.matched && !used2.has(o));
      if (cands.length === 1) {
        const free = cands[0];
        tip = "Возможная пара только по сумме";
        cause = "В акте 2 есть единственная операция на ту же сумму без пары. Часто это та же операция с другим номером/датой.";
        todo = "Сверить вручную: " + (free.doc || "");
        pairDoc = free.doc; pairDate = fmtDate(free.date);
        used2.add(free);
      } else if (cands.length > 1) {
        tip = "Несколько кандидатов по сумме";
        cause = "В акте 2 несколько операций на ту же сумму без пары — автоматическая привязка неоднозначна.";
        todo = "Разобрать вручную по дате и назначению платежа.";
      }
    }

    rows.push({
      "Тип": tip,
      "Вероятная причина": cause,
      "Что сделать": todo,
      "Дата Акт 1": fmtDate(op1.date),
      "Документ Акт 1": op1.doc,
      "Дата Акт 2": pairDate,
      "Документ Акт 2": pairDoc,
      "Разница": op1.amount
    });
  }

  for (const op2 of (comp.notFound2 || [])) {
    if (used2.has(op2)) continue;
    rows.push({
      "Тип": "Лишнее у контрагента / нет у нас",
      "Вероятная причина": "В вашем акте нет пары. Документ мог не попасть в учёт, быть на другом договоре или под другим номером.",
      "Что сделать": "Найти документ в 1С / запросить скан у контрагента.",
      "Дата Акт 1": "",
      "Документ Акт 1": "",
      "Дата Акт 2": fmtDate(op2.date),
      "Документ Акт 2": op2.doc,
      "Разница": op2.amount
    });
  }
  return rows;
}

`;

if (!html.includes("function buildActReasons")) {
  html = html.replace("function compareActs(act1, act2, flags) {", reasonsFn + "function compareActs(act1, act2, flags) {");
}

const oldReturn = `  return {
    methodsSummary,
    notFound1: act1.operations.filter(o => !o.matched),
    notFound2: act2.operations.filter(o => !o.matched),
    ...discs,
    duplicatesDateNumber: dupDN,
    duplicatesNumber: dupN
  };
}`;

const newReturn = `  const notFound1 = act1.operations.filter(o => !o.matched);
  const notFound2 = act2.operations.filter(o => !o.matched);
  const base = {
    methodsSummary,
    notFound1,
    notFound2,
    ...discs,
    duplicatesDateNumber: dupDN,
    duplicatesNumber: dupN
  };
  base.reasons = buildActReasons(act1, act2, base);
  return base;
}`;

if (html.includes(oldReturn)) html = html.replace(oldReturn, newReturn);

html = html.replace(
  `const tabs = [
    ["summary", "Сводка"],
    ["act1", "Акт 1"],
    ["act2", "Акт 2"],
    ["nf", "Расхождения"],
    ["diff", "Разные суммы/даты"],
    ["dup", "Дубликаты"]
  ];`,
  `const tabs = [
    ["summary", "Сводка"],
    ["reasons", "Причины"],
    ["act1", "Акт 1"],
    ["act2", "Акт 2"],
    ["nf", "Расхождения"],
    ["diff", "Разные суммы/даты"],
    ["dup", "Дубликаты"]
  ];`
);

const oldContentStart = `  const content = {
    summary: \`
      <h3 class="section">Периоды сверки</h3>\${renderTable(periodRows)}
      <h3 class="section">Сальдо и обороты</h3>\${renderTable(saldoRows)}
      <h3 class="section">Методы сравнения</h3>\${renderTable(methodRows)}
    \`,
    act1:`;

const newContentStart = `  const reasonIntro = (comp.reasons && comp.reasons.length)
    ? \`<div class="reason-box">Найдено пояснений: <b>\${comp.reasons.length}</b>. Это подсказки для разбора, не замена первички.</div>\`
    : \`<div class="reason-box">Явных расхождений для пояснения нет — все операции нашли пару выбранными методами.</div>\`;
  const content = {
    summary: \`
      <h3 class="section">Периоды сверки</h3>\${renderTable(periodRows)}
      <h3 class="section">Сальдо и обороты</h3>\${renderTable(saldoRows)}
      <h3 class="section">Методы сравнения</h3>\${renderTable(methodRows)}
    \`,
    reasons: \`<h3 class="section">Почему не сходится</h3>\${reasonIntro}\${renderTable(comp.reasons || [], [], "Пояснений нет")}\`,
    act1:`;

if (html.includes(oldContentStart) && !html.includes('reasons:')) {
  html = html.replace(oldContentStart, newContentStart);
}

// Excel sheet for reasons
if (!html.includes('title: "Причины расхождений"') && html.includes('XLSX.utils.book_append_sheet(wb, buildReportSheet')) {
  html = html.replace(
    'XLSX.utils.book_append_sheet(wb, buildReportSheet(act1, act2, comp), "Отчет");',
    `XLSX.utils.book_append_sheet(wb, buildReportSheet(act1, act2, comp), "Отчет");
  XLSX.utils.book_append_sheet(wb, buildMultiSectionSheet([
    { title: "Причины расхождений", rows: comp.reasons || [], emptyText: "Пояснений нет" }
  ]), "Причины");`
  );
}

const modulesJs = `
/* ========== V2: навигация и доп. режимы ========== */
function showPage(id) {
  document.querySelectorAll(".page").forEach(p => p.classList.remove("active"));
  const el = document.getElementById("page-" + id);
  if (el) el.classList.add("active");
  window.scrollTo({ top: 0, behavior: "smooth" });
}

document.querySelectorAll(".hub-card[data-mode]").forEach(btn => {
  btn.addEventListener("click", () => showPage(btn.getAttribute("data-mode")));
});
document.querySelectorAll("[data-back]").forEach(btn => {
  btn.addEventListener("click", () => showPage("hub"));
});

function showMsgIn(id, text, type) {
  const el = document.getElementById(id);
  if (!el) return;
  el.textContent = text;
  el.className = "msg " + type;
}

function findColSmart(matrix, headerRow, variants) {
  return findColByVariants(matrix, headerRow, variants);
}

function parseGenericRegistry(matrix, fileName) {
  const cols = detectColumns(matrix);
  const headerRow = cols.headerRow || 0;
  const partnerCol = findColSmart(matrix, headerRow, ["контрагент", "покупатель", "поставщик", "организация", "партнер", "партнёр"]);
  const rows = [];
  for (let r = headerRow + 1; r < matrix.length; r++) {
    const row = matrix[r] || [];
    const rawDate = row[cols.date];
    const rawDoc = row[cols.document];
    const rawDebit = row[cols.debit];
    const rawCredit = cols.credit >= 0 ? row[cols.credit] : null;
    const d = parseDate(typeof rawDate === "string" ? String(rawDate).replace(/г\\./gi, "") : rawDate);
    let amount = parseAmount(rawDebit);
    if (amount == null) amount = parseAmount(rawCredit);
    if (amount == null) {
      for (let c = 0; c < row.length; c++) {
        if (c === cols.date) continue;
        const a = parseAmount(row[c]);
        if (a != null && a !== 0) { amount = a; break; }
      }
    }
    const doc = normalizeText(rawDoc);
    if (d == null && !doc) continue;
    if (amount == null) continue;
    const { number } = extractDocInfo(doc || String(rawDate || ""), true);
    let num = number;
    if (!num && doc) {
      const m = String(doc).match(/\\d{1,10}/);
      if (m) num = m[0];
    }
    rows.push({
      sourceRow: r + 1,
      date: d,
      doc: doc || "(без документа)",
      number: num || "",
      amount: Math.abs(amount),
      partner: partnerCol >= 0 ? normalizeText(row[partnerCol]) : "",
      matched: false
    });
  }
  return { name: fileName, rows, warnings: cols.blockCount > 1 ? ["Взята левая таблица"] : [] };
}

function compareRegistries(a, b) {
  const used = new Set();
  const matched = [];
  const missB = [];
  const sumDiff = [];
  const dateDiff = [];

  const byNum = new Map();
  b.rows.forEach((row, i) => {
    const k = normDocNum(row.number);
    if (!k || k === "0") return;
    if (!byNum.has(k)) byNum.set(k, []);
    byNum.get(k).push(i);
  });

  for (const ra of a.rows) {
    let found = null;
    const k = normDocNum(ra.number);
    if (k && k !== "0") {
      for (const i of (byNum.get(k) || [])) {
        if (used.has(i)) continue;
        found = i;
        break;
      }
    }
    if (found == null) {
      for (let i = 0; i < b.rows.length; i++) {
        if (used.has(i)) continue;
        const rb = b.rows[i];
        if (amtKey(ra.amount) === amtKey(rb.amount) && dateKey(ra.date) === dateKey(rb.date)) {
          found = i; break;
        }
      }
    }
    if (found == null) {
      missB.push(ra);
      continue;
    }
    used.add(found);
    const rb = b.rows[found];
    ra.matched = true; rb.matched = true;
    if (amtKey(ra.amount) !== amtKey(rb.amount)) {
      sumDiff.push({
        "№ A": ra.number, "Дата A": fmtDate(ra.date), "Сумма A": ra.amount, "Документ A": ra.doc,
        "№ B": rb.number, "Дата B": fmtDate(rb.date), "Сумма B": rb.amount, "Документ B": rb.doc,
        "Разница": Math.round((ra.amount - rb.amount) * 100) / 100
      });
    } else if (dateKey(ra.date) !== dateKey(rb.date)) {
      dateDiff.push({
        "№ A": ra.number, "Дата A": fmtDate(ra.date), "Сумма A": ra.amount, "Документ A": ra.doc,
        "№ B": rb.number, "Дата B": fmtDate(rb.date), "Сумма B": rb.amount, "Документ B": rb.doc
      });
    } else {
      matched.push({
        "№": ra.number || rb.number,
        "Дата A": fmtDate(ra.date), "Дата B": fmtDate(rb.date),
        "Сумма": ra.amount,
        "Документ A": ra.doc, "Документ B": rb.doc
      });
    }
  }
  const missA = b.rows.filter((_, i) => !used.has(i));
  return { matched, missB, missA, sumDiff, dateDiff };
}

function renderKpi(items) {
  return '<div class="kpi-row">' + items.map(([n, l]) =>
    '<div class="kpi"><div class="n">' + escapeHtml(String(n)) + '</div><div class="l">' + escapeHtml(l) + '</div></div>'
  ).join("") + '</div>';
}

let LAST_REG = null;
document.getElementById("btnRegRun").addEventListener("click", async () => {
  const f1 = document.getElementById("reg1").files[0];
  const f2 = document.getElementById("reg2").files[0];
  if (!f1 || !f2) { showMsgIn("msgReg", "Загрузите оба реестра.", "err"); return; }
  try { assertLicenseOrThrow(); } catch (e) { showMsgIn("msgReg", e.message, "err"); return; }
  showMsgIn("msgReg", "Сверяю реестры…", "info");
  try {
    const [raw1, raw2] = await Promise.all([readFileToMatrix(f1), readFileToMatrix(f2)]);
    const a = parseGenericRegistry(raw1.matrix, raw1.fileName);
    const b = parseGenericRegistry(raw2.matrix, raw2.fileName);
    if (!a.rows.length) throw new Error("В реестре A не найдено строк с суммой.");
    if (!b.rows.length) throw new Error("В реестре B не найдено строк с суммой.");
    const comp = compareRegistries(a, b);
    LAST_REG = { a, b, comp };
    const missBRows = comp.missB.map(r => ({ "Дата": fmtDate(r.date), "№": r.number, "Документ": r.doc, "Сумма": r.amount, "Контрагент": r.partner, "Строка": r.sourceRow }));
    const missARows = comp.missA.map(r => ({ "Дата": fmtDate(r.date), "№": r.number, "Документ": r.doc, "Сумма": r.amount, "Контрагент": r.partner, "Строка": r.sourceRow }));
    document.getElementById("reportReg").classList.remove("hidden");
    document.getElementById("btnRegXlsx").classList.remove("hidden");
    document.getElementById("panelsReg").innerHTML =
      renderKpi([
        [a.rows.length, "Строк в A"],
        [b.rows.length, "Строк в B"],
        [comp.matched.length, "Совпали"],
        [comp.missB.length, "Нет в B"],
        [comp.missA.length, "Нет в A"],
        [comp.sumDiff.length, "Σ отличается"],
        [comp.dateDiff.length, "Дата отличается"]
      ]) +
      '<h3 class="section">Отсутствуют в B (есть в A)</h3>' + renderTable(missBRows, [], "Все документы A найдены в B") +
      '<h3 class="section">Отсутствуют в A (есть в B)</h3>' + renderTable(missARows, [], "Все документы B найдены в A") +
      '<h3 class="section">Отличается сумма</h3>' + renderTable(comp.sumDiff, [], "Нет") +
      '<h3 class="section">Отличается дата</h3>' + renderTable(comp.dateDiff, [], "Нет") +
      '<h3 class="section">Совпадения</h3>' + renderTable(comp.matched.slice(0, 500), [], "Нет совпадений");
    showMsgIn("msgReg", "Сверка реестров выполнена.", "ok");
  } catch (e) {
    console.error(e);
    showMsgIn("msgReg", e.message || String(e), "err");
  }
});
document.getElementById("btnRegXlsx").addEventListener("click", () => {
  if (!LAST_REG) return;
  const { a, b, comp } = LAST_REG;
  const wb = XLSX.utils.book_new();
  const missBRows = comp.missB.map(r => ({ "Дата": fmtDate(r.date), "№": r.number, "Документ": r.doc, "Сумма": r.amount, "Контрагент": r.partner }));
  const missARows = comp.missA.map(r => ({ "Дата": fmtDate(r.date), "№": r.number, "Документ": r.doc, "Сумма": r.amount, "Контрагент": r.partner }));
  XLSX.utils.book_append_sheet(wb, buildMultiSectionSheet([
    { title: "Нет в B", rows: missBRows, emptyText: "Нет" },
    { title: "Нет в A", rows: missARows, emptyText: "Нет" },
    { title: "Сумма отличается", rows: comp.sumDiff, emptyText: "Нет" },
    { title: "Дата отличается", rows: comp.dateDiff, emptyText: "Нет" },
    { title: "Совпадения", rows: comp.matched, emptyText: "Нет" }
  ]), "Реестры");
  XLSX.writeFile(wb, "SverkaFact_reestry.xlsx");
});

function parseOsv6062(matrix, fileName) {
  const headerRow = findHeaderRow(matrix) ?? 0;
  const nameCol = findColSmart(matrix, headerRow, ["контрагент", "субконто", "договор", "аналитика", "наименование", "организация"]);
  let debCol = findColSmart(matrix, headerRow, ["сальдо конечное дт", "кон. сальдо дт", "сальдо кт дт", "дебет конеч", "ск дт", "сальдо дт", "дебет"]);
  let credCol = findColSmart(matrix, headerRow, ["сальдо конечное кт", "кон. сальдо кт", "кредит конеч", "ск кт", "сальдо кт", "кредит"]);
  if (nameCol < 0) throw new Error("Не найдена колонка контрагента / субконто.");
  // если одна колонка «сальдо» — ищем пару соседних дт/кт по заголовкам
  if (debCol < 0 || credCol < 0) {
    const width = matrixWidth(matrix);
    for (let c = 0; c < width; c++) {
      const t = headerText(matrix, headerRow, c).toLowerCase();
      if (debCol < 0 && /дебет|\\bдт\\b/.test(t) && /сальдо|кон/.test(t)) debCol = c;
      if (credCol < 0 && /кредит|\\bкт\\b/.test(t) && /сальдо|кон/.test(t)) credCol = c;
    }
  }
  if (debCol < 0 && credCol < 0) throw new Error("Не найдены колонки сальдо Дт/Кт. Выгрузите ОСВ с конечным сальдо.");
  const items = [];
  for (let r = headerRow + 1; r < matrix.length; r++) {
    const row = matrix[r] || [];
    const name = normalizeText(row[nameCol]);
    if (!name || /^итого|всего|оборот/i.test(name)) continue;
    const deb = debCol >= 0 ? parseAmount(row[debCol]) : null;
    const cred = credCol >= 0 ? parseAmount(row[credCol]) : null;
    if ((deb == null || deb === 0) && (cred == null || cred === 0)) continue;
    items.push({ name, debit: deb || 0, credit: cred || 0, sourceRow: r + 1 });
  }
  return { name: fileName, items };
}

function diagnose6062(data) {
  const issues = [];
  for (const it of data.items) {
    const d = Math.round(it.debit * 100) / 100;
    const c = Math.round(it.credit * 100) / 100;
    if (d > 0.009 && c > 0.009) {
      const same = Math.abs(d - c) < 0.02;
      issues.push({
        "Контрагент / аналитика": it.name,
        "Сальдо Дт": d,
        "Сальдо Кт": c,
        "Проблема": same ? "Развёрнутое сальдо (долг и аванс одновременно, суммы близки)" : "Развёрнутое сальдо (есть и Дт, и Кт)",
        "Вероятная причина": same
          ? "Аванс не зачтён в погашение задолженности (или наоборот)."
          : "Часть суммы на одном договоре/документе расчётов, часть — на другом.",
        "Что сделать": "Проверить документы расчётов и зачёт аванса по этому контрагенту/договору.",
        "Строка": it.sourceRow
      });
    } else if (d < -0.009 || c < -0.009) {
      issues.push({
        "Контрагент / аналитика": it.name,
        "Сальдо Дт": d,
        "Сальдо Кт": c,
        "Проблема": "Красное сальдо",
        "Вероятная причина": "Ошибка стороны проводки или лишнее сторно.",
        "Что сделать": "Открыть карточку счёта и проверить знак операций.",
        "Строка": it.sourceRow
      });
    }
  }
  return issues;
}

let LAST_OSV = null;
document.getElementById("btnOsvRun").addEventListener("click", async () => {
  const f = document.getElementById("osvFile").files[0];
  if (!f) { showMsgIn("msgOsv", "Загрузите файл ОСВ.", "err"); return; }
  try { assertLicenseOrThrow(); } catch (e) { showMsgIn("msgOsv", e.message, "err"); return; }
  showMsgIn("msgOsv", "Анализирую ОСВ…", "info");
  try {
    const raw = await readFileToMatrix(f);
    const data = parseOsv6062(raw.matrix, raw.fileName);
    const issues = diagnose6062(data);
    LAST_OSV = { data, issues };
    document.getElementById("reportOsv").classList.remove("hidden");
    document.getElementById("btnOsvXlsx").classList.remove("hidden");
    document.getElementById("panelsOsv").innerHTML =
      renderKpi([[data.items.length, "Строк аналитики"], [issues.length, "Замечаний"]]) +
      '<div class="reason-box">Обычная ОСВ может показать «ноль», когда внутри одновременно висят долг и аванс. Ниже — такие случаи.</div>' +
      '<h3 class="section">Найденные проблемы</h3>' + renderTable(issues, [], "Критических замечаний не найдено");
    showMsgIn("msgOsv", "Проверка 60/62 выполнена.", "ok");
  } catch (e) {
    console.error(e);
    showMsgIn("msgOsv", e.message || String(e), "err");
  }
});
document.getElementById("btnOsvXlsx").addEventListener("click", () => {
  if (!LAST_OSV) return;
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, buildMultiSectionSheet([
    { title: "Проблемы 60/62", rows: LAST_OSV.issues, emptyText: "Нет" }
  ]), "60-62");
  XLSX.writeFile(wb, "SverkaFact_60_62.xlsx");
});

function parseSfRegistry(matrix, fileName) {
  const headerRow = findHeaderRow(matrix) ?? 0;
  const dateCol = findColSmart(matrix, headerRow, ["дата", "дата сф", "дата счета"]);
  const numCol = findColSmart(matrix, headerRow, ["номер", "№", "номер сф", "счет-фактура", "счёт-фактура"]);
  const sumCol = findColSmart(matrix, headerRow, ["стоимость", "сумма", "всего", "сумма с ндс", "продажи", "покупки"]);
  const ndsCol = findColSmart(matrix, headerRow, ["ндс", "сумма ндс", "ндс всего"]);
  const partnerCol = findColSmart(matrix, headerRow, ["контрагент", "продавец", "покупатель", "наименование"]);
  if (numCol < 0 && dateCol < 0) throw new Error("Не найдены колонки номера/даты СФ в «" + fileName + "».");
  const rows = [];
  for (let r = headerRow + 1; r < matrix.length; r++) {
    const row = matrix[r] || [];
    const numRaw = numCol >= 0 ? normalizeText(row[numCol]) : "";
    const d = dateCol >= 0 ? parseDate(row[dateCol]) : null;
    let amount = sumCol >= 0 ? parseAmount(row[sumCol]) : null;
    const nds = ndsCol >= 0 ? parseAmount(row[ndsCol]) : null;
    if (!numRaw && d == null) continue;
    if (amount == null && nds == null) continue;
    if (amount == null) amount = nds;
    const number = normDocNum(numRaw || extractDocInfo(numRaw, true).number);
    rows.push({
      sourceRow: r + 1,
      date: d,
      number,
      amount: amount || 0,
      nds: nds,
      partner: partnerCol >= 0 ? normalizeText(row[partnerCol]) : "",
      matched: false
    });
  }
  return { name: fileName, rows };
}

function compareNds(a, b) {
  const used = new Set();
  const ok = [], sumDiff = [], ndsDiff = [], missB = [], missA = [];
  const byNum = new Map();
  b.rows.forEach((row, i) => {
    const k = row.number || ("d:" + dateKey(row.date) + ":" + amtKey(row.amount));
    if (!byNum.has(k)) byNum.set(k, []);
    byNum.get(k).push(i);
  });
  for (const ra of a.rows) {
    const k = ra.number || ("d:" + dateKey(ra.date) + ":" + amtKey(ra.amount));
    let idx = null;
    for (const i of (byNum.get(k) || [])) {
      if (!used.has(i)) { idx = i; break; }
    }
    if (idx == null) { missB.push(ra); continue; }
    used.add(idx);
    const rb = b.rows[idx];
    const row = {
      "№ норм.": ra.number || rb.number,
      "Дата A": fmtDate(ra.date), "Дата B": fmtDate(rb.date),
      "Сумма A": ra.amount, "Сумма B": rb.amount,
      "НДС A": ra.nds, "НДС B": rb.nds,
      "Контрагент A": ra.partner, "Контрагент B": rb.partner
    };
    if (amtKey(ra.amount) !== amtKey(rb.amount)) sumDiff.push(row);
    else if (ra.nds != null && rb.nds != null && amtKey(ra.nds) !== amtKey(rb.nds)) ndsDiff.push(row);
    else ok.push(row);
  }
  b.rows.forEach((rb, i) => { if (!used.has(i)) missA.push(rb); });
  return { ok, sumDiff, ndsDiff, missB, missA };
}

let LAST_NDS = null;
document.getElementById("btnNdsRun").addEventListener("click", async () => {
  const f1 = document.getElementById("nds1").files[0];
  const f2 = document.getElementById("nds2").files[0];
  if (!f1 || !f2) { showMsgIn("msgNds", "Загрузите оба файла.", "err"); return; }
  try { assertLicenseOrThrow(); } catch (e) { showMsgIn("msgNds", e.message, "err"); return; }
  showMsgIn("msgNds", "Сверяю НДС…", "info");
  try {
    const [raw1, raw2] = await Promise.all([readFileToMatrix(f1), readFileToMatrix(f2)]);
    const a = parseSfRegistry(raw1.matrix, raw1.fileName);
    const b = parseSfRegistry(raw2.matrix, raw2.fileName);
    if (!a.rows.length || !b.rows.length) throw new Error("Не удалось прочитать строки СФ. Проверьте заголовки колонок.");
    const comp = compareNds(a, b);
    LAST_NDS = { a, b, comp };
    const mapMiss = (arr) => arr.map(r => ({ "№": r.number, "Дата": fmtDate(r.date), "Сумма": r.amount, "НДС": r.nds, "Контрагент": r.partner }));
    document.getElementById("reportNds").classList.remove("hidden");
    document.getElementById("btnNdsXlsx").classList.remove("hidden");
    document.getElementById("panelsNds").innerHTML =
      renderKpi([[a.rows.length, "СФ в A"], [b.rows.length, "СФ в B"], [comp.ok.length, "OK"], [comp.missB.length, "Нет в B"], [comp.sumDiff.length + comp.ndsDiff.length, "Σ/НДС ≠"]]) +
      '<h3 class="section">Нет в B</h3>' + renderTable(mapMiss(comp.missB), [], "Нет") +
      '<h3 class="section">Нет в A</h3>' + renderTable(mapMiss(comp.missA), [], "Нет") +
      '<h3 class="section">Отличается стоимость</h3>' + renderTable(comp.sumDiff, [], "Нет") +
      '<h3 class="section">Отличается НДС</h3>' + renderTable(comp.ndsDiff, [], "Нет");
    showMsgIn("msgNds", "Сверка НДС выполнена.", "ok");
  } catch (e) {
    console.error(e);
    showMsgIn("msgNds", e.message || String(e), "err");
  }
});
document.getElementById("btnNdsXlsx").addEventListener("click", () => {
  if (!LAST_NDS) return;
  const c = LAST_NDS.comp;
  const mapMiss = (arr) => arr.map(r => ({ "№": r.number, "Дата": fmtDate(r.date), "Сумма": r.amount, "НДС": r.nds }));
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, buildMultiSectionSheet([
    { title: "Нет в B", rows: mapMiss(c.missB), emptyText: "Нет" },
    { title: "Нет в A", rows: mapMiss(c.missA), emptyText: "Нет" },
    { title: "Сумма", rows: c.sumDiff, emptyText: "Нет" },
    { title: "НДС", rows: c.ndsDiff, emptyText: "Нет" }
  ]), "НДС");
  XLSX.writeFile(wb, "SverkaFact_NDS.xlsx");
});

function sumAmountColumn(matrix) {
  const headerRow = findHeaderRow(matrix) ?? 0;
  const sumCols = [];
  const width = matrixWidth(matrix);
  for (let c = 0; c < width; c++) {
    const t = headerText(matrix, headerRow, c).toLowerCase();
    if (/сумма|итого|зачислен|оплат|продаж|оборот|комисс|amount|total/.test(t)) sumCols.push({ c, t });
  }
  let saleCol = sumCols.find(x => /продаж|оборот|сумма(?!.*комисс)/.test(x.t) || x.t.includes("сумма"))?.c;
  let feeCol = sumCols.find(x => /комисс/.test(x.t))?.c;
  let bankCol = sumCols.find(x => /зачислен|перечисл|поступ/.test(x.t))?.c;
  if (saleCol == null && sumCols[0]) saleCol = sumCols[0].c;
  let sales = 0, fees = 0, bank = 0, n = 0;
  for (let r = headerRow + 1; r < matrix.length; r++) {
    const row = matrix[r] || [];
    const s = saleCol != null ? parseAmount(row[saleCol]) : null;
    const f = feeCol != null ? parseAmount(row[feeCol]) : null;
    const b = bankCol != null ? parseAmount(row[bankCol]) : null;
    if (s != null) { sales += s; n++; }
    if (f != null) fees += f;
    if (b != null) bank += b;
    if (s == null && f == null && b == null) {
      for (let c = 0; c < row.length; c++) {
        const a = parseAmount(row[c]);
        if (a != null) { sales += Math.abs(a); n++; break; }
      }
    }
  }
  return { sales: Math.round(sales * 100) / 100, fees: Math.round(fees * 100) / 100, bank: Math.round(bank * 100) / 100, n };
}

let LAST_ACQ = null;
document.getElementById("btnAcqRun").addEventListener("click", async () => {
  const f1 = document.getElementById("acqTerm").files[0];
  const f2 = document.getElementById("acqBank").files[0];
  if (!f1 || !f2) { showMsgIn("msgAcq", "Загрузите оба файла.", "err"); return; }
  try { assertLicenseOrThrow(); } catch (e) { showMsgIn("msgAcq", e.message, "err"); return; }
  showMsgIn("msgAcq", "Сверяю эквайринг…", "info");
  try {
    const [raw1, raw2] = await Promise.all([readFileToMatrix(f1), readFileToMatrix(f2)]);
    const term = sumAmountColumn(raw1.matrix);
    const bank = sumAmountColumn(raw2.matrix);
    const bankIn = bank.bank || bank.sales;
    const expected = Math.round((term.sales - term.fees) * 100) / 100;
    const diff = Math.round((expected - bankIn) * 100) / 100;
    const rows = [
      { "Показатель": "Продажи по терминалу", "Сумма": term.sales },
      { "Показатель": "Комиссия (из файла терминала)", "Сумма": term.fees },
      { "Показатель": "Ожидаемое перечисление", "Сумма": expected },
      { "Показатель": "Банк перечислил", "Сумма": bankIn },
      { "Показатель": "Расхождение", "Сумма": diff }
    ];
    LAST_ACQ = { rows, diff, term, bankIn };
    document.getElementById("reportAcq").classList.remove("hidden");
    document.getElementById("btnAcqXlsx").classList.remove("hidden");
    document.getElementById("panelsAcq").innerHTML =
      renderKpi([[fmtMoney(term.sales), "Продажи"], [fmtMoney(term.fees), "Комиссия"], [fmtMoney(bankIn), "Банк"], [fmtMoney(diff), "Δ"]]) +
      (Math.abs(diff) < 0.02
        ? '<div class="reason-box">Суммы сходятся: продажи − комиссия ≈ перечисление банка.</div>'
        : '<div class="reason-box">Есть расхождение. Проверьте незавершённые дни, возвраты и удержания банка.</div>') +
      '<h3 class="section">Итоги</h3>' + renderTable(rows);
    showMsgIn("msgAcq", "Сверка эквайринга выполнена.", "ok");
  } catch (e) {
    console.error(e);
    showMsgIn("msgAcq", e.message || String(e), "err");
  }
});
document.getElementById("btnAcqXlsx").addEventListener("click", () => {
  if (!LAST_ACQ) return;
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, buildMultiSectionSheet([
    { title: "Эквайринг", rows: LAST_ACQ.rows, emptyText: "Нет" }
  ]), "Эквайринг");
  XLSX.writeFile(wb, "SverkaFact_acquiring.xlsx");
});
`;

const marker = 'document.getElementById("btnRun").addEventListener("click"';
if (!html.includes("function showPage(id)")) {
  if (!html.includes(marker)) throw new Error("btnRun marker missing");
  html = html.replace(marker, modulesJs + "\n" + marker);
}

fs.writeFileSync(file, html, "utf8");
console.log("Patched OK:", file, "bytes", fs.statSync(file).size);
console.log("hub", html.includes("page-hub"));
console.log("reasons", html.includes("buildActReasons"));
console.log("regs", html.includes("btnRegRun"));
console.log("reasons tab", html.includes('["reasons", "Причины"]'));
