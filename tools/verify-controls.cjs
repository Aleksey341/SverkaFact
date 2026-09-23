/**
 * Verify controls/index.json ↔ CONTROL_REGISTRY in index.html ↔ codes used in engine.
 * Usage: node tools/verify-controls.cjs
 */
const fs = require("fs");
const path = require("path");

const root = path.join(__dirname, "..");
const regPath = path.join(root, "controls", "index.json");
const htmlPath = path.join(root, "index.html");

const reg = JSON.parse(fs.readFileSync(regPath, "utf8"));
const html = fs.readFileSync(htmlPath, "utf8");

if (reg.schema !== "CONTROL_REGISTRY_V1") throw new Error("bad schema");
if (!html.includes("CONTROL_REGISTRY")) throw new Error("CONTROL_REGISTRY not embedded in index.html");
if (!html.includes("resolveControlStatus")) throw new Error("resolveControlStatus missing");

const controls = reg.controls || {};
const ids = Object.keys(controls);
if (ids.length < 10) throw new Error("too few controls in registry");

let fail = 0;
function check(name, cond, detail) {
  if (cond) console.log("OK ", name);
  else {
    fail++;
    console.error("FAIL", name, detail || "");
  }
}

check("schema", reg.schema === "CONTROL_REGISTRY_V1");
check("semantic_status keys", ["ACCOUNTING_ERROR", "REVIEW", "INSUFFICIENT_DATA"].every((k) => reg.semantic_status[k]));
check("data_sufficiency", !!(reg.data_sufficiency && reg.data_sufficiency.schema === "DATA_SUFFICIENCY_V1"));
check("router schema", !!(reg.router && reg.router.schema === "CONTROL_ROUTER_V1"));
check("html has routeR6062", html.includes("function routeR6062Controls"));
check("html has buildOsvEvidence", html.includes("function buildOsvEvidence"));
check("html has assessControlSufficiency", html.includes("function assessControlSufficiency"));
check("html has attachEvidence", html.includes("function attachEvidence"));
check("issueRow sets Источник", /"Источник"\s*:/.test(html) && html.includes("attachEvidence(row"));

// Every registry id should appear as string literal in HTML (except we allow embedding only via JSON)
const embeddedMatch = html.match(/const CONTROL_REGISTRY = (\{.*?\});\s*\nfunction getControlDef/s);
check("embedded JSON parseable", !!embeddedMatch, "regex miss");
if (embeddedMatch) {
  const embedded = JSON.parse(embeddedMatch[1]);
  const a = JSON.stringify(reg.controls);
  const b = JSON.stringify(embedded.controls);
  check("embedded controls == file", a === b);
}

// Codes that engine uses should be in registry
const used = new Set();
const re = /(?:code:\s*|Код":\s*|=\s*)["']([A-Z]{2,}(?:-[A-Z0-9]+){1,3})["']/g;
let m;
while ((m = re.exec(html))) {
  if (controls[m[1]] || (reg.input_quality && reg.input_quality[m[1]])) used.add(m[1]);
  else if (/^(SETTLE|AGE|ARITH|VAT|NDS|RED|ANL|DUP)-/.test(m[1])) used.add(m[1]);
}

const missingInReg = [...used].filter((c) => !controls[c] && !(reg.input_quality && reg.input_quality[c]));
check("engine codes in registry", missingInReg.length === 0, missingInReg.join(", "));

for (const id of ids) {
  const c = controls[id];
  if (!c.default_status || !reg.semantic_status[c.default_status]) {
    fail++;
    console.error("FAIL bad default_status", id, c.default_status);
  }
}
if (!fail) console.log("OK  all default_status valid");

// Spot-check known ones
check("SETTLE-001 REVIEW", controls["SETTLE-001"].default_status === "REVIEW");
check("SETTLE-INC INSUFFICIENT", controls["SETTLE-INC"].default_status === "INSUFFICIENT_DATA");
check("NDS-SUM ERROR", controls["NDS-SUM"].default_status === "ACCOUNTING_ERROR");
check("VAT-ADV-62 ERROR", controls["VAT-ADV-62"].default_status === "ACCOUNTING_ERROR");

if (fail) {
  console.error("\n" + fail + " failed");
  process.exit(1);
}
console.log("\nCONTROL_REGISTRY_V1 ok —", ids.length, "controls");
