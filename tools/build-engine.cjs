/**
 * Build engine into index.html between SF_ENGINE markers.
 * Also embeds CONTROL_REGISTRY + REGULATORY from JSON sources.
 *
 * Usage: node tools/build-engine.cjs
 */
const fs = require("fs");
const path = require("path");

const root = path.join(__dirname, "..");
const htmlPath = path.join(root, "index.html");
const engDir = path.join(root, "engine");
const regPath = path.join(root, "controls", "index.json");
const vatPath = path.join(root, "regulatory", "vat-rates.json");

const BEGIN = "/* SF_ENGINE_BEGIN */";
const END = "/* SF_ENGINE_END */";

const controls = JSON.parse(fs.readFileSync(regPath, "utf8"));
const vat = JSON.parse(fs.readFileSync(vatPath, "utf8"));
const regulatory = { schema: "REGULATORY_V1", vat };

const engineFiles = fs.readdirSync(engDir)
  .filter((f) => /^\d+-.*\.js$/.test(f))
  .sort();

let engineBody = "";
for (const f of engineFiles) {
  engineBody += "\n/* --- engine/" + f + " --- */\n";
  engineBody += fs.readFileSync(path.join(engDir, f), "utf8").trim() + "\n";
}

const block =
  BEGIN + "\n" +
  "const CONTROL_REGISTRY = " + JSON.stringify(controls) + ";\n\n" +
  "const REGULATORY = " + JSON.stringify(regulatory) + ";\n" +
  engineBody +
  END;

let html = fs.readFileSync(htmlPath, "utf8");

if (html.includes(BEGIN) && html.includes(END)) {
  const re = /\/\* SF_ENGINE_BEGIN \*\/[\s\S]*?\/\* SF_ENGINE_END \*\//;
  if (!re.test(html)) throw new Error("engine markers found but regex failed");
  html = html.replace(re, () => block);
} else {
  // First-time: replace legacy CONTROL_REGISTRY … routeNdsControls block
  const legacy = /const CONTROL_REGISTRY = \{.*?\};\s*\nfunction getControlDef[\s\S]*?^function routeNdsControls\([\s\S]*?^\}/m;
  // More reliable: from CONTROL_REGISTRY through routeNdsControls closing brace before normalizeText
  const start = html.indexOf("const CONTROL_REGISTRY = ");
  const norm = html.indexOf("\nfunction normalizeText(v)");
  if (start < 0 || norm < 0) throw new Error("cannot locate legacy engine span");
  html = html.slice(0, start) + block + "\n\n" + html.slice(norm + 1);
}

// Remove duplicate attachEvidence if engine now provides it and old copy remains later
const attachMatches = [...html.matchAll(/function attachEvidence\s*\(/g)];
if (attachMatches.length > 1) {
  // remove the second definition (legacy after checkAdvanceVat)
  const second = html.indexOf("function attachEvidence", attachMatches[0].index + 1);
  if (second > 0) {
    const after = html.indexOf("\nfunction ", second + 1);
    const endFn = after > 0 ? after : html.length;
    // find end of attachEvidence function carefully
    let i = html.indexOf("{", second);
    let depth = 0;
    let end = -1;
    for (; i < html.length; i++) {
      if (html[i] === "{") depth++;
      else if (html[i] === "}") {
        depth--;
        if (depth === 0) { end = i + 1; break; }
      }
    }
    if (end > second) {
      // also drop preceding doc comment
      let from = second;
      const doc = html.lastIndexOf("/**", second);
      if (doc > second - 200 && doc >= 0) from = doc;
      html = html.slice(0, from) + html.slice(end);
      console.log("removed duplicate attachEvidence");
    }
  }
}

fs.writeFileSync(htmlPath, html, "utf8");
fs.writeFileSync(path.join(engDir, "bundle.generated.js"), block, "utf8");
console.log("built engine:", engineFiles.join(", "));
console.log("controls:", Object.keys(controls.controls || {}).length, "vat standard:", (vat.standard || []).map((r) => r.rate).join("/"));
