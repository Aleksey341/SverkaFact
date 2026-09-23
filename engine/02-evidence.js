/**
 * Evidence helpers + attachEvidence.
 * Expects normalizeText / fmt helpers only where needed — attachEvidence is self-contained.
 */
function buildOsvEvidence(data, opts) {
  opts = opts || {};
  const mainAcc = String((data && data.mainAccount) || "").replace(/\s/g, "");
  const vatKind = opts.vatIndex && opts.vatIndex.kind ? opts.vatIndex.kind : "";
  return {
    osv: !!(data && data.items && data.items.length),
    subaccounts: !!(data && data.hasSubaccounts),
    contract: !!(data && data.hasContracts),
    inn: !!(data && data.hasInns),
    date: !!(data && data.hasDates),
    start_balance: !!(data && data.hasStartBalances),
    turnovers: !!(data && data.hasTurnovers),
    osv60: /^60/.test(mainAcc),
    osv62: /^62/.test(mainAcc),
    osv76: !!opts.vatIndex,
    osv76va: vatKind === "76.ВА",
    osv76av: vatKind === "76.АВ",
    purchase_book: !!(opts.sfPartners && !opts.vatIndex && /^60/.test(mainAcc)),
    sales_book: !!(opts.sfPartners && !opts.vatIndex && /^62/.test(mainAcc)),
    sf: !!opts.sfPartners,
    sf_a: false,
    sf_b: false
  };
}

function buildNdsEvidence(a, b) {
  const rowsA = (a && a.rows) || [];
  const rowsB = (b && b.rows) || [];
  const all = rowsA.concat(rowsB);
  const has = (pred) => all.some(pred);
  return {
    osv: false,
    sf_a: rowsA.length > 0,
    sf_b: rowsB.length > 0,
    sf: rowsA.length > 0 || rowsB.length > 0,
    inn: has(r => !!r.inn),
    date: has(r => !!r.date),
    rate: has(r => r.rate != null) || !!(a && a.hasMultiRateCols) || !!(b && b.hasMultiRateCols),
    kpp: has(r => !!r.kpp),
    corr_meta: has(r => !!(r.corrNumber || r.corrDate || r.isCorr)),
    multi_rate: !!(a && a.hasMultiRateCols) || !!(b && b.hasMultiRateCols)
      || has(r => r.multiRates && r.multiRates.length > 1)
  };
}

/** Evidence-пакет: где программа нашла факт. entries: [{ source, row }] */
function attachEvidence(row, entries) {
  const list = (entries || []).filter(e => e && (e.source || e.row != null));
  row._evidence = list.map(e => ({
    source: e.source || "",
    row: e.row != null ? e.row : null
  }));
  if (!list.length) {
    if (row["Источник"] == null) row["Источник"] = "—";
    return row;
  }
  const sources = [...new Set(list.map(e => e.source).filter(Boolean))];
  const rows = list.map(e => e.row).filter(r => r != null && r !== "");
  row["Источник"] = sources.length ? sources.join(" + ") : (row["Источник"] || "—");
  if (list.length > 1) {
    row["Строка"] = rows.length ? rows.join(" / ") : (row["Строка"] || "—");
    row["Evidence"] = list.map(e => (e.source || "?") + ":" + (e.row != null ? e.row : "?")).join("; ");
  } else if (rows.length && (row["Строка"] == null || row["Строка"] === "" || row["Строка"] === "—")) {
    row["Строка"] = rows.join(" / ");
  }
  return row;
}
