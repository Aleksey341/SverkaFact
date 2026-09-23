/**
 * DATA_SUFFICIENCY_V1 + requires_any / requires_all.
 */
function evidenceHasAny(evidence, keys) {
  return (keys || []).some(k => !!evidence[k]);
}

function evidenceMissingAnyGroup(evidence, groups) {
  const missingGroups = [];
  for (const g of groups || []) {
    if (!evidenceHasAny(evidence, g)) missingGroups.push(g.slice());
  }
  return missingGroups;
}

function assessControlSufficiency(code, evidence) {
  const def = getControlDef(code);
  if (!def) return { level: "INVALID", missingRequired: ["unknown_control"], missingOptional: [], missingRequiresAny: [] };
  const req = def.requires || [];
  const opt = def.optional || [];
  const reqAny = def.requires_any || [];
  const missingRequired = req.filter(k => !evidence[k]);
  const missingOptional = opt.filter(k => !evidence[k]);
  const missingRequiresAny = evidenceMissingAnyGroup(evidence, reqAny);

  if (!evidence.osv && req.indexOf("osv") >= 0) {
    return { level: "INVALID", missingRequired, missingOptional, missingRequiresAny };
  }
  if ((req.indexOf("sf") >= 0 || req.indexOf("sf_a") >= 0 || req.indexOf("sf_b") >= 0)
      && !evidence.sf && !evidence.sf_a && !evidence.sf_b) {
    return { level: "INVALID", missingRequired, missingOptional, missingRequiresAny };
  }
  if (missingRequired.length || missingRequiresAny.length) {
    const flatAny = missingRequiresAny.map(g => g.join("|"));
    return {
      level: "INSUFFICIENT",
      missingRequired: missingRequired.concat(flatAny),
      missingOptional,
      missingRequiresAny
    };
  }
  if (missingOptional.length) {
    return { level: "PARTIAL", missingRequired: [], missingOptional, missingRequiresAny: [] };
  }
  return { level: "COMPLETE", missingRequired: [], missingOptional: [], missingRequiresAny: [] };
}

function assessDatasetSufficiency(evidence, plan) {
  if (!evidence.osv) return "INVALID";
  const codes = plan && plan.applicable || [];
  let worst = "COMPLETE";
  const rank = { COMPLETE: 0, PARTIAL: 1, INSUFFICIENT: 2, INVALID: 3 };
  for (const code of codes) {
    const a = assessControlSufficiency(code, evidence);
    if (rank[a.level] > rank[worst]) worst = a.level;
  }
  if (!evidence.contract && evidence.osv) {
    if (rank.PARTIAL > rank[worst] || worst === "COMPLETE") worst = "PARTIAL";
  }
  return worst;
}

function assessNdsDatasetSufficiency(evidence, plan) {
  if (!evidence.sf && !evidence.sf_a && !evidence.sf_b) return "INVALID";
  if (!evidence.sf_a || !evidence.sf_b) return "INSUFFICIENT";
  const codes = (plan && plan.applicable) || [];
  let worst = "COMPLETE";
  const rank = { COMPLETE: 0, PARTIAL: 1, INSUFFICIENT: 2, INVALID: 3 };
  for (const code of codes) {
    const a = assessControlSufficiency(code, evidence);
    if (rank[a.level] > rank[worst]) worst = a.level;
  }
  return worst;
}
