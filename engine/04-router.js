/**
 * CONTROL_ROUTER_V1 — routing by registry requires / requires_any (no hard-coded VAT deps).
 */
function controlPlanEnabled(plan, code) {
  return (plan.applicable || []).indexOf(code) >= 0;
}

function routeModuleControls(moduleId, evidence, extraGate) {
  const all = Object.keys((CONTROL_REGISTRY.controls) || {}).filter(id => {
    const d = getControlDef(id);
    return d && d.module === moduleId;
  });
  const applicable = [];
  const partial = [];
  const deferred = [];
  const notApplicable = [];
  for (const code of all) {
    if (typeof extraGate === "function") {
      const gate = extraGate(code, evidence);
      if (gate === "notApplicable") {
        notApplicable.push({ code, reason: "не применимо к профилю данных" });
        continue;
      }
      if (gate && gate.notApplicable) {
        notApplicable.push({ code, reason: gate.reason || "не применимо" });
        continue;
      }
    }
    const suf = assessControlSufficiency(code, evidence);
    if (suf.level === "INVALID" || suf.level === "INSUFFICIENT") {
      deferred.push({
        code,
        reason: "не хватает: " + (suf.missingRequired || []).join(", "),
        missing: suf.missingRequired || [],
        sufficiency: suf.level
      });
    } else if (suf.level === "PARTIAL") {
      partial.push({ code, missingOptional: suf.missingOptional, sufficiency: suf.level });
      applicable.push(code);
    } else {
      applicable.push(code);
    }
  }
  return { applicable, partial, deferred, notApplicable, module: moduleId };
}

function routeR6062Controls(evidence) {
  const plan = routeModuleControls("r6062", evidence, (code) => {
    if (code === "VAT-ADV-60" && evidence.osv62 && !evidence.osv60) {
      return { notApplicable: true, reason: "основной счёт 62 — контроль для 60" };
    }
    if (code === "VAT-ADV-62" && evidence.osv60 && !evidence.osv62) {
      return { notApplicable: true, reason: "основной счёт 60 — контроль для 62" };
    }
    return null;
  });
  plan.datasetSufficiency = assessDatasetSufficiency(evidence, plan);
  return plan;
}

function routeNdsControls(evidence) {
  const plan = routeModuleControls("nds", evidence, (code) => {
    // NDS-MULTI without multi_rate columns → deferred via requires_any / optional handled in sufficiency;
    // keep explicit defer only if control requires multi_rate exclusively — optional keeps PARTIAL.
    return null;
  });
  // If multi_rate missing and control lists it only as optional, MULTI stays PARTIAL+applicable.
  // Prefer defer when requires_any includes [multi_rate] alone — set in registry.
  plan.datasetSufficiency = assessNdsDatasetSufficiency(evidence, plan);
  plan.module = "nds";
  return plan;
}
