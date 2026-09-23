/**
 * Load parseSfRegistry / compareNds from index.html (cut before NDS DOM listeners)
 * and run NDS sample checks.
 *
 * Usage: node tools/verify-nds.cjs
 */
const fs = require("fs");
const path = require("path");
const vm = require("vm");

const root = path.join(__dirname, "..");
const html = fs.readFileSync(path.join(root, "index.html"), "utf8");
const m = html.match(/<script(?![^>]*\bsrc=)[^>]*>([\s\S]*?)<\/script>/gi);
if (!m || m.length < 2) throw new Error("inline script not found");
const full = m[m.length - 1].replace(/^<script[^>]*>/i, "").replace(/<\/script>$/i, "");
const cutAt = full.indexOf("\nlet LAST_NDS");
if (cutAt < 0) throw new Error("LAST_NDS marker missing");
const code = full.slice(0, cutAt);

function stubEl() {
  return {
    addEventListener() {},
    removeEventListener() {},
    classList: {
      add() {},
      remove() {},
      contains() {
        return false;
      },
      toggle() {},
    },
    value: "",
    files: [],
    style: {},
    textContent: "",
    innerHTML: "",
    className: "",
    disabled: false,
    checked: false,
    hidden: false,
    dataset: {},
    setAttribute() {},
    getAttribute() {
      return null;
    },
  };
}

const sandbox = {
  console,
  Math,
  Date,
  Number,
  String,
  Array,
  Object,
  Map,
  Set,
  JSON,
  parseInt,
  parseFloat,
  isNaN,
  Infinity,
  undefined,
  RegExp,
  Error,
  Promise,
  Uint8Array,
  TextEncoder: typeof TextEncoder !== "undefined" ? TextEncoder : undefined,
  TextDecoder: typeof TextDecoder !== "undefined" ? TextDecoder : undefined,
  btoa: (s) => Buffer.from(s, "binary").toString("base64"),
  atob: (s) => Buffer.from(s, "base64").toString("binary"),
  window: {},
  document: {
    getElementById: () => stubEl(),
    querySelector: () => stubEl(),
    querySelectorAll: () => [],
    addEventListener() {},
  },
  crypto: {
    subtle: undefined,
    getRandomValues: (arr) => {
      for (let i = 0; i < arr.length; i++) arr[i] = (i * 17 + 3) & 255;
      return arr;
    },
  },
  localStorage: {
    _d: {},
    getItem(k) {
      return this._d[k] ?? null;
    },
    setItem(k, v) {
      this._d[k] = String(v);
    },
    removeItem(k) {
      delete this._d[k];
    },
  },
  sessionStorage: {
    _d: {},
    getItem(k) {
      return this._d[k] ?? null;
    },
    setItem(k, v) {
      this._d[k] = String(v);
    },
    removeItem(k) {
      delete this._d[k];
    },
  },
  navigator: { userAgent: "node" },
  location: { href: "http://localhost/", protocol: "http:" },
  HTMLElement: function () {},
  XLSX: undefined,
};
sandbox.window = sandbox;
sandbox.globalThis = sandbox;
sandbox.self = sandbox;

vm.createContext(sandbox);
vm.runInContext(code, sandbox, { filename: "index-nds.js" });

const { parseSfRegistry, compareNds } = sandbox;
if (typeof parseSfRegistry !== "function" || typeof compareNds !== "function") {
  throw new Error("NDS functions not exported into sandbox");
}

function loadSample(name) {
  return JSON.parse(fs.readFileSync(path.join(__dirname, "nds-samples", name), "utf8"));
}

function runPair(sample) {
  const a = parseSfRegistry(sample.a.matrix, sample.a.fileName);
  const b = parseSfRegistry(sample.b.matrix, sample.b.fileName);
  assert(a.rows.length > 0, "A rows");
  assert(b.rows.length > 0, "B rows");
  return { a, b, comp: compareNds(a, b) };
}

function assert(cond, msg) {
  if (!cond) throw new Error(msg);
}

let fail = 0;
function check(name, fn) {
  try {
    fn();
    console.log("OK ", name);
  } catch (e) {
    fail++;
    console.error("FAIL", name, e.message);
  }
}

check("ok-match", () => {
  const { comp } = runPair(loadSample("ok-match.json"));
  assert(comp.ok.length === 2, "ok=2 got " + comp.ok.length);
  assert(comp.sumDiff.length === 0, "no sumDiff");
  assert(comp.ndsDiff.length === 0, "no ndsDiff");
  assert(comp.missA.length === 0 && comp.missB.length === 0, "no miss");
  assert(comp.dupsA.length === 0 && comp.dupsB.length === 0, "no dups");
});

check("sum-diff + evidence", () => {
  const { comp } = runPair(loadSample("sum-diff.json"));
  assert(comp.sumDiff.length >= 1, "sumDiff");
  assert(comp.sumDiff.some((r) => r["Код"] === "NDS-SUM"), "NDS-SUM code");
  const row = comp.sumDiff.find((r) => r["Код"] === "NDS-SUM");
  assert(row["Источник"] && /sf-a-sum|sf-b-sum/i.test(row["Источник"]), "Источник " + row["Источник"]);
  assert(row["Строка A"] != null && row["Строка B"] != null, "Строка A/B");
  assert(Array.isArray(row._evidence) && row._evidence.length >= 2, "_evidence dual");
  assert(row._evidence.every((e) => e.source && e.row != null), "evidence source+row");
});

check("vat-diff", () => {
  const { comp } = runPair(loadSample("vat-diff.json"));
  assert(comp.ndsDiff.some((r) => r["Код"] === "NDS-VAT"), "NDS-VAT");
  assert(comp.rateDiff.some((r) => r["Код"] === "NDS-RATE"), "NDS-RATE (rate also differs)");
});

check("miss-b", () => {
  const { a, b, comp } = runPair(loadSample("miss-b.json"));
  assert(a.rows.length === 2 && b.rows.length === 1, "row counts");
  assert(comp.missB.some((r) => r["Код"] === "NDS-MISS-B"), "NDS-MISS-B");
  assert(comp.ok.length === 1, "one matched");
  const miss = comp.missB.find((r) => r["Код"] === "NDS-MISS-B");
  assert(miss["Источник"], "miss Источник");
  assert(miss["Строка"] != null || (miss._evidence && miss._evidence[0]), "miss row evidence");
});

check("dup-a", () => {
  const { comp } = runPair(loadSample("dup-a.json"));
  assert(comp.dupsA.some((r) => r["Код"] === "NDS-DUP"), "NDS-DUP");
  assert(comp.dupsA.length >= 2, "both dup rows listed");
});

check("nds-router plan", () => {
  const { a, b, comp } = runPair(loadSample("sum-diff.json"));
  assert(comp.router, "router present");
  assert(comp.evidence && comp.evidence.sf_a && comp.evidence.sf_b, "evidence sf_a/b");
  assert((comp.router.applicable || []).indexOf("NDS-SUM") >= 0, "NDS-SUM applicable");
  assert((comp.router.applicable || []).indexOf("NDS-DUP") >= 0, "NDS-DUP applicable");
  assert(["COMPLETE", "PARTIAL"].indexOf(comp.datasetSufficiency) >= 0, "suf " + comp.datasetSufficiency);
  assert(!a.hasMultiRateCols && !b.hasMultiRateCols, "samples without multi-rate cols");
  assert(comp.evidence.multi_rate === false, "evidence.multi_rate false");
  assert((comp.router.deferred || []).some((d) => d.code === "NDS-MULTI"), "NDS-MULTI deferred");
});

if (fail) {
  console.error("\n" + fail + " failed");
  process.exit(1);
}
console.log("\nAll NDS sample checks passed.");
