/**
 * Sync controls/index.json + regulatory/vat-rates.json into index.html embeds.
 * Usage: node tools/sync-embedded.cjs
 */
const fs = require("fs");
const path = require("path");

const root = path.join(__dirname, "..");
const htmlPath = path.join(root, "index.html");
const regPath = path.join(root, "controls", "index.json");
const vatPath = path.join(root, "regulatory", "vat-rates.json");

const controls = JSON.parse(fs.readFileSync(regPath, "utf8"));
const vat = JSON.parse(fs.readFileSync(vatPath, "utf8"));
const regulatory = { schema: "REGULATORY_V1", vat };

let html = fs.readFileSync(htmlPath, "utf8");

const regRe = /const CONTROL_REGISTRY = \{.*?\};\s*\n(?=function getControlDef)/s;
if (!regRe.test(html)) throw new Error("CONTROL_REGISTRY block not found");
html = html.replace(regRe, "const CONTROL_REGISTRY = " + JSON.stringify(controls) + ";\n\n");

const vatRe = /const REGULATORY = \{.*?\};\s*\n(?=\/\*\* Стандартная ставка НДС)/s;
if (!vatRe.test(html)) throw new Error("REGULATORY block not found");
html = html.replace(vatRe, "const REGULATORY = " + JSON.stringify(regulatory) + ";\n\n");

fs.writeFileSync(htmlPath, html, "utf8");
console.log("synced CONTROL_REGISTRY + REGULATORY into index.html");
console.log("standard rates:", (vat.standard || []).map((r) => r.rate + "@" + r.from).join(", "));
