/**
 * Патч «Доктор 60/62»: корректный разбор ОСВ (конечное сальдо, двухуровневая шапка)
 * и сверка авансов с НДС по авансам: 60 Дт ↔ 76.ВА, 62 Кт ↔ 76.АВ.
 */
const fs = require("fs");
const path = require("path");

const dir = "C:/Users/cobra/Desktop/Папки РС/Сверка актов 1 С/";
const FILES = ["SverkaFact _v2.html", "SverkaFact _v2.1.html"];

function mustReplace(src, from, to, label) {
  const n = src.split(from).length - 1;
  if (n !== 1) throw new Error("Якорь не уникален (" + n + "): " + label);
  return src.replace(from, to);
}

function replaceBlock(src, startMarker, endMarker, newBlock, label) {
  const a = src.indexOf(startMarker);
  const b = src.indexOf(endMarker);
  if (a < 0 || b < 0 || b <= a) throw new Error("Блок не найден: " + label);
  return src.slice(0, a) + newBlock + src.slice(b);
}

/* ---------------- новый блок парсера ОСВ ---------------- */

const PARSER_BLOCK = `function detectAccount76Kind(account) {
  const t = normalizeText(account).toUpperCase().replace(/Ё/g, "Е").replace(/\\s+/g, "");
  if (/76[.\\-]?АВ|76[.\\-]?AB/.test(t)) return "76.АВ";
  if (/76[.\\-]?ВА|76[.\\-]?BA/.test(t)) return "76.ВА";
  return "";
}

/** Номер счёта из заголовка ОСВ: «Оборотно-сальдовая ведомость по счету 60 за 3 квартал». */
function detectOsvMainAccount(matrix) {
  for (let r = 0; r < Math.min(matrix.length, 15); r++) {
    const line = (matrix[r] || []).map(v => normalizeText(v)).join(" ");
    const m = line.match(/по\\s+сч[её]ту\\s+(\\d{2}(?:\\.[0-9A-Za-zА-Яа-я]{1,3})?)/i);
    if (m) return m[1].toUpperCase().replace(/Ё/g, "Е");
  }
  for (let r = 0; r < Math.min(matrix.length, 30); r++) {
    const first = normalizeText((matrix[r] || [])[0]).replace(/\\s/g, "");
    if (/^\\d{2}(\\.[0-9A-Za-zА-Яа-я]{1,3})?$/.test(first)) return first.toUpperCase().replace(/Ё/g, "Е");
  }
  return "";
}

/** Строка ОСВ — детализация документа-регистратора, а не контрагент. */
function isOsvDocumentRow(name) {
  const t = normalizeText(name).toLowerCase().replace(/ё/g, "е");
  if (!t) return false;
  if (/\\sот\\s\\d{1,2}\\.\\d{1,2}\\.\\d{2,4}/.test(t)) return true;
  return /^(списание|поступление|платежное|платежный|платеж|оплата|счет-фактура|счет фактура|аванс|реализация|возврат|корректировка|операция|банковская выписка|расходный|приходный|инкассовое|зачет|взаимозачет|перечисление)/.test(t);
}

/** Служебная строка ОСВ: итог, шапка субконто, строка самого счёта. */
function isOsvServiceRow(name) {
  const t = normalizeText(name).toLowerCase().replace(/ё/g, "е");
  if (!t) return true;
  if (/^(итого|всего|оборот|сальдо)/.test(t)) return true;
  if (/^сч(ет|ета|ёт|ёта)[- ]?фактур/.test(t)) return true;
  if (/^\\d{2}(\\.[0-9а-яa-z]{1,3})?$/i.test(t.replace(/\\s/g, ""))) return true;
  if (/^(контрагент|субконто|аналитика|наименование|организац)/.test(t)) return true;
  if (/^(выводимые данные|отбор|параметр)/.test(t)) return true;
  return false;
}

/** Шапка ОСВ: строка с парами Дебет/Кредит (колонки «Дата» в ОСВ обычно нет). */
function findOsvHeaderRow(matrix) {
  const rows = Math.min(matrix.length, 40);
  let best = null, bestScore = -1;
  for (let r = 0; r < rows; r++) {
    const row = matrix[r] || [];
    let deb = 0, cred = 0, label = 0;
    for (let c = 0; c < row.length; c++) {
      const t = normalizeText(row[c]).toLowerCase().replace(/ё/g, "е");
      if (!t || t.length > 40) continue;
      if (/^дебет$|^дт$/.test(t)) deb++;
      else if (/^кредит$|^кт$/.test(t)) cred++;
      else if (/^(счет|контрагент|субконто|аналитика|наименование)/.test(t)) label++;
    }
    const score = deb * 3 + cred * 3 + label;
    if (deb >= 1 && cred >= 1 && score > bestScore) { bestScore = score; best = r; }
  }
  return best;
}

/** Групповая шапка («Сальдо на начало / Обороты / Сальдо на конец») с протяжкой объединённых ячеек. */
function osvGroupHeaders(matrix, headerRow) {
  const width = matrixWidth(matrix);
  const groups = new Array(width).fill("");
  for (let r = Math.max(0, headerRow - 3); r < headerRow; r++) {
    const row = matrix[r] || [];
    const filled = new Array(width).fill("");
    let cur = "";
    for (let c = 0; c < width; c++) {
      const t = normalizeText(row[c]).toLowerCase().replace(/ё/g, "е");
      if (t) cur = t;
      filled[c] = cur;
    }
    if (/сальдо|оборот/.test(filled.join(" "))) {
      for (let c = 0; c < width; c++) if (filled[c]) groups[c] = filled[c];
    }
  }
  return groups;
}

/** Колонки ОСВ: конечное сальдо Дт/Кт и обороты за период (не сальдо на начало). */
function resolveOsvAmountCols(matrix, headerRow) {
  const width = matrixWidth(matrix);
  const groups = osvGroupHeaders(matrix, headerRow);
  const own = [];
  for (let c = 0; c < width; c++) {
    own.push(normalizeText((matrix[headerRow] || [])[c]).toLowerCase().replace(/ё/g, "е"));
  }
  const full = (c) => (groups[c] + " " + own[c]).trim();
  const isDeb = (t) => /дебет|(^|\\s)дт(\\s|$)/.test(t);
  const isCred = (t) => /кредит|(^|\\s)кт(\\s|$)/.test(t);
  const find = (groupRe, side) => {
    let found = -1;
    for (let c = 0; c < width; c++) {
      const t = full(c);
      if (!t) continue;
      if (groupRe && !groupRe.test(t)) continue;
      const probe = own[c] || t;
      if (side === "deb" ? isDeb(probe) : isCred(probe)) found = c;
    }
    return found;
  };
  const endRe = /сальдо[^а-я]*на\\s*кон|сальдо\\s*кон|кон[а-я]*\\s*сальдо|(^|\\s)ск(\\s|$)/;
  let debEnd = find(endRe, "deb");
  let credEnd = find(endRe, "cred");
  const debTurn = find(/оборот/, "deb");
  const credTurn = find(/оборот/, "cred");
  if (debEnd < 0 || credEnd < 0) {
    const debs = [], creds = [];
    for (let c = 0; c < width; c++) {
      const t = full(c);
      if (!t) continue;
      if (isDeb(t)) debs.push(c);
      if (isCred(t)) creds.push(c);
    }
    if (debEnd < 0) debEnd = debs.length ? debs[debs.length - 1] : -1;
    if (credEnd < 0) credEnd = creds.length ? creds[creds.length - 1] : -1;
  }
  return { debEnd, credEnd, debTurn, credTurn, groups, own };
}

function parseOsv6062(matrix, fileName) {
  const headerRow = findOsvHeaderRow(matrix);
  if (headerRow == null) {
    throw new Error("Не найдена шапка ОСВ (нужны колонки Дебет/Кредит). Выгрузите оборотно-сальдовую ведомость по счёту с сальдо и оборотами.");
  }
  const cols = resolveOsvAmountCols(matrix, headerRow);
  if (cols.debEnd < 0 && cols.credEnd < 0) {
    throw new Error("Не найдены колонки конечного сальдо Дт/Кт. Выгрузите ОСВ с сальдо на конец периода.");
  }
  const amountCols = new Set([cols.debEnd, cols.credEnd, cols.debTurn, cols.credTurn].filter(c => c >= 0));
  const width = matrixWidth(matrix);
  const findByHeader = (variants) => {
    for (let c = 0; c < width; c++) {
      if (amountCols.has(c)) continue;
      const t = (cols.groups[c] + " " + cols.own[c]).toLowerCase();
      if (variants.some(v => t.includes(v))) return c;
    }
    return -1;
  };
  let nameCol = findByHeader(["контрагент", "субконто", "аналитика", "наименование", "организац", "счет", "счёт"]);
  if (nameCol < 0) {
    for (let c = 0; c < width; c++) { if (!amountCols.has(c)) { nameCol = c; break; } }
  }
  const contractCol = findByHeader(["договор", "соглашение"]);
  const innCol = findByHeader(["инн"]);
  const dateCol = findByHeader(["дата", "срок"]);
  let accountCol = findByHeader(["счет учета", "счёт учета", "субсчет", "субсчёт"]);
  if (accountCol === nameCol) accountCol = -1;

  const mainAccount = detectOsvMainAccount(matrix);
  const items = [];
  let skippedDocs = 0;
  for (let r = headerRow + 1; r < matrix.length; r++) {
    const row = matrix[r] || [];
    const name = nameCol >= 0 ? normalizeText(row[nameCol]) : "";
    if (isOsvServiceRow(name)) continue;
    if (isOsvDocumentRow(name)) { skippedDocs++; continue; }
    const debit = cols.debEnd >= 0 ? parseAmount(row[cols.debEnd]) : null;
    const credit = cols.credEnd >= 0 ? parseAmount(row[cols.credEnd]) : null;
    const debitTurn = cols.debTurn >= 0 ? parseAmount(row[cols.debTurn]) : null;
    const creditTurn = cols.credTurn >= 0 ? parseAmount(row[cols.credTurn]) : null;
    if (![debit, credit, debitTurn, creditTurn].some(v => v != null && Math.abs(v) > 0.009)) continue;
    const account = accountCol >= 0 ? normalizeText(row[accountCol]) : "";
    items.push({
      name: name || "(без аналитики)",
      account: account || mainAccount,
      contract: contractCol >= 0 ? normalizeText(row[contractCol]) : "",
      inn: innCol >= 0 ? normalizeInn(row[innCol]) : "",
      date: dateCol >= 0 ? parseDate(row[dateCol]) : null,
      debit: debit || 0,
      credit: credit || 0,
      debitTurn: debitTurn || 0,
      creditTurn: creditTurn || 0,
      sourceRow: r + 1
    });
  }
  return {
    name: fileName,
    items,
    mainAccount,
    vatKind: detectAccount76Kind(mainAccount),
    skippedDocs,
    hasDates: items.some(it => it.date),
    hasAccounts: items.some(it => it.account)
  };
}

/** Индекс контрагентов по ОСВ 76.АВ / 76.ВА. */
function buildVatAdvanceIndex(vatData) {
  const byName = new Map();
  const byInn = new Map();
  for (const it of vatData.items) {
    const rec = {
      name: it.name,
      debit: it.debit || 0,
      credit: it.credit || 0,
      debitTurn: it.debitTurn || 0,
      creditTurn: it.creditTurn || 0,
      sourceRow: it.sourceRow
    };
    const k = normalizePartnerKey(it.name);
    if (k) {
      const prev = byName.get(k);
      if (prev) {
        prev.debit += rec.debit;
        prev.credit += rec.credit;
        prev.debitTurn += rec.debitTurn;
        prev.creditTurn += rec.creditTurn;
      } else {
        byName.set(k, rec);
      }
    }
    if (it.inn && !byInn.has(it.inn)) byInn.set(it.inn, rec);
  }
  return { kind: vatData.vatKind || "76.ВА", byName, byInn, name: vatData.name, count: vatData.items.length };
}

function hasVatActivity(rec) {
  if (!rec) return false;
  return [rec.debit, rec.credit, rec.debitTurn, rec.creditTurn].some(v => Math.abs(v || 0) > 0.009);
}

/**
 * Сверка авансов с НДС по авансам:
 *   счёт 60 (Дт — аванс выданный поставщику) ↔ 76.ВА (авансовые СФ полученные / книга покупок)
 *   счёт 62 (Кт — аванс полученный от покупателя) ↔ 76.АВ (авансовые СФ выданные / книга продаж)
 */
function checkAdvanceVat(mainData, vatIndex, opts) {
  const r2 = (n) => Math.round((n || 0) * 100) / 100;
  const minAdvance = Math.max(0, Number(opts && opts.minAdvance) || 0);
  const acc = String(mainData.mainAccount || "").replace(/\\s/g, "");
  const isReceived = /^62/.test(acc) || vatIndex.kind === "76.АВ";
  const kind = isReceived ? "76.АВ" : "76.ВА";
  const advLabel = isReceived ? "Аванс полученный (Кт 62)" : "Аванс выданный (Дт 60)";
  const payLabel = isReceived ? "Поступило в периоде (Кт 62 оборот)" : "Оплачено в периоде (Дт 60 оборот)";
  const missing = [];
  const notRestored = [];
  const mainAdv = new Map();
  let smallSkipped = 0, smallSkippedSum = 0;

  for (const it of mainData.items) {
    const adv = isReceived ? it.credit : it.debit;
    if (!(adv > 0.009)) continue;
    const key = normalizePartnerKey(it.name);
    if (key && !mainAdv.has(key)) mainAdv.set(key, it);
    const rec = (it.inn && vatIndex.byInn.get(it.inn)) || (key ? vatIndex.byName.get(key) : null);
    if (hasVatActivity(rec)) continue;
    if (adv < minAdvance) { smallSkipped++; smallSkippedSum += adv; continue; }
    const payTurn = isReceived ? (it.creditTurn || 0) : (it.debitTurn || 0);
    const row = {
      "Контрагент": it.name,
      "Счёт": it.account || acc || "—",
      "Договор": it.contract || "—"
    };
    row[advLabel] = r2(adv);
    row[payLabel] = r2(payTurn);
    row["Период аванса"] = payTurn > 0.009 ? "предоплата текущего периода" : "переходит с прошлых периодов";
    row["НДС 20/120 расчётно"] = r2(adv * 20 / 120);
    row[kind] = rec ? "строка есть, движений нет" : "нет в ОСВ " + kind;
    row["Проблема"] = isReceived
      ? "Аванс получен, СФ на аванс не выставлена (" + kind + " пусто)"
      : "Аванс выдан, авансовая СФ не получена (" + kind + " пусто) — справочно";
    row["Вероятная причина"] = isReceived
      ? "НДС с полученной предоплаты не начислен."
      : "Поставщик не выставил (или в базу не занесён) авансовый счёт-фактура — НДС с предоплаты к вычету не заявлен.";
    row["Что сделать"] = isReceived
      ? "Выставить СФ на аванс (5 календарных дней) и начислить НДС на 76.АВ."
      : "Запросить у поставщика СФ на аванс. Вычет — право, а не обязанность: если вычет не заявляете, замечание справочное.";
    row["Строка"] = it.sourceRow;
    missing.push(row);
  }

  for (const [key, rec] of vatIndex.byName) {
    const bal = isReceived ? rec.debit : rec.credit;
    if (!(Math.abs(bal) > 0.009)) continue;
    if (mainAdv.has(key)) continue;
    const row = { "Контрагент": rec.name };
    row[kind + " сальдо"] = r2(bal);
    row[advLabel] = 0;
    row["Проблема"] = kind + " висит, аванса по счёту " + (isReceived ? "62" : "60") + " нет";
    row["Вероятная причина"] = isReceived
      ? "Аванс зачтён реализацией, а НДС с аванса не принят к вычету."
      : "Аванс закрыт поставкой, а НДС с аванса не восстановлен.";
    row["Что сделать"] = isReceived
      ? "Проверить вычет НДС с аванса в периоде реализации (Дт 68.02 / Кт 76.АВ)."
      : "Проверить восстановление НДС с аванса в периоде поставки (Дт 76.ВА / Кт 68.02).";
    row["Строка"] = rec.sourceRow;
    notRestored.push(row);
  }

  missing.sort((a, b) => (b[advLabel] || 0) - (a[advLabel] || 0));
  notRestored.sort((a, b) => (b[kind + " сальдо"] || 0) - (a[kind + " сальдо"] || 0));
  return {
    missing,
    notRestored,
    kind,
    isReceived,
    advLabel,
    minAdvance,
    smallSkipped,
    smallSkippedSum: r2(smallSkippedSum),
    advTotal: r2(missing.reduce((s, x) => s + (x[advLabel] || 0), 0)),
    vatTotal: r2(missing.reduce((s, x) => s + (x["НДС 20/120 расчётно"] || 0), 0))
  };
}

`;

/* ---------------- патч ---------------- */

for (const file of FILES) {
  const p = dir + file;
  let src = fs.readFileSync(p, "utf8").replace(/\r\n/g, "\n");
  const isPro = file.includes("_v2.html");

  fs.writeFileSync(p + ".bak-osvadv", src.replace(/\n/g, "\r\n"), "utf8");

  // 1. парсер ОСВ + сверка авансов
  src = replaceBlock(
    src,
    "function detectAccount76Kind(account) {",
    "function issueRow(it, problem, cause, action, extra) {",
    PARSER_BLOCK,
    "parser block"
  );

  // 2. diagnose6062: собрать входные данные
  src = mustReplace(src,
    `  const sfPartners = opts && opts.sfPartners ? opts.sfPartners : null;`,
    `  const sfPartners = opts && opts.sfPartners ? opts.sfPartners : null;
  const vatIndex = opts && opts.vatIndex ? opts.vatIndex : null;
  const mainAcc = String(data.mainAccount || "").replace(/\\s/g, "");
  const mainIs62 = /^62/.test(mainAcc);`,
    "diagnose opts");

  src = mustReplace(src,
    `  const advanceNoSf = [];`,
    `  const advanceNoSf = [];
  const vatNotRestored = [];`,
    "advanceNoSf decl");

  // 3. эвристика по реестру СФ / книге покупок — опирается на счёт из ОСВ
  src = mustReplace(src,
    `    if (sfPartners) {
      const creditAdv = c > 0.009 && d < 0.009;
      const debitAdv = d > 0.009 && c < 0.009 && /60\\.02|аванс/i.test((it.account || "") + " " + it.name);
      if (creditAdv || debitAdv) {
        const keyName = normalizePartnerKey(it.name);
        const hasSf = (it.inn && sfPartners.inns.has(it.inn)) || (keyName && sfPartners.names.has(keyName));
        if (!hasSf) {
          const row = issueRow(it, "Аванс без СФ",
            "По ОСВ виден аванс, в загруженном реестре СФ контрагент не найден.",
            "Проверить выставление/получение счёта-фактуры на аванс (в т.ч. 76.АВ/76.ВА).");
          advanceNoSf.push(row);
          issues.push(row);
        }
      }
    }`,
    `    if (sfPartners && !vatIndex) {
      const adv = mainIs62 ? c : d;
      if (adv > 0.009) {
        const keyName = normalizePartnerKey(it.name);
        const hasSf = (it.inn && sfPartners.inns.has(it.inn)) || (keyName && sfPartners.names.has(keyName));
        if (!hasSf) {
          const row = issueRow(it,
            mainIs62
              ? "Аванс получен, контрагента нет в реестре выданных СФ"
              : "Аванс выдан, контрагента нет в реестре полученных СФ (книге покупок)",
            mainIs62
              ? "По ОСВ виден аванс от покупателя, в загруженном реестре/книге продаж контрагент не найден."
              : "По ОСВ виден аванс поставщику, в загруженном реестре полученных СФ / книге покупок контрагент не найден.",
            mainIs62
              ? "Проверить выставление СФ на аванс и начисление НДС (76.АВ)."
              : "Точнее проверить можно, загрузив ОСВ по счёту 76.ВА — тогда сверка идёт 60 Дт ↔ 76.ВА.");
          advanceNoSf.push(row);
          if (mainIs62) issues.push(row);
        }
      }
    }`,
    "sf heuristic");

  // 4. точная сверка 60↔76.ВА / 62↔76.АВ после основного цикла
  src = mustReplace(src,
    `  // дубли контрагентов
  const byKey = new Map();`,
    `  let vatAdvance = null;
  if (vatIndex) {
    vatAdvance = checkAdvanceVat(data, vatIndex, { minAdvance: opts && opts.minAdvance });
    for (const row of vatAdvance.missing) {
      advanceNoSf.push(row);
      if (vatAdvance.isReceived) issues.push(row);
    }
    for (const row of vatAdvance.notRestored) {
      vatNotRestored.push(row);
      issues.push(row);
    }
  }

  // дубли контрагентов
  const byKey = new Map();`,
    "vat advance call");

  // 5. возвращаемый объект
  src = mustReplace(src,
    `    overdueSkipped: !data.hasDates,
    sfChecked: !!sfPartners
  };`,
    `    vatNotRestored,
    vatAdvance,
    mainAccount: data.mainAccount || "",
    overdueSkipped: !data.hasDates,
    sfChecked: !!(sfPartners || vatIndex),
    vatChecked: !!vatIndex
  };`,
    "diagnose return");

  // 6. обработчик: тип второго файла (ОСВ 76.ВА/АВ или книга покупок)
  src = mustReplace(src,
    `    let sfPartners = null;
    const sfFile = document.getElementById("osvSfFile").files[0];
    if (sfFile) {
      const sfRaw = await readFileToMatrix(sfFile);
      const sfData = parseSfRegistry(sfRaw.matrix, sfRaw.fileName);
      sfPartners = buildSfPartnerIndex(sfData);
    }
    const overdueDays = Number(document.getElementById("osvOverdueDays").value) || 30;
    const diag = diagnose6062(data, { overdueDays, sfPartners });`,
    `    let sfPartners = null;
    let vatIndex = null;
    let advSource = "";
    const sfFile = document.getElementById("osvSfFile").files[0];
    if (sfFile) {
      const sfRaw = await readFileToMatrix(sfFile);
      const guessKind = detectAccount76Kind(detectOsvMainAccount(sfRaw.matrix));
      if (guessKind) {
        const vatData = parseOsv6062(sfRaw.matrix, sfRaw.fileName);
        vatIndex = buildVatAdvanceIndex(vatData);
        advSource = "ОСВ " + vatIndex.kind + ", контрагентов: " + vatIndex.count;
      } else {
        const sfData = parseSfRegistry(sfRaw.matrix, sfRaw.fileName);
        sfPartners = buildSfPartnerIndex(sfData);
        advSource = "реестр полученных СФ / книга покупок, строк: " + ((sfData.rows || []).length);
      }
    }
    const overdueDays = Number(document.getElementById("osvOverdueDays").value) || 30;
    const minAdvEl = document.getElementById("osvMinAdvance");
    const minAdvance = minAdvEl ? (Number(minAdvEl.value) || 0) : 0;
    const diag = diagnose6062(data, { overdueDays, sfPartners, vatIndex, minAdvance });`,
    "handler second file");

  // 7. KPI + пояснения + секции отчёта
  src = mustReplace(src,
    `    let notes = '<div class="reason-box">Проверки: развёрнутое/незачтённый аванс, красное сальдо, 76.АВ/76.ВА, аналитика, дубли, просрочка'
      + (diag.sfChecked ? ", аванс без СФ" : "") + ".</div>";`,
    `    const advKind = diag.vatAdvance ? diag.vatAdvance.kind : "76.ВА";
    const advTitle = diag.vatChecked
      ? (diag.vatAdvance && diag.vatAdvance.isReceived
        ? "Аванс получен, СФ на аванс не выставлена (62 Кт ↔ 76.АВ)"
        : "Аванс выдан, авансовая СФ не получена (60 Дт ↔ 76.ВА)")
      : "Аванс без счёта-фактуры (по реестру полученных СФ)";
    let notes = '<div class="reason-box">Счёт по ОСВ: <b>' + (diag.mainAccount || "не определён")
      + '</b>. Проверки: развёрнутое/незачтённый аванс, красное сальдо, 76.АВ/76.ВА, аналитика, дубли, просрочка'
      + (diag.sfChecked ? ", авансы без СФ" : "") + ".</div>";
    if (advSource) {
      notes += '<div class="reason-box">Второй файл распознан как: ' + advSource + ".</div>";
    }
    if (diag.vatAdvance) {
      const va = diag.vatAdvance;
      notes += '<div class="reason-box">Сверка авансов: '
        + (va.isReceived ? "Кт 62 (аванс полученный) ↔ 76.АВ" : "Дт 60 (аванс выданный) ↔ 76.ВА")
        + ". Без авансовой СФ: <b>" + va.missing.length + "</b> контрагентов на <b>"
        + fmtMoney(va.advTotal) + "</b> ₽, НДС 20/120 расчётно ≈ <b>" + fmtMoney(va.vatTotal) + "</b> ₽."
        + (va.smallSkipped ? " Мелких авансов ниже порога " + fmtMoney(va.minAdvance) + " ₽ пропущено: " + va.smallSkipped + " на " + fmtMoney(va.smallSkippedSum) + " ₽." : "")
        + (va.isReceived
          ? " По полученным авансам СФ обязательна — это ошибка."
          : " Вычет НДС с выданного аванса — право, а не обязанность: список справочный.")
        + "</div>";
    }`,
    "notes");

  src = mustReplace(src,
    `      [diag.duplicates.length, "Дубли"]
    ]);`,
    `      [diag.duplicates.length, "Дубли"],
      [diag.advanceNoSf.length, "Аванс без СФ"]
    ]);`,
    "kpi");

  src = mustReplace(src,
    `    if (!diag.sfChecked) {
      notes += '<div class="reason-box">Реестр СФ не загружен — проверка «аванс без СФ» не выполнялась.</div>';
    }`,
    `    if (!diag.sfChecked) {
      notes += '<div class="reason-box">Второй файл не загружен — сверка авансов с НДС по авансам не выполнялась. Для счёта 60 загрузите ОСВ по 76.ВА (или книгу покупок / реестр полученных СФ), для счёта 62 — ОСВ по 76.АВ.</div>';
    }`,
    "no sf note");

  src = mustReplace(src,
    `      (diag.sfChecked ? '<h3 class="section">Аванс без СФ</h3>' + renderTable(diag.advanceNoSf, [], "Нет") : "") +`,
    `      (diag.sfChecked ? '<h3 class="section">' + advTitle + '</h3>' + renderTable(diag.advanceNoSf, [], "Нет") : "") +
      (diag.vatChecked ? '<h3 class="section">' + advKind + ' без аванса (НДС с аванса не закрыт)</h3>' + renderTable(diag.vatNotRestored, [], "Нет") : "") +`,
    "sections");

  // 8. Excel
  src = mustReplace(src,
    `  if (d.sfChecked) add("Аванс без СФ", "Аванс без СФ", d.advanceNoSf);`,
    `  if (d.sfChecked) {
    const t = d.vatChecked
      ? (d.vatAdvance && d.vatAdvance.isReceived
        ? "Аванс получен, СФ на аванс не выставлена (62 Кт ↔ 76.АВ)"
        : "Аванс выдан, авансовая СФ не получена (60 Дт ↔ 76.ВА)")
      : "Аванс без счёта-фактуры (по реестру полученных СФ)";
    add("Аванс без СФ", t, d.advanceNoSf);
  }
  if (d.vatChecked) {
    const k = d.vatAdvance ? d.vatAdvance.kind : "76.ВА";
    add(k.replace(".", ""), k + " без аванса (НДС с аванса не закрыт)", d.vatNotRestored);
  }`,
    "excel");

  // 9. UI: второй файл и порог суммы
  src = mustReplace(src,
    `            <label for="osvSfFile">Реестр СФ / книга (необязательно)</label>
            <input id="osvSfFile" type="file" accept=".xlsx,.xls,.csv">
            <div class="hint">Для проверки «аванс без счёта-фактуры».</div>`,
    `            <label for="osvSfFile">ОСВ 76.ВА / 76.АВ или книга покупок (необязательно)</label>
            <input id="osvSfFile" type="file" accept=".xlsx,.xls,.csv">
            <div class="hint">Для сверки авансовых счетов-фактур: к ОСВ по счёту <b>60</b> — ОСВ по <b>76.ВА</b> (авансовые СФ полученные, книга покупок); к ОСВ по счёту <b>62</b> — ОСВ по <b>76.АВ</b> (авансовые СФ выданные, книга продаж). Тип файла определяется автоматически.</div>`,
    "ui second file");

  src = mustReplace(src,
    `            <input id="osvOverdueDays" type="number" min="1" max="3650" value="30" style="width:80px;padding:8px 10px;border:1px solid var(--line);border-radius:10px;font:inherit">
          </label>`,
    `            <input id="osvOverdueDays" type="number" min="1" max="3650" value="30" style="width:80px;padding:8px 10px;border:1px solid var(--line);border-radius:10px;font:inherit">
          </label>
          <label style="display:flex;align-items:center;gap:8px;font-weight:600">
            Аванс от, ₽
            <input id="osvMinAdvance" type="number" min="0" step="100" value="1000" style="width:100px;padding:8px 10px;border:1px solid var(--line);border-radius:10px;font:inherit">
          </label>`,
    "ui min advance");

  src = mustReplace(src,
    `      <p class="mode-sub">ОСВ: развёрнутое/красное сальдо, 76.АВ/76.ВА, просрочка, дубли, аналитика; опционально — аванс без СФ.</p>`,
    `      <p class="mode-sub">ОСВ: развёрнутое/красное сальдо, просрочка, дубли, аналитика + сверка авансов с НДС по авансам: Дт 60 ↔ 76.ВА и Кт 62 ↔ 76.АВ.</p>`,
    "mode sub");

  src = mustReplace(src,
    `<p>Развёрнутое сальдо, 76.АВ/ВА, просрочка, дубли, аванс без СФ, шаблон корректировки.</p>`,
    `<p>Развёрнутое сальдо, просрочка, дубли, авансы: Дт 60 ↔ 76.ВА и Кт 62 ↔ 76.АВ, шаблон корректировки.</p>`,
    "hub card");

  // сброс поля порога
  src = mustReplace(src,
    `  const sf = document.getElementById("osvSfFile");`,
    `  const minAdv = document.getElementById("osvMinAdvance");
  if (minAdv) minAdv.value = "1000";
  const sf = document.getElementById("osvSfFile");`,
    "reset min advance");

  fs.writeFileSync(p, src.replace(/\n/g, "\r\n"), "utf8");
  console.log("OK: " + file + (isPro ? " (PRO)" : " (test)"));
}
console.log("Готово.");
