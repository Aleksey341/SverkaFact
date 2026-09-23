/**
 * Match confidence for partner linking (OSV ↔ 76 / SF).
 * HIGH = INN exact; MEDIUM = normalized name; LOW = weak/fuzzy (reserved).
 */
function matchPartnerConfidence(it, rec, via) {
  if (!rec) {
    return { level: "NONE", via: via || "none", label: "нет пары" };
  }
  if (via === "inn" || (it && it.inn && rec && (rec.inn === it.inn || via === "inn"))) {
    return { level: "HIGH", via: "inn", label: "ИНН" };
  }
  if (via === "name" || via === "normalized_name") {
    return { level: "MEDIUM", via: "name", label: "имя (нормализ.)" };
  }
  return { level: "MEDIUM", via: via || "name", label: "имя (нормализ.)" };
}

function resolveVatAdvLookup(it, vatIndex) {
  if (it.inn && vatIndex.byInn && vatIndex.byInn.has(it.inn)) {
    return { rec: vatIndex.byInn.get(it.inn), via: "inn" };
  }
  const key = typeof normalizePartnerKey === "function" ? normalizePartnerKey(it.name) : "";
  if (key && vatIndex.byName && vatIndex.byName.has(key)) {
    return { rec: vatIndex.byName.get(key), via: "name" };
  }
  return { rec: null, via: "none" };
}

/** ACCOUNTING_ERROR only when match confidence is HIGH (or finding is absence without pair). */
function vatAdvSeverity(isReceived, confidenceLevel, hasPairRow) {
  // Missing SF with no pair at all → still flag; for isReceived (62) error only if HIGH or NONE (no false name miss as error)
  if (!isReceived) return "info";
  if (confidenceLevel === "HIGH") return "error";
  if (confidenceLevel === "NONE") return "error"; // no link possible → still accounting risk for received advances
  return "warning"; // MEDIUM name-only → REVIEW, not ACCOUNTING_ERROR
}

function applyMatchConfidenceToRow(row, confidence) {
  row._matchConfidence = confidence.level;
  row["Уверенность связи"] = confidence.label || confidence.level;
  return row;
}
