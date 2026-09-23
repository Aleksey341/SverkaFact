/**
 * Smoke-run on live xlsx in project root (gitignored /*.xlsx).
 * Doctor 60/62 (+76.*) and ACT. NDS — only if SF registries present.
 *
 * Usage: node tools/smoke-live.cjs
 * Report: avito/smoke-live-report.json (local, under /avito/)
 */
const fs = require("fs");
const path = require("path");
const vm = require("vm");

const root = path.join(__dirname, "..");
const reportPath = path.join(root, "avito", "smoke-live-report.json");

function stubEl() {
  return {
    addEventListener() {},
    removeEventListener() {},
    classList: { add() {}, remove() {}, contains() { return false; }, toggle() {} },
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
    getAttribute() { return null; },
  };
}

function loadEngine() {
  const html = fs.readFileSync(path.join(root, "index.html"), "utf8");
  const xlsxSrc = fs.readFileSync(path.join(root, "vendor", "xlsx.bundle.js"), "utf8");
  const m = html.match(/<script(?![^>]*\bsrc=)[^>]*>([\s\S]*?)<\/script>/gi);
  if (!m || m.length < 2) throw new Error("inline script not found");
  const full = m[m.length - 1].replace(/^<script[^>]*>/i, "").replace(/<\/script>$/i, "");
  const cutAt = full.indexOf("\nlet LAST_NDS");
  if (cutAt < 0) throw new Error("LAST_NDS marker missing");
  const code = full.slice(0, cutAt);

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
    ArrayBuffer,
    Buffer,
    atob: (s) => Buffer.from(s, "base64").toString("binary"),
    btoa: (s) => Buffer.from(s, "binary").toString("base64"),
    window: {},
    document: {
      getElementById: () => stubEl(),
      querySelector: () => stubEl(),
      querySelectorAll: () => [],
      addEventListener() {},
    },
    crypto: {
      getRandomValues(arr) {
        for (let i = 0; i < arr.length; i++) arr[i] = (i * 17 + 3) & 255;
        return arr;
      },
    },
    localStorage: {
      _d: {},
      getItem(k) { return this._d[k] ?? null; },
      setItem(k, v) { this._d[k] = String(v); },
      removeItem(k) { delete this._d[k]; },
    },
    sessionStorage: {
      _d: {},
      getItem(k) { return this._d[k] ?? null; },
      setItem(k, v) { this._d[k] = String(v); },
      removeItem(k) { delete this._d[k]; },
    },
    navigator: { userAgent: "node" },
    location: { href: "http://localhost/", protocol: "http:" },
    HTMLElement: function () {},
  };
  sandbox.window = sandbox;
  sandbox.globalThis = sandbox;
  sandbox.self = sandbox;
  vm.createContext(sandbox);
  vm.runInContext(xlsxSrc, sandbox, { filename: "xlsx.bundle.js" });
  if (!sandbox.XLSX) throw new Error("XLSX not loaded");
  vm.runInContext(code, sandbox, { filename: "index-engine.js" });
  return sandbox;
}

function matrixFromXlsx(S, filePath) {
  const buf = fs.readFileSync(filePath);
  const wb = S.XLSX.read(buf, { type: "buffer", cellDates: true, raw: true });
  let bestName = wb.SheetNames[0], bestM = null, bestS = -1e9;
  for (const sn of wb.SheetNames) {
    const m = S.sheetToMatrix(wb.Sheets[sn]);
    const s = S.scoreSheet(m);
    if (s > bestS) {
      bestS = s;
      bestM = m;
      bestName = sn;
    }
  }
  if (!bestM || !bestM.length) throw new Error("empty sheet in " + path.basename(filePath));
  return { matrix: bestM, sheetName: bestName, fileName: path.basename(filePath) };
}

function countByCode(rows) {
  const m = {};
  for (const r of rows || []) {
    const c = r["Код"] || "(no-code)";
    m[c] = (m[c] || 0) + 1;
  }
  return m;
}

function anonymizedSamples(rows, n) {
  return (rows || []).slice(0, n).map((r) => ({
    code: r["Код"],
    status: r["Статус"],
    source: r["Источник"] ? String(r["Источник"]).slice(0, 80) : null,
    row: r["Строка"],
    problem: String(r["Проблема"] || "").slice(0, 60),
    hasEvidence: Array.isArray(r._evidence) && r._evidence.length > 0,
  }));
}

const S = loadEngine();
const files = fs.readdirSync(root).filter((f) => /\.xlsx$/i.test(f));
const osv60 = files.find((f) => /60/i.test(f) && /оборот|сальд|ведомост|осв/i.test(f));
const osv76 = files.find((f) => /76/i.test(f) && /ВА|ва/i.test(f));
const acts = files.filter((f) => /акт/i.test(f));
const sfLike = files.filter((f) => /реестр|счет[- ]?фактур|счёт[- ]?фактур|книга\s*(покуп|продаж)/i.test(f) || (/ндс/i.test(f) && !/76/i.test(f)));

const report = {
  when: new Date().toISOString(),
  filesFound: files,
  picked: { osv60, osv76, acts, sfLike },
  osv: null,
  acts: null,
  nds: null,
  flags: [],
  verdict: [],
};

console.log("Files:", files.join(" | "));

if (!osv60) {
  report.flags.push("NO_OSV60");
  report.verdict.push("Нет ОСВ 60 в корне");
} else {
  const raw60 = matrixFromXlsx(S, path.join(root, osv60));
  const data = S.parseOsv6062(raw60.matrix, raw60.fileName);
  let vatIndex = null;
  if (osv76) {
    const raw76 = matrixFromXlsx(S, path.join(root, osv76));
    const vatData = S.parseOsv6062(raw76.matrix, raw76.fileName);
    vatIndex = S.buildVatAdvanceIndex(vatData);
  }
  const diag = S.diagnose6062(data, { overdueDays: 30, vatIndex, minAdvance: 0 });
  const byIssues = countByCode(diag.issues);
  const byAdv = countByCode(diag.advanceNoSf);
  report.osv = {
    parse: {
      items: (data.items || []).length,
      mainAccount: data.mainAccount,
      hasContracts: !!data.hasContracts,
      hasSubaccounts: !!data.hasSubaccounts,
      hasInns: !!data.hasInns,
      hasDates: !!data.hasDates,
      hasStartBalances: !!data.hasStartBalances,
      hasTurnovers: !!data.hasTurnovers,
    },
    vatIndex: vatIndex ? { kind: vatIndex.kind, count: vatIndex.count } : null,
    datasetSufficiency: diag.datasetSufficiency,
    inputQuality: (diag.inputQuality || []).map((f) => f.id),
    settle: diag.settle,
    byCodeIssues: byIssues,
    byCodeAdvanceNoSf: byAdv,
    buckets: {
      issues: (diag.issues || []).length,
      advanceNoSf: (diag.advanceNoSf || []).length,
      vatNotRestored: (diag.vatNotRestored || []).length,
      overdue: (diag.overdue || []).length,
      arithmetic: (diag.arithmetic || []).length,
      inconclusive: (diag.inconclusive || []).length,
    },
    router: {
      applicable: (diag.router && diag.router.applicable) || [],
      deferred: ((diag.router && diag.router.deferred) || []).map((d) => d.code),
    },
    samples: {
      issues: anonymizedSamples(diag.issues, 10),
      advanceNoSf: anonymizedSamples(diag.advanceNoSf, 5),
    },
  };

  if (!data.hasContracts) report.verdict.push("ОСВ без договора → SETTLE-001 отложен, SETTLE-INC ок");
  if ((diag.advanceNoSf || []).length) {
    const evOk = diag.advanceNoSf.every((r) => r["Источник"] && r["Строка"] != null);
    report.verdict.push("VAT-ADV: " + diag.advanceNoSf.length + " (evidence " + (evOk ? "ok" : "gap") + ")");
    if (!evOk) report.flags.push("VAT_ADV_EVIDENCE_GAP");
  }
  if ((diag.settle.candidates || 0) > 0 && !data.hasContracts) report.flags.push("CANDIDATES_WITHOUT_CONTRACT");

  console.log("\n=== OSV ===");
  console.log(JSON.stringify(report.osv.parse));
  console.log("suf", diag.datasetSufficiency, "iq", report.osv.inputQuality.join(","));
  console.log("issues", byIssues, "advanceNoSf", byAdv);
  console.log("router deferred", report.osv.router.deferred.join(", ") || "—");
}

if (acts.length >= 2) {
  try {
    const pair = [acts[0], acts[acts.length > 2 ? 2 : 1]]; // prefer distinct-looking pair if 3
    const a = matrixFromXlsx(S, path.join(root, pair[0]));
    const b = matrixFromXlsx(S, path.join(root, pair[1]));
    const act1 = S.parseAct(a.matrix, 1, a.fileName, false);
    const act2 = S.parseAct(b.matrix, 2, b.fileName, false);
    const flags = { 1: true, 2: true, 3: true, 4: true };
    if (!act1.operations.length || !act2.operations.length) {
      throw new Error("0 operations: A=" + act1.operations.length + " B=" + act2.operations.length);
    }
    const comp = S.compareActs(act1, act2, flags);
    report.acts = {
      files: pair,
      opsA: act1.operations.length,
      opsB: act2.operations.length,
      warningsA: act1.warnings || [],
      warningsB: act2.warnings || [],
      notFound1: (comp.notFound1 || []).length,
      notFound2: (comp.notFound2 || []).length,
      methods: (comp.methodsSummary || []).map((m) => ({
        method: m.method,
        cnt1: m.act1Cnt,
        cnt2: m.act2Cnt,
      })),
    };
    report.verdict.push("ACT: " + act1.operations.length + "+" + act2.operations.length + " ops parsed");
    console.log("\n=== ACT ===");
    console.log(report.acts);
  } catch (e) {
    report.acts = { error: e.message };
    report.flags.push("ACT_ERROR:" + e.message);
    console.log("\n=== ACT ERROR ===", e.message);
  }
} else {
  report.acts = { skipped: true, reason: "need ≥2 act files" };
}

if (sfLike.length >= 2) {
  try {
    const a = matrixFromXlsx(S, path.join(root, sfLike[0]));
    const b = matrixFromXlsx(S, path.join(root, sfLike[1]));
    const sa = S.parseSfRegistry(a.matrix, a.fileName);
    const sb = S.parseSfRegistry(b.matrix, b.fileName);
    const comp = S.compareNds(sa, sb);
    report.nds = {
      files: [sfLike[0], sfLike[1]],
      rowsA: sa.rows.length,
      rowsB: sb.rows.length,
      sufficiency: comp.datasetSufficiency,
      applicable: (comp.router && comp.router.applicable) || [],
      deferred: ((comp.router && comp.router.deferred) || []).map((d) => d.code),
      counts: {
        ok: (comp.ok || []).length,
        sum: (comp.sumDiff || []).length,
        vat: (comp.ndsDiff || []).length,
        missA: (comp.missA || []).length,
        missB: (comp.missB || []).length,
        dupA: (comp.dupsA || []).length,
        dupB: (comp.dupsB || []).length,
      },
    };
    report.verdict.push("NDS live pair ok");
  } catch (e) {
    report.nds = { error: e.message };
    report.flags.push("NDS_ERROR:" + e.message);
  }
} else {
  report.nds = { skipped: true, reason: "нет пары реестров СФ в корне (положи файлы — перезапусти smoke)" };
  console.log("\n=== NDS skipped ===", report.nds.reason);
}

fs.mkdirSync(path.dirname(reportPath), { recursive: true });
fs.writeFileSync(reportPath, JSON.stringify(report, null, 2), "utf8");
console.log("\n=== VERDICT ===");
for (const v of report.verdict) console.log("-", v);
console.log("flags:", report.flags.join(" | ") || "none");
console.log("Report:", reportPath);
