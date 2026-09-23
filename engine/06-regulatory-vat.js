/**
 * Regulatory VAT helpers. Expects global REGULATORY; uses parseDate if available.
 */
function getStandardVatRate(date) {
  const list = (REGULATORY.vat && REGULATORY.vat.standard) || [];
  let t = null;
  if (date instanceof Date && !Number.isNaN(date.getTime())) {
    t = Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate());
  } else if (date) {
    const d = typeof parseDate === "function" ? parseDate(date) : null;
    if (d) t = Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate());
  }
  if (t == null) t = Date.UTC(new Date().getFullYear(), new Date().getMonth(), new Date().getDate());
  let hit = null;
  for (const row of list) {
    const from = typeof parseDate === "function" ? parseDate(row.from) : null;
    const to = row.to && typeof parseDate === "function" ? parseDate(row.to) : null;
    const f = from ? Date.UTC(from.getUTCFullYear(), from.getUTCMonth(), from.getUTCDate()) : 0;
    const e = to ? Date.UTC(to.getUTCFullYear(), to.getUTCMonth(), to.getUTCDate()) : Infinity;
    if (t >= f && t <= e) hit = row.rate;
  }
  if (hit != null) return hit;
  if (list.length) return list[list.length - 1].rate;
  return 20;
}

function vatInclusiveShare(rate) {
  const r = Number(rate);
  if (!Number.isFinite(r) || r < 0) return 0;
  return r / (100 + r);
}

function vatInclusiveFormula(rate) {
  const r = Number(rate);
  if (!Number.isFinite(r)) return "—";
  return r + "/" + (100 + r);
}

function calcInclusiveVat(amountWithVat, date) {
  const rate = getStandardVatRate(date);
  const r2 = (n) => Math.round((n || 0) * 100) / 100;
  return { rate, formula: vatInclusiveFormula(rate), vat: r2((amountWithVat || 0) * vatInclusiveShare(rate)) };
}

function knownVatRates() {
  const v = REGULATORY.vat || {};
  if (Array.isArray(v.known_rates) && v.known_rates.length) return v.known_rates.slice();
  const out = new Set(v.reduced || []);
  for (const row of v.standard || []) if (row.rate != null) out.add(row.rate);
  return [...out].sort((a, b) => a - b);
}
