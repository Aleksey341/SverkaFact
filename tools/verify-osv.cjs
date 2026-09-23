/**
 * Load diagnose6062 / parseOsv6062 from index.html (cut before DOM listeners)
 * and run SETTLE / ARITH / AGE sample checks.
 *
 * Usage: node tools/verify-osv.cjs
 */
const fs = require("fs");
const path = require("path");
const vm = require("vm");

const root = path.join(__dirname, "..");
const html = fs.readFileSync(path.join(root, "index.html"), "utf8");
const m = html.match(/<script(?![^>]*\bsrc=)[^>]*>([\s\S]*?)<\/script>/gi);
if (!m || m.length < 2) throw new Error("inline script not found");
const full = m[m.length - 1].replace(/^<script[^>]*>/i, "").replace(/<\/script>$/i, "");
const cutAt = full.indexOf("\nlet LAST_OSV");
if (cutAt < 0) throw new Error("LAST_OSV marker missing");
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
    subtle: {
      importKey: async () => ({}),
      verify: async () => false,
    },
    getRandomValues: (arr) => {
      for (let i = 0; i < arr.length; i++) arr[i] = (i * 17) & 255;
      return arr;
    },
  },
  alert: () => {},
  localStorage: {
    getItem: () => null,
    setItem: () => {},
    removeItem: () => {},
  },
  sessionStorage: {
    getItem: () => null,
    setItem: () => {},
    removeItem: () => {},
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
vm.runInContext(code, sandbox, { filename: "index-osv.js" });

const {
  parseOsv6062,
  diagnose6062,
  findCrossRowSettlements,
} = sandbox;
if (typeof parseOsv6062 !== "function" || typeof diagnose6062 !== "function") {
  throw new Error("OSV functions not exported into sandbox");
}

function loadSample(name) {
  return JSON.parse(fs.readFileSync(path.join(__dirname, "osv-samples", name), "utf8"));
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

// --- Sample: same contract 01↔02 → SETTLE-001 candidate ---
check("settle-candidate", () => {
  const { matrix, fileName } = loadSample("settle-candidate.json");
  const data = parseOsv6062(matrix, fileName);
  assert(data.hasContracts, "hasContracts");
  assert(data.hasSubaccounts, "hasSubaccounts");
  const cross = findCrossRowSettlements(data);
  assert(cross.some((c) => c.kind === "standard" && c.contractStatus === "same"), "cross same-contract");
  const diag = diagnose6062(data, { overdueDays: 30 });
  assert(diag.settle.candidates >= 1, "candidates>=1 got " + diag.settle.candidates);
  assert(diag.issues.some((r) => r["Код"] === "SETTLE-001"), "SETTLE-001 code");
  assert(diag.issues.some((r) => /Кандидат к зачёту/i.test(r["Проблема"] || "")), "candidate wording");
});

// --- Sample: no contract → SETTLE-INC ---
check("no-contract-inconclusive", () => {
  const { matrix, fileName } = loadSample("no-contract.json");
  const data = parseOsv6062(matrix, fileName);
  assert(!data.hasContracts, "no contracts");
  const diag = diagnose6062(data, { overdueDays: 30 });
  assert(diag.settle.inconclusive >= 1, "inconclusive");
  assert(diag.settle.candidates === 0, "no candidates without contract");
  assert(diag.issues.some((r) => r["Код"] === "SETTLE-INC"), "SETTLE-INC");
  assert((diag.inputQuality || []).some((f) => f.id === "NO-CONTRACT"), "NO-CONTRACT flag");
});

// --- Sample: arithmetic mismatch ---
check("arith-mismatch", () => {
  const { matrix, fileName } = loadSample("arith-bad.json");
  const data = parseOsv6062(matrix, fileName);
  assert(data.hasStartBalances && data.hasTurnovers, "start+turn");
  const diag = diagnose6062(data, { overdueDays: 30 });
  assert((diag.arithmetic || []).length >= 1, "arithmetic rows");
  assert(diag.issues.some((r) => r["Код"] === "ARITH-001"), "ARITH-001");
});

// --- Sample: overdue advance .02 ---
check("age-advance-02", () => {
  const { matrix, fileName } = loadSample("age-advance.json");
  const data = parseOsv6062(matrix, fileName);
  const diag = diagnose6062(data, { overdueDays: 30 });
  assert(diag.overdue.some((r) => r["Код"] === "AGE-002"), "AGE-002");
});

if (fail) {
  console.error("\n" + fail + " failed");
  process.exit(1);
}
console.log("\nAll OSV sample checks passed.");
