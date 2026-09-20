/**
 * Бейджи severity (ошибка / внимание / справочно) в Докторе 60/62 — v2 и v2.1.
 */
const fs = require("fs");

const dir = "C:/Users/cobra/Desktop/Папки РС/Сверка актов 1 С/";
const FILES = ["SverkaFact _v2.html", "SverkaFact _v2.1.html"];

function mustReplace(src, from, to, label) {
  const n = src.split(from).length - 1;
  if (n !== 1) throw new Error(label + ": найдено " + n);
  return src.replace(from, to);
}

const CSS = `
    .sev {
      display: inline-block;
      padding: 2px 8px;
      border-radius: 999px;
      font-size: 11px;
      font-weight: 700;
      letter-spacing: 0.02em;
      white-space: nowrap;
    }
    .sev-error { background: #fef2f2; color: #b91c1c; border: 1px solid #fecaca; }
    .sev-warning { background: #fffbeb; color: #b45309; border: 1px solid #fde68a; }
    .sev-info { background: #eff6ff; color: #1d4ed8; border: 1px solid #bfdbfe; }
    tr.sev-row-error { background: #fff8f8; }
    tr.sev-row-warning { background: #fffdf5; }
    tr.sev-row-info { background: #f8fbff; }
`;

const HELPERS = `
function severityMeta(level) {
  const s = level === "error" ? "error" : (level === "info" ? "info" : "warning");
  const label = s === "error" ? "ошибка" : (s === "info" ? "справочно" : "внимание");
  const color = s === "error" ? "#fff8f8" : (s === "info" ? "#f8fbff" : "#fffdf5");
  return { severity: s, label, color };
}

function withSeverity(row, level) {
  const m = severityMeta(level);
  row["Тип"] = m.label;
  row._severity = m.severity;
  row._color = row._color || m.color;
  return row;
}

`;

for (const file of FILES) {
  const p = dir + file;
  let src = fs.readFileSync(p, "utf8").replace(/\r\n/g, "\n");

  // CSS после .mode-sub
  if (!src.includes(".sev-error")) {
    src = mustReplace(src,
      `    .mode-sub { margin: 0 0 14px; color: var(--muted); font-size: 14px; line-height: 1.45; }\n`,
      `    .mode-sub { margin: 0 0 14px; color: var(--muted); font-size: 14px; line-height: 1.45; }\n` + CSS,
      "css");
  }

  // helpers перед issueRow
  if (!src.includes("function severityMeta(level)")) {
    src = mustReplace(src,
      `function issueRow(it, problem, cause, action, extra) {`,
      HELPERS + `function issueRow(it, problem, cause, action, extra) {`,
      "helpers");
  }

  // issueRow: поддержать severity в extra
  src = mustReplace(src,
    `function issueRow(it, problem, cause, action, extra) {
  return Object.assign({
    "Счёт": it.account || "—",
    "Контрагент / аналитика": it.name,
    "Договор": it.contract || "—",
    "ИНН": it.inn || "—",
    "Дата": fmtDate(it.date),
    "Сальдо Дт": Math.round(it.debit * 100) / 100,
    "Сальдо Кт": Math.round(it.credit * 100) / 100,
    "Проблема": problem,
    "Вероятная причина": cause,
    "Что сделать": action,
    "Строка": it.sourceRow
  }, extra || {});
}`,
    `function issueRow(it, problem, cause, action, extra) {
  const ex = extra || {};
  const level = ex.severity || ex._severity || "warning";
  const row = {
    "Счёт": it.account || "—",
    "Контрагент / аналитика": it.name,
    "Договор": it.contract || "—",
    "ИНН": it.inn || "—",
    "Дата": fmtDate(it.date),
    "Сальдо Дт": Math.round(it.debit * 100) / 100,
    "Сальдо Кт": Math.round(it.credit * 100) / 100,
    "Тип": "",
    "Проблема": problem,
    "Вероятная причина": cause,
    "Что сделать": action,
    "Строка": it.sourceRow
  };
  Object.assign(row, ex);
  delete row.severity;
  return withSeverity(row, level);
}`,
    "issueRow");

  // renderTable: бейдж Тип + класс строки
  src = mustReplace(src,
    `function renderTable(rows, moneyCols = [], emptyText) {
  if (!rows || !rows.length) return \`<div class="hint">\${emptyText || NO_MATCHES_TEXT}</div>\`;
  const keys = Object.keys(rows[0]).filter(k => !k.startsWith("_"));
  let html = '<div class="table-wrap"><table class="data"><thead><tr>';
  for (const k of keys) html += \`<th>\${k}</th>\`;
  html += "</tr></thead><tbody>";
  for (const row of rows) {
    const bg = row._color ? \` style="background:\${row._color}"\` : "";
    html += \`<tr\${bg}>\`;
    for (const k of keys) {
      let v = row[k];
      const isMoney = moneyCols.includes(k) || /дебет|кредит|сумма|разница|\\bдт\\b|\\bкт\\b/i.test(k);
      if (isMoney && typeof v === "number") v = fmtMoney(v);
      else if (v == null) v = "";
      html += \`<td class="\${isMoney ? "num" : ""}">\${escapeHtml(String(v))}</td>\`;
    }
    html += "</tr>";
  }
  html += "</tbody></table></div>";
  return html;
}`,
    `function renderTable(rows, moneyCols = [], emptyText) {
  if (!rows || !rows.length) return \`<div class="hint">\${emptyText || NO_MATCHES_TEXT}</div>\`;
  const keys = Object.keys(rows[0]).filter(k => !k.startsWith("_"));
  // Колонку «Тип» (severity) ставим сразу после ключевых полей, если есть
  const ordered = keys.includes("Тип")
    ? ["Тип", ...keys.filter(k => k !== "Тип")]
    : keys;
  let html = '<div class="table-wrap"><table class="data"><thead><tr>';
  for (const k of ordered) html += \`<th>\${k}</th>\`;
  html += "</tr></thead><tbody>";
  for (const row of rows) {
    const sevClass = row._severity ? " sev-row-" + row._severity : "";
    const bg = row._color ? \` style="background:\${row._color}"\` : "";
    html += \`<tr class="\${sevClass.trim()}"\${bg}>\`;
    for (const k of ordered) {
      let v = row[k];
      const isMoney = moneyCols.includes(k) || /дебет|кредит|сумма|разница|\\bдт\\b|\\bкт\\b/i.test(k);
      if (k === "Тип" && row._severity) {
        html += \`<td><span class="sev sev-\${row._severity}">\${escapeHtml(String(v || severityMeta(row._severity).label))}</span></td>\`;
        continue;
      }
      if (isMoney && typeof v === "number") v = fmtMoney(v);
      else if (v == null) v = "";
      html += \`<td class="\${isMoney ? "num" : ""}">\${escapeHtml(String(v))}</td>\`;
    }
    html += "</tr>";
  }
  html += "</tbody></table></div>";
  return html;
}`,
    "renderTable");

  // issueRow calls — severity
  const sevMap = [
    [`issueRow(it, kind76 + " с остатком",
        "На счёте НДС с авансов висит сальдо — часто незакрытый аванс или неснятый НДС.",
        "Сверить авансы и счета-фактуры на аванс; закрыть или уточнить остаток.");`,
     `issueRow(it, kind76 + " с остатком",
        "На счёте НДС с авансов висит сальдо — часто незакрытый аванс или неснятый НДС.",
        "Сверить авансы и счета-фактуры на аванс; закрыть или уточнить остаток.",
        { severity: "warning" });`],
    [`issueRow(it, "Нет обязательной аналитики",
        "Сальдо без контрагента/субконто — риск потери контроля взаиморасчётов.",
        "Заполнить аналитику (контрагент, договор) и перепровести документы.");`,
     `issueRow(it, "Нет обязательной аналитики",
        "Сальдо без контрагента/субконто — риск потери контроля взаиморасчётов.",
        "Заполнить аналитику (контрагент, договор) и перепровести документы.",
        { severity: "warning" });`],
    [`issues.push(issueRow(it, "Красное сальдо",
        "Ошибка стороны проводки или лишнее сторно.",
        "Открыть карточку счёта и проверить знак операций."));`,
     `issues.push(issueRow(it, "Красное сальдо",
        "Ошибка стороны проводки или лишнее сторно.",
        "Открыть карточку счёта и проверить знак операций.",
        { severity: "error" }));`],
  ];

  for (let i = 0; i < sevMap.length; i++) {
    if (src.includes(sevMap[i][0])) src = mustReplace(src, sevMap[i][0], sevMap[i][1], "sev-" + i);
  }

  // развёрнутое сальдо — добавить severity в issueRow (5-й аргумент через extra в конце вызова)
  if (!src.includes('same ? "Незачтённый аванс') || src.includes('severity: "warning" });\n      issues.push(row);\n      corrections.push')) {
    // try specific replace for expanded saldo
  }
  src = mustReplace(src,
    `      const row = issueRow(it,
        same ? "Незачтённый аванс (развёрнутое сальдо, суммы близки)" : "Развёрнутое сальдо (долг и аванс одновременно)",
        same
          ? "Аванс не зачтён в погашение задолженности (или наоборот)."
          : "Часть суммы на одном договоре/документе расчётов, часть — на другом.",
        "Сверить карточку и оформить зачёт аванса / корректировку долга.");`,
    `      const row = issueRow(it,
        same ? "Незачтённый аванс (развёрнутое сальдо, суммы близки)" : "Развёрнутое сальдо (долг и аванс одновременно)",
        same
          ? "Аванс не зачтён в погашение задолженности (или наоборот)."
          : "Часть суммы на одном договоре/документе расчётов, часть — на другом.",
        "Сверить карточку и оформить зачёт аванса / корректировку долга.",
        { severity: "warning" });`,
    "expanded");

  src = mustReplace(src,
    `        const row = issueRow(it, "Просроченная задолженность",
          "Дата старше " + overdueDays + " дн. (факт: " + age + " дн.).",
          "Запросить акт сверки / оплату / уточнить срок договора.",
          { "Дней": age });`,
    `        const row = issueRow(it, "Просроченная задолженность",
          "Дата старше " + overdueDays + " дн. (факт: " + age + " дн.).",
          "Запросить акт сверки / оплату / уточнить срок договора.",
          { "Дней": age, severity: "warning" });`,
    "overdue");

  // дубли
  src = mustReplace(src,
    `        const row = issueRow(it, "Возможный дубль контрагента",
          uniqNames.length > 1
            ? "Похожие наименования: " + uniqNames.slice(0, 4).join(" | ")
            : "Один ключ имени, разные ИНН: " + inns.join(", "),
          "Объединить карточки контрагентов в справочнике 1С.");`,
    `        const row = issueRow(it, "Возможный дубль контрагента",
          uniqNames.length > 1
            ? "Похожие наименования: " + uniqNames.slice(0, 4).join(" | ")
            : "Один ключ имени, разные ИНН: " + inns.join(", "),
          "Объединить карточки контрагентов в справочнике 1С.",
          { severity: "warning" });`,
    "dup1");

  src = mustReplace(src,
    `      const row = issueRow(it, "Дубль по ИНН (разные имена)",
        "ИНН " + inn + " встречается под разными наименованиями.",
        "Оставить одну карточку контрагента с корректным наименованием.");`,
    `      const row = issueRow(it, "Дубль по ИНН (разные имена)",
        "ИНН " + inn + " встречается под разными наименованиями.",
        "Оставить одну карточку контрагента с корректным наименованием.",
        { severity: "warning" });`,
    "dup2");

  // checkAdvanceVat rows — withSeverity
  src = mustReplace(src,
    `    row["Строка"] = it.sourceRow;
    missing.push(row);
  }`,
    `    row["Строка"] = it.sourceRow;
    missing.push(withSeverity(row, isReceived ? "error" : "info"));
  }`,
    "adv missing sev");

  src = mustReplace(src,
    `    row["Строка"] = rec.sourceRow;
    notRestored.push(row);
  }`,
    `    row["Строка"] = rec.sourceRow;
    notRestored.push(withSeverity(row, "warning"));
  }`,
    "adv notRestored sev");

  // sf heuristic issueRow — add severity
  if (src.includes('mainIs62\n              ? "Проверить выставление СФ на аванс')) {
    // find the issueRow for sf heuristic
  }
  src = mustReplace(src,
    `            mainIs62
              ? "Проверить выставление СФ на аванс и начисление НДС (76.АВ)."
              : "Точнее проверить можно, загрузив ОСВ по счёту 76.ВА — тогда сверка идёт 60 Дт ↔ 76.ВА.");
          advanceNoSf.push(row);`,
    `            mainIs62
              ? "Проверить выставление СФ на аванс и начисление НДС (76.АВ)."
              : "Точнее проверить можно, загрузив ОСВ по счёту 76.ВА — тогда сверка идёт 60 Дт ↔ 76.ВА.",
            { severity: mainIs62 ? "error" : "info" });
          advanceNoSf.push(row);`,
    "sf heuristic sev");

  // Легенда severity в отчёте ОСВ
  src = mustReplace(src,
    `    let notes = '<div class="reason-box">Счёт по ОСВ: <b>' + (diag.mainAccount || "не определён")`,
    `    const sevLegend = '<div class="legend" style="margin:0 0 12px">'
      + '<span><i class="sev sev-error" style="margin-right:4px">ошибка</i>обязательно исправить</span>'
      + '<span><i class="sev sev-warning" style="margin-right:4px">внимание</i>проверить</span>'
      + '<span><i class="sev sev-info" style="margin-right:4px">справочно</i>право / не блокер</span>'
      + '</div>';
    let notes = sevLegend + '<div class="reason-box">Счёт по ОСВ: <b>' + (diag.mainAccount || "не определён")`,
    "sev legend");

  fs.writeFileSync(p, src.replace(/\n/g, "\r\n"), "utf8");
  console.log("OK", file);
}
console.log("done");
