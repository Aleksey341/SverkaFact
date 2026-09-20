/**
 * 1) Колонка severity → «Важность» (не конфликтует с «Тип» в актах/эквайринге)
 * 2) Severity в актах, НДС, эквайринге
 * 3) FAQ-блоки в формах
 */
const fs = require("fs");

const dir = "C:/Users/cobra/Desktop/Папки РС/Сверка актов 1 С/";
const FILES = ["SverkaFact _v2.html", "SverkaFact _v2.1.html"];

function mustReplace(src, from, to, label) {
  const n = src.split(from).length - 1;
  if (n !== 1) throw new Error(label + ": " + n);
  return src.replace(from, to);
}

function replaceAllOnce(src, from, to, label) {
  if (!src.includes(from)) throw new Error(label + ": не найдено");
  return src.split(from).join(to);
}

const FAQ_CSS = `
    details.faq-box {
      margin: 10px 0 4px;
      border: 1px solid var(--line);
      border-radius: 12px;
      background: #fafcfe;
      padding: 8px 12px;
      font-size: 13px;
      line-height: 1.45;
      color: var(--muted);
    }
    details.faq-box summary {
      cursor: pointer;
      font-weight: 700;
      color: var(--accent);
      list-style: none;
    }
    details.faq-box summary::-webkit-details-marker { display: none; }
    details.faq-box summary::before { content: "▸ "; }
    details.faq-box[open] summary::before { content: "▾ "; }
    details.faq-box ul { margin: 8px 0 4px; padding-left: 18px; }
    details.faq-box li { margin: 4px 0; }
`;

const FAQ_ACTS = `
        <details class="faq-box">
          <summary>Кратко: как читать результат</summary>
          <ul>
            <li><b>Важность:</b> ошибка — разобрать обязательно; внимание — проверить; справочно — пояснение без блокера.</li>
            <li>Суммы разные при одной дате/номере — сверить первичку / УПД.</li>
            <li>Даты разные при одном номере и сумме — часто дата документа vs дата проводки.</li>
            <li>Нет пары — другой договор, период или номер; запросите скан у контрагента.</li>
            <li>Файлы не уходят с компьютера — обработка в браузере.</li>
          </ul>
        </details>`;

const FAQ_REGS = `
        <details class="faq-box">
          <summary>Кратко: реестры УТ ↔ БП</summary>
          <ul>
            <li>Нужны колонки: дата, номер/документ, сумма; контрагент желателен.</li>
            <li>Сопоставление похоже на акты: ищем пары и показываем, чего нет с одной стороны.</li>
            <li>Выгрузки из любых систем, не только 1С УТ/БП.</li>
          </ul>
        </details>`;

const FAQ_6062 = `
        <details class="faq-box">
          <summary>Кратко: авансы и 76.ВА / 76.АВ</summary>
          <ul>
            <li>К ОСВ <b>60</b> — второй файл ОСВ <b>76.ВА</b> (авансовые СФ полученные / книга покупок).</li>
            <li>К ОСВ <b>62</b> — ОСВ <b>76.АВ</b> (авансовые СФ выданные / книга продаж).</li>
            <li>Аванс выданный без 76.ВА — <b>справочно</b>: вычет НДС с аванса — право, не обязанность.</li>
            <li>Аванс полученный без 76.АВ — <b>ошибка</b>: СФ на аванс обязательна.</li>
            <li>Порог «Аванс от, ₽» отсекает копеечные переплаты.</li>
          </ul>
        </details>`;

const FAQ_NDS = `
        <details class="faq-box">
          <summary>Кратко: сверка НДС</summary>
          <ul>
            <li>Два реестра СФ или книги (покупки/продажи — как вам нужно сравнить).</li>
            <li>Смотрим номер, сумму, НДС, ставку, ИНН/КПП, исправления и дубли.</li>
            <li>«Нет в A/B» — СФ только в одном файле; проверьте период и номер исправления.</li>
          </ul>
        </details>`;

const FAQ_ACQ = `
        <details class="faq-box">
          <summary>Кратко: эквайринг</summary>
          <ul>
            <li>Терминал ↔ банк: учтите T+1/T+2 и комиссию в выписке.</li>
            <li>«Совпали только по сумме» — проверить вручную (часто сдвиг даты).</li>
            <li>Возвраты и дубли выносятся отдельными блоками.</li>
          </ul>
        </details>`;

for (const file of FILES) {
  const p = dir + file;
  let src = fs.readFileSync(p, "utf8").replace(/\r\n/g, "\n");
  const isPro = file.includes("_v2.html") && !file.includes("v2.1");

  // --- FAQ CSS ---
  if (!src.includes("details.faq-box")) {
    src = mustReplace(src,
      `    .sev-info { background: #eff6ff; color: #1d4ed8; border: 1px solid #bfdbfe; }\n`,
      `    .sev-info { background: #eff6ff; color: #1d4ed8; border: 1px solid #bfdbfe; }\n` + FAQ_CSS,
      "faq css");
  }

  // --- Rename severity column Тип → Важность ---
  src = mustReplace(src,
    `function withSeverity(row, level) {
  const m = severityMeta(level);
  row["Тип"] = m.label;
  row._severity = m.severity;
  row._color = row._color || m.color;
  return row;
}`,
    `function withSeverity(row, level) {
  const m = severityMeta(level);
  row["Важность"] = m.label;
  row._severity = m.severity;
  row._color = row._color || m.color;
  return row;
}`,
    "withSeverity name");

  src = mustReplace(src,
    `    "Тип": "",
    "Проблема": problem,`,
    `    "Важность": "",
    "Проблема": problem,`,
    "issueRow Vazhnost");

  src = mustReplace(src,
    `  const ordered = keys.includes("Тип")
    ? ["Тип", ...keys.filter(k => k !== "Тип")]
    : keys;`,
    `  const ordered = keys.includes("Важность")
    ? ["Важность", ...keys.filter(k => k !== "Важность")]
    : keys;`,
    "render ordered");

  src = mustReplace(src,
    `      if (k === "Тип" && row._severity) {
        html += \`<td><span class="sev sev-\${row._severity}">\${escapeHtml(String(v || severityMeta(row._severity).label))}</span></td>\`;
        continue;
      }`,
    `      if (k === "Важность" && row._severity) {
        html += \`<td><span class="sev sev-\${row._severity}">\${escapeHtml(String(v || severityMeta(row._severity).label))}</span></td>\`;
        continue;
      }`,
    "render badge");

  // --- Acts: withSeverity ---
  src = mustReplace(src,
    `  for (const r of (comp.diffDateNumber || [])) {
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
  }`,
    `  for (const r of (comp.diffDateNumber || [])) {
    rows.push(withSeverity({
      "Тип": "Сумма отличается",
      "Вероятная причина": "Документ найден по дате и номеру, но суммы разные. Возможны корректировка, частичное отражение, НДС или ошибка ввода.",
      "Что сделать": "Открыть оба документа в учёте и сверить сумму с первичкой / УПД.",
      "Дата Акт 1": r["Дата Акт 1"],
      "Документ Акт 1": r["Документ Акт 1"],
      "Дата Акт 2": r["Дата Акт 2"],
      "Документ Акт 2": r["Документ Акт 2"],
      "Разница": r["Разница"]
    }, "warning"));
  }
  for (const r of (comp.diffNumberSum || [])) {
    rows.push(withSeverity({
      "Тип": "Дата отличается",
      "Вероятная причина": "Одна операция: номер и сумма совпали, даты отражения разные (дата проводки vs дата документа).",
      "Что сделать": "Проверить дату в первичке и дату проведения в обоих учётах.",
      "Дата Акт 1": r["Дата Акт 1"],
      "Документ Акт 1": r["Документ Акт 1"],
      "Дата Акт 2": r["Дата Акт 2"],
      "Документ Акт 2": r["Документ Акт 2"],
      "Разница": r["Разница"]
    }, "info"));
  }`,
    "acts sum/date");

  src = mustReplace(src,
    `    rows.push({
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
}`,
    `    rows.push(withSeverity({
      "Тип": tip,
      "Вероятная причина": cause,
      "Что сделать": todo,
      "Дата Акт 1": fmtDate(op1.date),
      "Документ Акт 1": op1.doc,
      "Дата Акт 2": pairDate,
      "Документ Акт 2": pairDoc,
      "Разница": op1.amount
    }, "warning"));
  }

  for (const op2 of (comp.notFound2 || [])) {
    if (used2.has(op2)) continue;
    rows.push(withSeverity({
      "Тип": "Лишнее у контрагента / нет у нас",
      "Вероятная причина": "В вашем акте нет пары. Документ мог не попасть в учёт, быть на другом договоре или под другим номером.",
      "Что сделать": "Найти документ в 1С / запросить скан у контрагента.",
      "Дата Акт 1": "",
      "Документ Акт 1": "",
      "Дата Акт 2": fmtDate(op2.date),
      "Документ Акт 2": op2.doc,
      "Разница": op2.amount
    }, "warning"));
  }
  return rows;
}`,
    "acts notfound");

  // Move withSeverity before buildActReasons if needed — withSeverity is defined later near issueRow.
  // Acts call withSeverity at runtime after all functions are hoisted? Function declarations are hoisted in JS for `function foo()` 
  // withSeverity is a function declaration so it's hoisted. Good.

  // --- NDS: tag rows in compareNds return path via helper after building ---
  src = mustReplace(src,
    `  return { ok, sumDiff, ndsDiff, rateDiff, innDiff, kppDiff, corrDiff, typeDiff, missB, missA, dupsA, dupsB, multiRateWarn };
}`,
    `  const sevW = (arr) => (arr || []).map(r => withSeverity(Object.assign({}, r), "warning"));
  return {
    ok,
    sumDiff: sevW(sumDiff),
    ndsDiff: sevW(ndsDiff),
    rateDiff: sevW(rateDiff),
    innDiff: sevW(innDiff),
    kppDiff: sevW(kppDiff),
    corrDiff: sevW(corrDiff),
    typeDiff: sevW(typeDiff),
    missB: sevW(missB.map(r => ({
      "№": r.number, "Дата": fmtDate(r.date), "Сумма": r.amount, "НДС": r.nds,
      "Ставка": r.rate, "ИНН": r.inn || "—", "КПП": r.kpp || "—",
      "Корр.": r.isCorr ? "да" : "нет", "Контрагент": r.partner,
      "Причина": r.reason || "нет в паре"
    }))),
    missA: sevW(missA.map(r => ({
      "№": r.number, "Дата": fmtDate(r.date), "Сумма": r.amount, "НДС": r.nds,
      "Ставка": r.rate, "ИНН": r.inn || "—", "КПП": r.kpp || "—",
      "Корр.": r.isCorr ? "да" : "нет", "Контрагент": r.partner,
      "Причина": r.reason || "нет в паре"
    }))),
    dupsA: sevW(dupsA),
    dupsB: sevW(dupsB),
    multiRateWarn: sevW(multiRateWarn)
  };
}`,
    "nds return");

  // Simplify NDS handler mapMiss — miss already mapped
  src = mustReplace(src,
    `    const mapMiss = (arr) => arr.map(r => ({
      "№": r.number, "Дата": fmtDate(r.date), "Сумма": r.amount, "НДС": r.nds,
      "Ставка": r.rate, "ИНН": r.inn || "—", "КПП": r.kpp || "—",
      "Корр.": r.isCorr ? "да" : "нет", "Контрагент": r.partner,
      "Причина": r.reason || "нет в паре"
    }));
    const problemCount = comp.missA.length + comp.missB.length + comp.sumDiff.length + comp.ndsDiff.length
      + comp.rateDiff.length + comp.innDiff.length + comp.kppDiff.length + comp.corrDiff.length + comp.typeDiff.length;
    const dupCount = comp.dupsA.length + comp.dupsB.length;
    document.getElementById("reportNds").classList.remove("hidden");
    const kpiNds = renderKpi([
      [a.rows.length, "СФ в A"],
      [b.rows.length, "СФ в B"],
      [comp.ok.length, "OK"],
      [problemCount, "Расхождения"],
      [dupCount, "Дубли"],
      [comp.multiRateWarn.length, "Неск. ставок"]
    ]);
    const fullNds = kpiNds +
      '<div class="reason-box">Сопоставление: номер → номер+дата / ИНН. В колонке «Причина» — почему строка проблемная.</div>' +
      '<h3 class="section">Нет в B</h3>' + renderTable(mapMiss(comp.missB), [], "Нет") +
      '<h3 class="section">Нет в A</h3>' + renderTable(mapMiss(comp.missA), [], "Нет") +`,
    `    const problemCount = comp.missA.length + comp.missB.length + comp.sumDiff.length + comp.ndsDiff.length
      + comp.rateDiff.length + comp.innDiff.length + comp.kppDiff.length + comp.corrDiff.length + comp.typeDiff.length;
    const dupCount = comp.dupsA.length + comp.dupsB.length;
    document.getElementById("reportNds").classList.remove("hidden");
    const kpiNds = renderKpi([
      [a.rows.length, "СФ в A"],
      [b.rows.length, "СФ в B"],
      [comp.ok.length, "OK"],
      [problemCount, "Расхождения"],
      [dupCount, "Дубли"],
      [comp.multiRateWarn.length, "Неск. ставок"]
    ]);
    const ndsLegend = '<div class="legend" style="margin:0 0 12px">'
      + '<span><i class="sev sev-warning" style="margin-right:4px">внимание</i>расхождения и дубли</span></div>';
    const fullNds = kpiNds + ndsLegend +
      '<div class="reason-box">Сопоставление: номер → номер+дата / ИНН. Колонка «Важность» — уровень замечания.</div>' +
      '<h3 class="section">Нет в B</h3>' + renderTable(comp.missB, [], "Нет") +
      '<h3 class="section">Нет в A</h3>' + renderTable(comp.missA, [], "Нет") +`,
    "nds handler");

  // Excel mapMiss for NDS — still uses raw fields; missA/missB now have № Дата etc already
  src = mustReplace(src,
    `  const mapMiss = (arr) => arr.map(r => ({
    "№": r.number, "Дата": fmtDate(r.date), "Сумма": r.amount, "НДС": r.nds,
    "ИНН": r.inn || "", "КПП": r.kpp || "", "Причина": r.reason || ""
  }));
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, buildMultiSectionSheet([
    { title: "Нет в B", rows: mapMiss(c.missB), emptyText: "Нет" },
    { title: "Нет в A", rows: mapMiss(c.missA), emptyText: "Нет" },`,
    `  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, buildMultiSectionSheet([
    { title: "Нет в B", rows: c.missB, emptyText: "Нет" },
    { title: "Нет в A", rows: c.missA, emptyText: "Нет" },`,
    "nds excel");

  // --- Acquiring severity ---
  src = mustReplace(src,
    `    if (hit.how === "сумма") weak.push(row);
    else matched.push(row);
  }

  for (const tr of retRows) {
    returns.push({
      "Дата": fmtDate(tr.date),
      "Операция": tr.opId || "—",
      "Сумма возврата": tr.amount,
      "Комиссия": tr.fee,
      "Строка": tr.sourceRow
    });
  }

  const missBank = sales.filter(r => !r.matched).map(r => ({
    "Дата": fmtDate(r.date),
    "Операция": r.opId || "—",
    "Сумма": r.amount,
    "Комиссия": r.fee,
    "Ожидаемое зачисление": r.net,
    "Причина": "не найдено зачисление",
    "Строка": r.sourceRow
  }));
  const extraBank = bankRows.filter(r => !r.matched).map(r => ({
    "Дата": fmtDate(r.date),
    "Сумма": r.amount,
    "Назначение": r.desc || "—",
    "Причина": "лишнее / не сопоставлено",
    "Строка": r.sourceRow
  }));

  return { matched, weak, returns, missBank, extraBank };
}`,
    `    if (hit.how === "сумма") weak.push(withSeverity(row, "warning"));
    else matched.push(row);
  }

  for (const tr of retRows) {
    returns.push(withSeverity({
      "Дата": fmtDate(tr.date),
      "Операция": tr.opId || "—",
      "Сумма возврата": tr.amount,
      "Комиссия": tr.fee,
      "Строка": tr.sourceRow
    }, "info"));
  }

  const missBank = sales.filter(r => !r.matched).map(r => withSeverity({
    "Дата": fmtDate(r.date),
    "Операция": r.opId || "—",
    "Сумма": r.amount,
    "Комиссия": r.fee,
    "Ожидаемое зачисление": r.net,
    "Причина": "не найдено зачисление",
    "Строка": r.sourceRow
  }, "warning"));
  const extraBank = bankRows.filter(r => !r.matched).map(r => withSeverity({
    "Дата": fmtDate(r.date),
    "Сумма": r.amount,
    "Назначение": r.desc || "—",
    "Причина": "лишнее / не сопоставлено",
    "Строка": r.sourceRow
  }, "warning"));

  return { matched, weak, returns, missBank, extraBank };
}`,
    "acq match");

  // findAcqDuplicates — add severity to out rows
  src = mustReplace(src,
    `        "Тип": r.type || "—",
        "Причина": "задвоение",
        "Строка": r.sourceRow
      });`,
    `        "Тип": r.type || "—",
        "Причина": "задвоение",
        "Строка": r.sourceRow
      });
      withSeverity(out[out.length - 1], "warning");`,
    "acq dups");

  // Acq report legend
  src = mustReplace(src,
    `    const fullAcq = kpiAcq + hintFee +
      (Math.abs(diff) < 0.02
        ? '<div class="reason-box">Агрегаты сходятся: продажи − комиссия ≈ перечисление банка.</div>'
        : '<div class="reason-box">Есть расхождение агрегатов. Ниже — построчное сопоставление: дата+сумма, дата±1, только сумма.</div>') +`,
    `    const acqLegend = '<div class="legend" style="margin:0 0 12px">'
      + '<span><i class="sev sev-warning" style="margin-right:4px">внимание</i>нет пары / только сумма / дубли</span>'
      + '<span><i class="sev sev-info" style="margin-right:4px">справочно</i>возвраты</span></div>';
    const fullAcq = kpiAcq + hintFee + acqLegend +
      (Math.abs(diff) < 0.02
        ? '<div class="reason-box">Агрегаты сходятся: продажи − комиссия ≈ перечисление банка.</div>'
        : '<div class="reason-box">Есть расхождение агрегатов. Ниже — построчное сопоставление: дата+сумма, дата±1, только сумма.</div>') +`,
    "acq legend");

  // Acts report — add legend near reasons if COLOR_LEGEND exists; soft add in reasonIntro
  if (src.includes("Явных расхождений для пояснения нет") && !src.includes("sev sev-warning") || true) {
    // inject into reasonIntro construction
  }
  src = mustReplace(src,
    `  const reasonIntro = (comp.reasons && comp.reasons.length)
    ? \`<div class="reason-box">Найдено пояснений: <b>\${comp.reasons.length}</b>. Это подсказки для разбора, не замена первички.</div>\`
    : \`<div class="reason-box">Явных расхождений для пояснения нет — все операции нашли пару выбранными методами.</div>\`;`,
    `  const reasonIntro = ((comp.reasons && comp.reasons.length)
    ? \`<div class="reason-box">Найдено пояснений: <b>\${comp.reasons.length}</b>. Это подсказки для разбора, не замена первички.</div>\`
    : \`<div class="reason-box">Явных расхождений для пояснения нет — все операции нашли пару выбранными методами.</div>\`)
    + '<div class="legend" style="margin:0 0 12px">'
    + '<span><i class="sev sev-warning" style="margin-right:4px">внимание</i>суммы / нет пары</span>'
    + '<span><i class="sev sev-info" style="margin-right:4px">справочно</i>даты разные</span></div>';`,
    "acts legend");

  // --- FAQ HTML inserts ---
  if (!src.includes("Кратко: как читать результат")) {
    src = mustReplace(src,
      `        <div id="msg" class="msg"></div>
      </section>
      <section id="report" class="card hidden">`,
      FAQ_ACTS + `
        <div id="msg" class="msg"></div>
      </section>
      <section id="report" class="card hidden">`,
      "faq acts");
  }

  if (!src.includes("Кратко: реестры УТ")) {
    src = mustReplace(src,
      `        <div id="msgReg" class="msg"></div>
      </section>
      <section id="reportReg" class="card hidden">`,
      FAQ_REGS + `
        <div id="msgReg" class="msg"></div>
      </section>
      <section id="reportReg" class="card hidden">`,
      "faq regs");
  }

  if (!src.includes("Кратко: авансы и 76")) {
    src = mustReplace(src,
      `        <div id="msgOsv" class="msg"></div>
      </section>
      <section id="reportOsv" class="card hidden">`,
      FAQ_6062 + `
        <div id="msgOsv" class="msg"></div>
      </section>
      <section id="reportOsv" class="card hidden">`,
      "faq 6062");
  }

  if (!src.includes("Кратко: сверка НДС")) {
    src = mustReplace(src,
      `        <div id="msgNds" class="msg"></div>
      </section>
      <section id="reportNds" class="card hidden">`,
      FAQ_NDS + `
        <div id="msgNds" class="msg"></div>
      </section>
      <section id="reportNds" class="card hidden">`,
      "faq nds");
  }

  if (!src.includes("Кратко: эквайринг")) {
    src = mustReplace(src,
      `        <div id="msgAcq" class="msg"></div>
      </section>
      <section id="reportAcq" class="card hidden">`,
      FAQ_ACQ + `
        <div id="msgAcq" class="msg"></div>
      </section>
      <section id="reportAcq" class="card hidden">`,
      "faq acq");
  }

  fs.writeFileSync(p, src.replace(/\n/g, "\r\n"), "utf8");
  console.log("OK", file, isPro ? "PRO" : "test");
}

console.log("done");
