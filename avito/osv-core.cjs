/**
 * Ядро разбора ОСВ (60/62 и 76.АВ/76.ВА) — отлаживается здесь, затем переносится в HTML.
 */

function normalizeText(v) {
  if (v == null || v === undefined) return "";
  return String(v).replace(/\u00a0|\u202f/g, " ").replace(/\s+/g, " ").trim();
}

function parseAmount(v) {
  if (v == null || v === undefined || v === "") return null;
  if (typeof v === "number" && Number.isFinite(v)) return Math.round(v * 100) / 100;
  let s = normalizeText(v);
  if (!s || s === "-") return null;
  s = s.replace(/\u00a0|\u202f| /g, "");
  let neg = false;
  if (s.startsWith("(") && s.endsWith(")")) { neg = true; s = s.slice(1, -1); }
  const dots = (s.match(/\./g) || []).length;
  const commas = (s.match(/,/g) || []).length;
  if (commas === 1 && dots === 0) s = s.replace(",", ".");
  else if (dots === 1 && commas === 0) { /* ok */ }
  else s = s.replace(/,/g, "");
  s = s.replace(/[^0-9.\-]/g, "");
  if (!s || s === "-" || s === ".") return null;
  const n = Number(s);
  if (!Number.isFinite(n)) return null;
  return Math.round((neg ? -n : n) * 100) / 100;
}

function matrixWidth(matrix) {
  let w = 0;
  for (const row of matrix) w = Math.max(w, (row || []).length);
  return w;
}

function normalizePartnerKey(name) {
  let s = normalizeText(name).toLowerCase().replace(/ё/g, "е");
  s = s.replace(/["«»„“”']/g, "");
  s = s.replace(/\b(ооо|оао|зао|пао|ао|ип|индивидуальный предприниматель|общество с ограниченной ответственностью)\b/gi, " ");
  s = s.replace(/[^a-zа-я0-9]+/gi, " ").replace(/\s+/g, " ").trim();
  return s;
}

function normalizeInn(v) {
  const digits = String(v == null ? "" : v).replace(/\D/g, "");
  if (digits.length === 10 || digits.length === 12) return digits;
  return "";
}

function detectAccount76Kind(account) {
  const t = normalizeText(account).toUpperCase().replace(/Ё/g, "Е").replace(/\s+/g, "");
  if (/76[.\-]?АВ|76[.\-]?AB/.test(t)) return "76.АВ";
  if (/76[.\-]?ВА|76[.\-]?BA/.test(t)) return "76.ВА";
  return "";
}

/** Номер счёта из заголовка отчёта: «Оборотно-сальдовая ведомость по счету 60 за 3 квартал». */
function detectOsvMainAccount(matrix) {
  for (let r = 0; r < Math.min(matrix.length, 15); r++) {
    const line = (matrix[r] || []).map(v => normalizeText(v)).join(" ");
    const m = line.match(/по\s+сч[еёе]ту\s+(\d{2}(?:\.[0-9A-Za-zА-Яа-я]{1,3})?)/i);
    if (m) return m[1].toUpperCase().replace(/Ё/g, "Е");
  }
  for (let r = 0; r < Math.min(matrix.length, 30); r++) {
    const first = normalizeText((matrix[r] || [])[0]);
    if (/^\d{2}(\.[0-9A-Za-zА-Яа-я]{1,3})?$/.test(first.replace(/\s/g, ""))) {
      return first.replace(/\s/g, "").toUpperCase().replace(/Ё/g, "Е");
    }
  }
  return "";
}

/** Строка ОСВ — детализация документа-регистратора, а не контрагент. */
function isOsvDocumentRow(name) {
  const t = normalizeText(name).toLowerCase().replace(/ё/g, "е");
  if (!t) return false;
  if (/\sот\s\d{1,2}\.\d{1,2}\.\d{2,4}/.test(t)) return true;
  return /^(списание|поступление|платежное|платежный|платеж|оплата|счет-фактура|счет фактура|аванс|реализация|возврат|корректировка|операция|банковская выписка|расходный|приходный|инкассовое|зачет|взаимозачет|перечисление)/.test(t);
}

/** Служебная строка ОСВ: итог, шапка субконто, строка самого счёта. */
function isOsvServiceRow(name) {
  const t = normalizeText(name).toLowerCase().replace(/ё/g, "е");
  if (!t) return true;
  if (/^(итого|всего|оборот|сальдо)/.test(t)) return true;
  if (/^сч(ет|ета|ёт|ёта)[- ]?фактур/.test(t)) return true;
  if (/^\d{2}(\.[0-9а-яa-z]{1,3})?$/i.test(t.replace(/\s/g, ""))) return true;
  if (/^(контрагент|субконто|аналитика|наименование|организац)/.test(t)) return true;
  if (/^(выводимые данные|отбор|параметр)/.test(t)) return true;
  return false;
}

/** Шапка ОСВ: строка, где есть пары Дебет/Кредит (колонки «Дата» в ОСВ нет). */
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
    if (deb >= 1 && cred >= 1 && score > bestScore) {
      bestScore = score;
      best = r;
    }
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

/** Колонки ОСВ: конечное сальдо Дт/Кт и обороты за период (а не сальдо на начало). */
function resolveOsvAmountCols(matrix, headerRow) {
  const width = matrixWidth(matrix);
  const groups = osvGroupHeaders(matrix, headerRow);
  const own = [];
  for (let c = 0; c < width; c++) {
    own.push(normalizeText((matrix[headerRow] || [])[c]).toLowerCase().replace(/ё/g, "е"));
  }
  const full = (c) => (groups[c] + " " + own[c]).trim();
  const isDeb = (t) => /дебет|(^|\s)дт(\s|$)/.test(t);
  const isCred = (t) => /кредит|(^|\s)кт(\s|$)/.test(t);

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

  const endRe = /сальдо[^а-я]*на\s*кон|сальдо\s*кон|кон[а-я]*\s*сальдо|(^|\s)ск(\s|$)/;
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

function colIdx(v) {
  return v == null || v < 0 ? -1 : v;
}

function parseOsv6062(matrix, fileName) {
  const headerRow = findOsvHeaderRow(matrix);
  if (headerRow == null) {
    throw new Error("Не найдена шапка ОСВ (нужны колонки Дебет/Кредит). Выгрузите ОСВ по счёту с сальдо и оборотами.");
  }
  const cols = resolveOsvAmountCols(matrix, headerRow);
  const amountCols = new Set([cols.debEnd, cols.credEnd, cols.debTurn, cols.credTurn].filter(c => c >= 0));
  if (cols.debEnd < 0 && cols.credEnd < 0) {
    throw new Error("Не найдены колонки конечного сальдо Дт/Кт. Выгрузите ОСВ с конечным сальдо.");
  }

  const width = matrixWidth(matrix);
  const findByHeader = (variants) => {
    for (let c = 0; c < width; c++) {
      if (amountCols.has(c)) continue;
      const t = (cols.groups[c] + " " + cols.own[c]).toLowerCase();
      if (variants.some(v => t.includes(v))) return c;
    }
    return -1;
  };
  let nameCol = findByHeader(["контрагент", "субконто", "аналитика", "наименование", "организац", "счет"]);
  if (nameCol < 0) {
    for (let c = 0; c < width; c++) { if (!amountCols.has(c)) { nameCol = c; break; } }
  }
  const contractCol = findByHeader(["договор", "соглашение"]);
  const innCol = findByHeader(["инн"]);
  const dateCol = findByHeader(["дата", "срок"]);
  const accountCol = (() => {
    const c = findByHeader(["счет учета", "счёт учета", "субсчет", "субсчёт"]);
    return c === nameCol ? -1 : c;
  })();

  const mainAccount = detectOsvMainAccount(matrix);
  const items = [];
  let skippedDocs = 0;
  for (let r = headerRow + 1; r < matrix.length; r++) {
    const row = matrix[r] || [];
    const name = nameCol >= 0 ? normalizeText(row[nameCol]) : "";
    if (isOsvServiceRow(name)) continue;
    if (isOsvDocumentRow(name)) { skippedDocs++; continue; }
    const debit = colIdx(cols.debEnd) >= 0 ? parseAmount(row[cols.debEnd]) : null;
    const credit = colIdx(cols.credEnd) >= 0 ? parseAmount(row[cols.credEnd]) : null;
    const debitTurn = colIdx(cols.debTurn) >= 0 ? parseAmount(row[cols.debTurn]) : null;
    const creditTurn = colIdx(cols.credTurn) >= 0 ? parseAmount(row[cols.credTurn]) : null;
    const anyValue = [debit, credit, debitTurn, creditTurn].some(v => v != null && Math.abs(v) > 0.009);
    if (!anyValue) continue;
    const account = accountCol >= 0 ? normalizeText(row[accountCol]) : mainAccount;
    items.push({
      name: name || "(без аналитики)",
      account: account || mainAccount,
      contract: contractCol >= 0 ? normalizeText(row[contractCol]) : "",
      inn: innCol >= 0 ? normalizeInn(row[innCol]) : "",
      date: null,
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
    hasDates: false,
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
  return { kind: vatData.vatKind || "76.ВА", byName, byInn, name: vatData.name };
}

function hasVatActivity(rec) {
  if (!rec) return false;
  return [rec.debit, rec.credit, rec.debitTurn, rec.creditTurn].some(v => Math.abs(v || 0) > 0.009);
}

const round2 = (n) => Math.round((n || 0) * 100) / 100;

/**
 * Сверка авансов с НДС по авансам:
 *   счёт 60 (Дт — аванс выданный) ↔ 76.ВА (авансовые СФ полученные, книга покупок)
 *   счёт 62 (Кт — аванс полученный) ↔ 76.АВ (авансовые СФ выданные, книга продаж)
 */
function checkAdvanceVat(mainData, vatIndex, opts) {
  const minAdvance = Math.max(0, Number(opts && opts.minAdvance) || 0);
  const acc = String(mainData.mainAccount || "").replace(/\s/g, "");
  const isReceived = /^62/.test(acc) || vatIndex.kind === "76.АВ";
  const kind = isReceived ? "76.АВ" : "76.ВА";
  const advLabel = isReceived ? "Аванс полученный (Кт 62)" : "Аванс выданный (Дт 60)";
  const payLabel = isReceived ? "Поступило в периоде (Кт 62 оборот)" : "Оплачено в периоде (Дт 60 оборот)";
  const missing = [];
  const notRestored = [];
  const mainAdv = new Map();
  let smallSkipped = 0;
  let smallSkippedSum = 0;

  for (const it of mainData.items) {
    const adv = isReceived ? it.credit : it.debit;
    if (!(adv > 0.009)) continue;
    const key = normalizePartnerKey(it.name);
    if (key && !mainAdv.has(key)) mainAdv.set(key, it);
    const rec = (it.inn && vatIndex.byInn.get(it.inn)) || (key ? vatIndex.byName.get(key) : null);
    if (hasVatActivity(rec)) continue;
    if (adv < minAdvance) { smallSkipped++; smallSkippedSum += adv; continue; }
    const payTurn = isReceived ? (it.creditTurn || 0) : (it.debitTurn || 0);
    missing.push({
      "Контрагент": it.name,
      "Счёт": it.account || acc || "—",
      [advLabel]: round2(adv),
      [payLabel]: round2(payTurn),
      "Период аванса": payTurn > 0.009 ? "предоплата текущего периода" : "переходит с прошлых периодов",
      "НДС 20/120 расчётно": round2(adv * 20 / 120),
      [kind]: rec ? "есть строка, движений нет" : "нет в ОСВ " + kind,
      "Проблема": isReceived
        ? "Аванс получен, СФ на аванс не выставлена (" + kind + " пусто)"
        : "Аванс выдан, авансовая СФ не получена (" + kind + " пусто) — справочно",
      "Вероятная причина": isReceived
        ? "НДС с полученной предоплаты не начислен."
        : "Поставщик не выставил (или в базу не занесён) авансовый счёт-фактура — НДС с предоплаты к вычету не заявлен.",
      "Что сделать": isReceived
        ? "Выставить СФ на аванс (5 календарных дней) и начислить НДС на 76.АВ."
        : "Запросить у поставщика СФ на аванс. Вычет — право, а не обязанность: если не заявляете, замечание справочное.",
      "Строка": it.sourceRow
    });
  }

  for (const [key, rec] of vatIndex.byName) {
    const bal = isReceived ? rec.debit : rec.credit;
    if (!(Math.abs(bal) > 0.009)) continue;
    if (mainAdv.has(key)) continue;
    notRestored.push({
      "Контрагент": rec.name,
      [kind + " сальдо"]: round2(bal),
      [advLabel]: 0,
      "Проблема": kind + " висит, аванса по счёту " + (isReceived ? "62" : "60") + " нет",
      "Вероятная причина": isReceived
        ? "Аванс зачтён, а НДС с аванса не принят к вычету."
        : "Аванс зачтён (закрыт поставкой), а НДС с аванса не восстановлен.",
      "Что сделать": isReceived
        ? "Проверить вычет НДС с аванса в периоде реализации (Дт 68.02 / Кт 76.АВ)."
        : "Проверить восстановление НДС с аванса в периоде поставки (Дт 76.ВА / Кт 68.02).",
      "Строка": rec.sourceRow
    });
  }

  const advKey = advLabel;
  missing.sort((a, b) => (b[advKey] || 0) - (a[advKey] || 0));
  notRestored.sort((a, b) => (b[kind + " сальдо"] || 0) - (a[kind + " сальдо"] || 0));
  return {
    missing,
    notRestored,
    kind,
    isReceived,
    advLabel,
    minAdvance,
    smallSkipped,
    smallSkippedSum: round2(smallSkippedSum),
    advTotal: round2(missing.reduce((s, r) => s + (r[advKey] || 0), 0)),
    vatTotal: round2(missing.reduce((s, r) => s + (r["НДС 20/120 расчётно"] || 0), 0))
  };
}

module.exports = {
  normalizeText,
  parseAmount,
  matrixWidth,
  normalizePartnerKey,
  normalizeInn,
  detectAccount76Kind,
  detectOsvMainAccount,
  isOsvDocumentRow,
  isOsvServiceRow,
  findOsvHeaderRow,
  osvGroupHeaders,
  resolveOsvAmountCols,
  parseOsv6062,
  buildVatAdvanceIndex,
  hasVatActivity,
  checkAdvanceVat
};
