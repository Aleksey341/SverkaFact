/**
 * CONTROL_RESULT_SCHEMA_V1 + status helpers.
 * Expects global CONTROL_REGISTRY.
 */
function getControlDef(code) {
  if (!code) return null;
  const c = CONTROL_REGISTRY.controls || {};
  return c[code] || null;
}

function statusToSeverity(status) {
  const map = (CONTROL_REGISTRY.semantic_status || {})[status];
  return map && map.ui ? map.ui : "warning";
}

function statusLabel(status) {
  const map = (CONTROL_REGISTRY.semantic_status || {})[status];
  return map && map.label ? map.label : (status || "");
}

function severityToStatus(level) {
  if (level === "error") return "ACCOUNTING_ERROR";
  if (level === "info") return "INSUFFICIENT_DATA";
  return "REVIEW";
}

function resolveControlStatus(code, explicitStatus, explicitSeverity) {
  if (explicitStatus) return explicitStatus;
  const def = getControlDef(code);
  if (def && def.default_status) return def.default_status;
  return severityToStatus(explicitSeverity || "warning");
}

/** CONTROL_RESULT_SCHEMA_V1 */
function makeControlResult(opts) {
  opts = opts || {};
  const code = opts.control || opts.code || "";
  const def = getControlDef(code);
  return {
    schema: "CONTROL_RESULT_SCHEMA_V1",
    control: code,
    execution: opts.execution || "EXECUTED",
    status: opts.status || "PASS",
    sufficiency: opts.sufficiency || null,
    finding_count: opts.finding_count != null ? opts.finding_count : 0,
    evidence: opts.evidence || [],
    missing: opts.missing || [],
    match_confidence: opts.match_confidence || null,
    rule_version: (def && def.version) || 1,
    regulatory_version: opts.regulatory_version || null
  };
}

/**
 * Сводка по плану router + найденным строкам (по Код).
 * findingsByCode: { "VAT-ADV-60": [rows...] }
 */
function buildControlResults(plan, findingsByCode, opts) {
  opts = opts || {};
  const out = [];
  const byCode = findingsByCode || {};
  const applicable = (plan && plan.applicable) || [];
  const deferred = (plan && plan.deferred) || [];
  const notApplicable = (plan && plan.notApplicable) || [];
  const seen = new Set();

  for (const d of deferred) {
    const code = d.code || d;
    seen.add(code);
    out.push(makeControlResult({
      control: code,
      execution: "DEFERRED",
      status: "INSUFFICIENT_DATA",
      sufficiency: d.sufficiency || "INSUFFICIENT",
      finding_count: 0,
      missing: d.missing || [],
      regulatory_version: opts.regulatory_version || null
    }));
  }
  for (const d of notApplicable) {
    const code = d.code || d;
    seen.add(code);
    out.push(makeControlResult({
      control: code,
      execution: "NOT_APPLICABLE",
      status: "NOT_APPLICABLE",
      finding_count: 0,
      regulatory_version: opts.regulatory_version || null
    }));
  }
  for (const code of applicable) {
    seen.add(code);
    const rows = byCode[code] || [];
    const suf = opts.evidence ? assessControlSufficiency(code, opts.evidence) : { level: null };
    if (!rows.length) {
      out.push(makeControlResult({
        control: code,
        execution: "EXECUTED",
        status: "PASS",
        sufficiency: suf.level,
        finding_count: 0,
        regulatory_version: opts.regulatory_version || null
      }));
    } else {
      const status = resolveControlStatus(code, rows[0]._status || null, rows[0]._severity);
      const ev = [];
      for (const r of rows.slice(0, 20)) {
        if (Array.isArray(r._evidence)) ev.push(...r._evidence);
      }
      out.push(makeControlResult({
        control: code,
        execution: "EXECUTED",
        status,
        sufficiency: suf.level,
        finding_count: rows.length,
        evidence: ev.slice(0, 40),
        match_confidence: rows[0] && rows[0]._matchConfidence ? rows[0]._matchConfidence : null,
        regulatory_version: opts.regulatory_version || null
      }));
    }
  }
  // findings for codes not in plan (shouldn't happen often)
  for (const code of Object.keys(byCode)) {
    if (seen.has(code)) continue;
    const rows = byCode[code] || [];
    if (!rows.length) continue;
    out.push(makeControlResult({
      control: code,
      execution: "EXECUTED",
      status: resolveControlStatus(code, rows[0]._status || null, rows[0]._severity),
      finding_count: rows.length,
      evidence: (rows[0]._evidence || []).slice(0, 10),
      regulatory_version: opts.regulatory_version || null
    }));
  }
  return out;
}

function groupFindingsByCode(rowLists) {
  const map = {};
  for (const list of rowLists || []) {
    for (const r of list || []) {
      const code = r["Код"] || r.code;
      if (!code) continue;
      if (!map[code]) map[code] = [];
      map[code].push(r);
    }
  }
  return map;
}

function latestRegulatoryVersion() {
  const list = (REGULATORY && REGULATORY.vat && REGULATORY.vat.standard) || [];
  let best = null;
  for (const row of list) {
    if (!best || String(row.from) > String(best)) best = row.from;
  }
  return best;
}
