/**
 * Regression for ACT PDF parsing.
 * Covers a two-sided portrait A4 reconciliation act where the real document
 * number is printed on a row above "Операция №1".
 */
const fs = require("fs");
const path = require("path");
const vm = require("vm");

const root = path.join(__dirname, "..");

function stubEl() {
  return {
    addEventListener() {}, removeEventListener() {},
    classList: { add() {}, remove() {}, contains() { return false; }, toggle() {} },
    value: "", files: [], style: {}, textContent: "", innerHTML: "", className: "",
    disabled: false, checked: false, hidden: false, dataset: {},
    setAttribute() {}, getAttribute() { return null; }
  };
}

function loadEngine() {
  const html = fs.readFileSync(path.join(root, "index.html"), "utf8");
  const xlsxSrc = fs.readFileSync(path.join(root, "vendor", "xlsx.bundle.js"), "utf8");
  const scripts = html.match(/<script(?![^>]*\bsrc=)[^>]*>([\s\S]*?)<\/script>/gi);
  if (!scripts || scripts.length < 2) throw new Error("inline script not found");
  const full = scripts[scripts.length - 1].replace(/^<script[^>]*>/i, "").replace(/<\/script>$/i, "");
  const cutAt = full.indexOf("\nlet LAST_NDS");
  if (cutAt < 0) throw new Error("LAST_NDS marker missing");
  const code = full.slice(0, cutAt);

  const sandbox = {
    console, Math, Date, Number, String, Array, Object, Map, Set, JSON,
    parseInt, parseFloat, isNaN, Infinity, undefined, RegExp, Error, Promise,
    Uint8Array, ArrayBuffer, Buffer, TextDecoder,
    atob: (s) => Buffer.from(s, "base64").toString("binary"),
    btoa: (s) => Buffer.from(s, "binary").toString("base64"),
    window: {},
    document: {
      getElementById: () => stubEl(), querySelector: () => stubEl(),
      querySelectorAll: () => [], addEventListener() {}
    },
    crypto: { getRandomValues(a) { for (let i = 0; i < a.length; i++) a[i] = i + 1; return a; } },
    localStorage: {
      _d: {}, getItem(k) { return this._d[k] ?? null; },
      setItem(k, v) { this._d[k] = String(v); }, removeItem(k) { delete this._d[k]; }
    },
    sessionStorage: {
      _d: {}, getItem(k) { return this._d[k] ?? null; },
      setItem(k, v) { this._d[k] = String(v); }, removeItem(k) { delete this._d[k]; }
    },
    navigator: { userAgent: "node" },
    location: { href: "http://localhost/", protocol: "http:" },
    HTMLElement: function () {}
  };
  sandbox.window = sandbox;
  sandbox.globalThis = sandbox;
  sandbox.self = sandbox;
  vm.createContext(sandbox);
  vm.runInContext(xlsxSrc, sandbox, { filename: "xlsx.bundle.js" });
  vm.runInContext(code, sandbox, { filename: "index-engine.js" });
  return sandbox;
}

function assert(cond, msg) {
  if (!cond) throw new Error(msg);
}

function pdfItem(str, x, top, width) {
  const pageH = 842;
  return { str, transform: [1, 0, 0, 1, x, pageH - top], width: width || Math.max(8, str.length * 3.2) };
}

async function main() {
  const S = loadEngine();
  const items = [
    // Left and right headers: portrait A4 is ~595 pt wide.
    pdfItem("Дата", 38, 235, 16),
    pdfItem("Документ/Операция", 95, 235, 75),
    pdfItem("Дебет", 232, 235, 22),
    pdfItem("Кредит", 267, 235, 24),
    pdfItem("Дата", 308, 235, 16),
    pdfItem("Документ/Операция", 365, 235, 75),
    pdfItem("Дебет", 500, 235, 22),
    pdfItem("Кредит", 540, 235, 24),

    pdfItem("документ № 226 от 07.09.2026", 68, 289, 125),
    pdfItem("07.09.2026", 32, 304, 38),
    pdfItem("Операция №1", 105, 304, 48),
    pdfItem("0.00", 235, 304, 18),
    pdfItem("3 132.00", 268, 304, 28),

    pdfItem("документ № 228 от 07.09.2026", 68, 328, 125),
    pdfItem("07.09.2026", 32, 343, 38),
    pdfItem("Операция №1", 105, 343, 48),
    pdfItem("0.00", 235, 343, 18),
    pdfItem("28 188.00", 268, 343, 31),

    pdfItem("документ № 0000-2064 от 07.09.2026", 68, 367, 145),
    pdfItem("07.09.2026", 32, 382, 38),
    pdfItem("Операция №1", 105, 382, 48),
    pdfItem("31 320.00", 232, 382, 31),
    pdfItem("0.00", 270, 382, 18)
  ];

  S.pdfjsLib = {
    getDocument() {
      return { promise: Promise.resolve({
        numPages: 1,
        async getPage() {
          return {
            getViewport: () => ({ width: 595.5, height: 842 }),
            getTextContent: async () => ({ items })
          };
        }
      }) };
    }
  };

  const fakePdf = { name: "Акт сверки №1088.pdf", arrayBuffer: async () => new ArrayBuffer(1) };
  const rawPdf = await S.readPdfToMatrix(fakePdf);
  const pdfAct = S.parseAct(rawPdf.matrix, 1, fakePdf.name, false);

  const xlsxMatrix = [
    ["Дата", "Документ", "Дебет", "Кредит"],
    ["07.09.2026", "Приход (2064 от 07.09.2026)", null, 31320],
    ["07.09.2026", "Оплата (226 от 07.09.2026)", 3132, null],
    ["07.09.2026", "Оплата (228 от 07.09.2026)", 28188, null]
  ];
  const xlsxAct = S.parseAct(xlsxMatrix, 2, "Акт сверки №33.xlsx", true);
  const comp = S.compareActs(pdfAct, xlsxAct, { 1: true, 2: true, 3: true, 4: true });

  const nums = pdfAct.operations.map(o => o.number).sort();
  assert(pdfAct.operations.length === 3, "PDF must yield exactly 3 operations");
  assert(JSON.stringify(nums) === JSON.stringify(["2064", "226", "228"]), "PDF document numbers lost: " + nums.join(","));
  assert(comp.notFound1.length === 0 && comp.notFound2.length === 0, "Acts must reconcile with no unmatched rows");
  assert(comp.duplicatesDateNumber.length === 0 && comp.duplicatesNumber.length === 0, "False duplicates detected");
  const m1 = comp.methodsSummary.find(m => m.method === 1);
  assert(m1 && m1.act1Cnt === 3 && m1.act2Cnt === 3, "Expected 3 method-1 matches");

  console.log("ACT PDF regression OK: 3/3 full matches, docs 226, 228, 2064, no false duplicates");
}

main().catch(err => {
  console.error(err && err.stack ? err.stack : err);
  process.exit(1);
});
