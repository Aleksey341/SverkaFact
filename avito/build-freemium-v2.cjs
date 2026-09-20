/**
 * Freemium FREE+PRO → SverkaFact _v2.html
 * База: чистая копия v2.1 (без лицензии).
 */
const fs = require("fs");
const path = require("path");

const file = path.join(
  "C:",
  "Users",
  "cobra",
  "Desktop",
  "Папки РС",
  "Сверка актов 1 С",
  "SverkaFact _v2.html"
);

let html = fs.readFileSync(file, "utf8").replace(/\r\n/g, "\n");

function mustReplace(label, search, repl) {
  if (typeof search === "string") {
    if (!html.includes(search)) throw new Error("NOT FOUND: " + label);
    html = html.replace(search, repl);
  } else {
    if (!search.test(html)) throw new Error("NOT FOUND (re): " + label);
    search.lastIndex = 0;
    html = html.replace(search, repl);
  }
}

mustReplace("title", /<title>[\s\S]*?<\/title>/, "<title>СверкаФакт — FREE + PRO</title>");

mustReplace(
  "subtitle",
  "Тестовая сборка v2.1 без лицензии. Универсальный бухгалтерский контролёр: акты, реестры, 60/62, НДС и эквайринг. Обработка на вашем ПК.",
  "Акты сверки — бесплатно. PRO-модули: реестры, 60/62, НДС, эквайринг. Обработка на вашем ПК — файлы никуда не отправляются."
);

const cssExtra = `
    .hub-card.pro-locked { position: relative; border-style: dashed; }
    .hub-card .price {
      display: block;
      margin-top: 8px;
      font-size: 15px;
      font-weight: 800;
      color: var(--accent);
    }
    .hub-card .price.free { color: #0f766e; }
    .hub-card .tag.lock { color: #92400e; background: #fff7ed; }
    .hub-card .tag.open { color: #0f766e; background: #e9f8ef; }
    .hub-actions { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 12px; }
    .hub-actions button { font-size: 13px; padding: 8px 12px; border-radius: 10px; }
    .price-table { width: 100%; border-collapse: collapse; margin-top: 12px; font-size: 14px; }
    .price-table th, .price-table td { border: 1px solid var(--line); padding: 8px 10px; text-align: left; }
    .price-table th { background: #eef5fb; }
    .pro-banner {
      border: 1px solid #f0c36d; background: #fffaf0; border-radius: 12px;
      padding: 12px 14px; margin: 12px 0; font-size: 14px; line-height: 1.45;
    }
    .pro-banner b { color: var(--accent); }
    .blur-lock { filter: blur(2.5px); user-select: none; pointer-events: none; opacity: .55; }
    .license-bar {
      display: flex; flex-wrap: wrap; gap: 10px 16px; align-items: center; justify-content: space-between;
      background: #fff; border: 1px solid var(--line); border-radius: 14px;
      padding: 12px 16px; margin-bottom: 16px; box-shadow: 0 6px 18px rgba(26, 35, 50, .04);
    }
    .license-bar .status { font-size: 14px; line-height: 1.4; }
    .license-bar .status b { color: var(--accent); }
    .license-bar.ok { border-color: #8fd4b0; background: #f2fbf6; }
    .license-bar.free { border-color: #9ec5e8; background: #f5f9fc; }
    .license-bar code {
      font-family: Consolas, "Courier New", monospace; background: #eef3f8;
      padding: 3px 8px; border-radius: 6px; font-size: 13px;
    }
    .license-actions { display: flex; flex-wrap: wrap; gap: 8px; align-items: center; }
    .license-actions input[type=text] {
      width: min(420px, 100%); border: 1px solid var(--line); border-radius: 10px;
      padding: 9px 12px; font: inherit; font-family: Consolas, "Courier New", monospace;
    }
    .license-panel { display: none; margin-top: 12px; padding-top: 12px; border-top: 1px dashed var(--line); width: 100%; }
    .license-panel.open { display: block; }
`;

mustReplace(
  "css",
  "    .kpi .l { font-size: 12px; color: var(--muted); margin-top: 2px; }",
  "    .kpi .l { font-size: 12px; color: var(--muted); margin-top: 2px; }" + cssExtra
);

const licenseBar = `
    <section id="licenseBar" class="license-bar free">
      <div class="status" id="licenseStatus">СверкаФакт FREE — акты доступны без оплаты</div>
      <div class="license-actions">
        <button type="button" class="secondary" id="btnShowLicense" style="padding:8px 12px;font-size:13px">Активировать PRO</button>
        <button type="button" class="reset" id="btnCopyMachine" style="padding:8px 12px;font-size:13px">Код ПК</button>
      </div>
      <div class="license-panel" id="licensePanel">
        <div class="hint" style="margin:0 0 8px">После оплаты пришлите продавцу <b>код ПК</b> — получите ключ на модуль или весь PRO. Ключ привязан к этому компьютеру.</div>
        <div class="row" style="margin:0">
          <input id="licenseKeyInput" type="text" placeholder="Вставьте ключ (SF-PRO-… или модуль)" autocomplete="off" spellcheck="false">
          <button type="button" id="btnActivateKey">Активировать</button>
        </div>
        <div class="hint" id="licenseHint" style="margin-top:8px"></div>
        <table class="price-table" id="priceTable">
          <thead><tr><th>Тариф</th><th>Цена</th></tr></thead>
          <tbody>
            <tr><td>🧾 Акты сверки</td><td><b>Бесплатно</b></td></tr>
            <tr><td>🔄 Две базы / реестры</td><td>4 900 ₽/год</td></tr>
            <tr><td>💰 Доктор 60/62</td><td>3 900 ₽/год</td></tr>
            <tr><td>🧮 Сверка НДС</td><td>5 900 ₽/год</td></tr>
            <tr><td>💳 Эквайринг</td><td>2 900 ₽/год</td></tr>
            <tr><td><b>Все PRO-модули</b></td><td><b>12 900 ₽/год</b></td></tr>
            <tr><td>Все PRO, 2 года</td><td>21 900 ₽</td></tr>
          </tbody>
        </table>
      </div>
    </section>
`;

mustReplace(
  "licenseBar",
  '<div id="page-hub" class="page page-hub active">',
  licenseBar + '\n    <div id="page-hub" class="page page-hub active">'
);

const newHub = `<div id="page-hub" class="page page-hub active">
      <section class="card">
        <h2 class="mode-title">Что хотите проверить?</h2>
        <p class="mode-sub">Акты сверки — бесплатно и без ограничений. Остальные модули — PRO (можно один демо-запуск каждого).</p>
        <div class="hub-grid" id="hubGrid">
          <div class="hub-card" data-mode="acts" id="card-acts">
            <div class="ico">🧾</div>
            <h3>Акты сверки</h3>
            <p>Excel/PDF, 4 метода, причины расхождений, Excel-отчёт.</p>
            <span class="price free">Бесплатно</span>
            <span class="tag open">FREE</span>
            <div class="hub-actions"><button type="button" data-open="acts">Открыть</button></div>
          </div>
          <div class="hub-card pro-locked" data-mode="regs" id="card-regs">
            <div class="ico">🔄</div>
            <h3>Две базы / реестры</h3>
            <p>УТ ↔ БП и любые два Excel-реестра: нет в A/B, сумма, дата.</p>
            <span class="price">4 900 ₽/год</span>
            <span class="tag lock" data-tag>🔒 PRO</span>
            <div class="hub-actions">
              <button type="button" data-open="regs">Открыть</button>
              <button type="button" class="secondary" data-demo="regs">Демо</button>
            </div>
          </div>
          <div class="hub-card pro-locked" data-mode="r6062" id="card-r6062">
            <div class="ico">💰</div>
            <h3>Доктор 60/62</h3>
            <p>Развёрнутое сальдо, аванс+долг, красное сальдо.</p>
            <span class="price">3 900 ₽/год</span>
            <span class="tag lock" data-tag>🔒 PRO</span>
            <div class="hub-actions">
              <button type="button" data-open="r6062">Открыть</button>
              <button type="button" class="secondary" data-demo="r6062">Демо</button>
            </div>
          </div>
          <div class="hub-card pro-locked" data-mode="nds" id="card-nds">
            <div class="ico">🧮</div>
            <h3>Сверка НДС</h3>
            <p>Счета-фактуры / книги: нет СФ, отличия суммы и НДС.</p>
            <span class="price">5 900 ₽/год</span>
            <span class="tag lock" data-tag>🔒 PRO</span>
            <div class="hub-actions">
              <button type="button" data-open="nds">Открыть</button>
              <button type="button" class="secondary" data-demo="nds">Демо</button>
            </div>
          </div>
          <div class="hub-card pro-locked" data-mode="acq" id="card-acq">
            <div class="ico">💳</div>
            <h3>Эквайринг</h3>
            <p>Терминал ↔ банк: продажи, комиссия, перечисление.</p>
            <span class="price">2 900 ₽/год</span>
            <span class="tag lock" data-tag>🔒 PRO</span>
            <div class="hub-actions">
              <button type="button" data-open="acq">Открыть</button>
              <button type="button" class="secondary" data-demo="acq">Демо</button>
            </div>
          </div>
        </div>
        <div class="pro-banner" style="margin-top:16px">
          <b>Все PRO-модули — 12 900 ₽/год</b> (стартовая цена). На 2 года — 21 900 ₽.<br>
          После оплаты нажмите «Активировать PRO» и вставьте ключ. Один демо-запуск каждого модуля доступен бесплатно.
        </div>
      </section>
    </div>`;

mustReplace(
  "hub",
  /<div id="page-hub" class="page page-hub active">[\s\S]*?<\/div>\s*\n\s*<div id="page-acts"/,
  newHub + '\n\n    <div id="page-acts"'
);

// License helpers WITHOUT showPage — showPage остаётся один, ниже патчим навигацию
const licenseJs = `
/* ========== FREE + PRO лицензия ========== */
const LICENSE_CFG = {
  SECRET: "SverkaPro-Avito-2026-K7mQ9xWp2nR4",
  STORE_DEVICE: "sverkafact_device_id",
  STORE_ENTS: "sverkafact_ents_v2",
  STORE_DEMO: "sverkafact_demo_v2"
};

const MODULES = {
  acts: { product: "FREE", title: "Акты сверки", free: true },
  regs: { product: "REG", title: "Две базы / реестры", price: "4 900 ₽/год" },
  r6062: { product: "OSV", title: "Доктор 60/62", price: "3 900 ₽/год" },
  nds: { product: "NDS", title: "Сверка НДС", price: "5 900 ₽/год" },
  acq: { product: "ACQ", title: "Эквайринг", price: "2 900 ₽/год" }
};

function toBase32(bytes) {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let bits = 0, value = 0, out = "";
  for (const b of bytes) {
    value = (value << 8) | b;
    bits += 8;
    while (bits >= 5) {
      out += alphabet[(value >>> (bits - 5)) & 31];
      bits -= 5;
    }
  }
  if (bits > 0) out += alphabet[(value << (5 - bits)) & 31];
  return out;
}
function formatDeviceId(raw) {
  const s = String(raw).replace(/[^A-Z0-9]/gi, "").toUpperCase();
  const parts = [];
  for (let i = 0; i < 12; i += 4) parts.push(s.slice(i, i + 4));
  return parts.join("-");
}
function normalizeDeviceId(s) {
  return String(s || "").replace(/[^A-Z0-9]/gi, "").toUpperCase().slice(0, 12);
}
async function sha256Hex(text) {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(text));
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, "0")).join("");
}
function ymdFromDate(d) {
  return d.getFullYear() + String(d.getMonth() + 1).padStart(2, "0") + String(d.getDate()).padStart(2, "0");
}
function parseYmd(ymd) {
  const s = String(ymd || "");
  if (!/^\\d{8}$/.test(s)) return null;
  const d = new Date(Number(s.slice(0, 4)), Number(s.slice(4, 6)) - 1, Number(s.slice(6, 8)));
  return Number.isNaN(d.getTime()) ? null : d;
}
function fmtDateLicense(d) {
  return String(d.getDate()).padStart(2, "0") + "." + String(d.getMonth() + 1).padStart(2, "0") + "." + d.getFullYear();
}
function getOrCreateDeviceId() {
  let id = localStorage.getItem(LICENSE_CFG.STORE_DEVICE);
  if (id && normalizeDeviceId(id).length === 12) {
    id = formatDeviceId(normalizeDeviceId(id));
    localStorage.setItem(LICENSE_CFG.STORE_DEVICE, id);
    return id;
  }
  const rnd = new Uint8Array(8);
  crypto.getRandomValues(rnd);
  id = formatDeviceId(toBase32(rnd).slice(0, 12));
  localStorage.setItem(LICENSE_CFG.STORE_DEVICE, id);
  return id;
}
async function makeSig(deviceId, expiryYmd, product) {
  const payload = normalizeDeviceId(deviceId) + "|" + expiryYmd + "|" + product + "|" + LICENSE_CFG.SECRET;
  return (await sha256Hex(payload)).slice(0, 10).toUpperCase();
}
async function makeSigLegacy(deviceId, expiryYmd) {
  const payload = normalizeDeviceId(deviceId) + "|" + expiryYmd + "|" + LICENSE_CFG.SECRET;
  return (await sha256Hex(payload)).slice(0, 10).toUpperCase();
}
function loadEntitlements() {
  try {
    const raw = JSON.parse(localStorage.getItem(LICENSE_CFG.STORE_ENTS) || "{}");
    return raw && typeof raw === "object" ? raw : {};
  } catch { return {}; }
}
function saveEntitlements(ents) {
  localStorage.setItem(LICENSE_CFG.STORE_ENTS, JSON.stringify(ents));
}
function loadDemo() {
  try { return JSON.parse(localStorage.getItem(LICENSE_CFG.STORE_DEMO) || "{}") || {}; }
  catch { return {}; }
}
function saveDemo(d) {
  localStorage.setItem(LICENSE_CFG.STORE_DEMO, JSON.stringify(d));
}
function isEntitlementActive(product) {
  const ents = loadEntitlements();
  const today = ymdFromDate(new Date());
  if (ents.PRO && ents.PRO >= today) return true;
  if (product === "PRO") return !!(ents.PRO && ents.PRO >= today);
  return !!(ents[product] && ents[product] >= today);
}
function hasModuleAccess(mode) {
  const m = MODULES[mode];
  if (!m || m.free) return true;
  return isEntitlementActive(m.product) || isEntitlementActive("PRO");
}
function canUseDemo(mode) {
  if (hasModuleAccess(mode)) return false;
  return !loadDemo()[mode];
}
function consumeDemo(mode) {
  const d = loadDemo();
  d[mode] = true;
  saveDemo(d);
}
async function validateAndParseKey(key, deviceId) {
  const raw = String(key || "").trim().toUpperCase().replace(/\\s+/g, "");
  const legacy = raw.match(/^SP-([A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4})-(\\d{8})-([A-Z0-9]{10})$/);
  if (legacy) {
    const dev = legacy[1], ymd = legacy[2], sig = legacy[3];
    if (normalizeDeviceId(dev) !== normalizeDeviceId(deviceId)) return { ok: false, error: "Ключ выдан для другого компьютера." };
    const exp = parseYmd(ymd);
    if (!exp || exp < new Date(new Date().toDateString())) return { ok: false, error: "Срок ключа истёк." };
    if (sig !== await makeSigLegacy(dev, ymd)) return { ok: false, error: "Неверный ключ." };
    return { ok: true, product: "PRO", expiryYmd: ymd, key: raw, legacy: true };
  }
  const m = raw.match(/^SF-(PRO|REG|OSV|NDS|ACQ)-([A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4})-(\\d{8})-([A-Z0-9]{10})$/);
  if (!m) return { ok: false, error: "Неверный формат ключа." };
  const product = m[1], dev = m[2], ymd = m[3], sig = m[4];
  if (normalizeDeviceId(dev) !== normalizeDeviceId(deviceId)) return { ok: false, error: "Ключ выдан для другого компьютера." };
  const exp = parseYmd(ymd);
  if (!exp || exp < new Date(new Date().toDateString())) return { ok: false, error: "Срок ключа истёк." };
  if (sig !== await makeSig(dev, ymd, product)) return { ok: false, error: "Неверный ключ." };
  return { ok: true, product, expiryYmd: ymd, key: raw };
}
function activateEntitlement(product, expiryYmd) {
  const ents = loadEntitlements();
  if (!ents[product] || expiryYmd > ents[product]) ents[product] = expiryYmd;
  saveEntitlements(ents);
}
function refreshHubCards() {
  for (const [mode, meta] of Object.entries(MODULES)) {
    if (meta.free) continue;
    const card = document.getElementById("card-" + mode);
    if (!card) continue;
    const tag = card.querySelector("[data-tag]");
    const open = hasModuleAccess(mode);
    card.classList.toggle("pro-locked", !open);
    if (tag) {
      tag.className = "tag " + (open ? "open" : "lock");
      tag.textContent = open ? "✓ PRO открыт" : "🔒 PRO";
    }
    const demoBtn = card.querySelector("[data-demo]");
    if (demoBtn) demoBtn.style.display = (!open && canUseDemo(mode)) ? "" : "none";
  }
}
function refreshLicenseUI() {
  const bar = document.getElementById("licenseBar");
  const status = document.getElementById("licenseStatus");
  const ents = loadEntitlements();
  const today = ymdFromDate(new Date());
  const active = Object.entries(ents).filter(([, y]) => y >= today);
  if (ents.PRO && ents.PRO >= today) {
    bar.className = "license-bar ok";
    status.innerHTML = "PRO активен до <b>" + fmtDateLicense(parseYmd(ents.PRO)) + "</b> · все модули открыты";
  } else if (active.length) {
    bar.className = "license-bar ok";
    status.innerHTML = "Активны модули: <b>" + active.map(([p, y]) => p + " до " + fmtDateLicense(parseYmd(y))).join(", ") + "</b>";
  } else {
    bar.className = "license-bar free";
    status.innerHTML = "СверкаФакт <b>FREE</b> — акты без оплаты. PRO-модули можно купить или запустить демо.";
  }
  refreshHubCards();
}
function openMode(mode, asDemo) {
  if (mode === "acts" || hasModuleAccess(mode)) {
    window.__DEMO_MODE = null;
    showPage(mode);
    return;
  }
  if (asDemo) {
    if (!canUseDemo(mode)) {
      alert("Демо этого модуля уже использовано. Активируйте PRO-ключ для полного доступа.");
      document.getElementById("licensePanel").classList.add("open");
      return;
    }
    window.__DEMO_MODE = mode;
    showPage(mode);
    const banner = document.querySelector("#page-" + mode + " .mode-sub");
    if (banner && !document.getElementById("demoBanner-" + mode)) {
      const div = document.createElement("div");
      div.id = "demoBanner-" + mode;
      div.className = "pro-banner";
      div.innerHTML = "🔒 <b>Демо-режим</b>: один бесплатный запуск. После расчёта увидите итоги; строки и Excel — после активации модуля.";
      banner.after(div);
    }
    return;
  }
  alert("Модуль «" + MODULES[mode].title + "» — PRO (" + MODULES[mode].price + ").\\nМожно нажать «Демо» для одного пробного запуска или активировать ключ.");
  document.getElementById("licensePanel").classList.add("open");
}
function gateAfterProRun(mode, panelsId, buildFullHtml, kpiHtml) {
  const isDemo = window.__DEMO_MODE === mode;
  const full = buildFullHtml();
  const el = document.getElementById(panelsId);
  if (!isDemo && hasModuleAccess(mode)) {
    el.innerHTML = full;
    window.__DEMO_MODE = null;
    return false;
  }
  if (isDemo) {
    consumeDemo(mode);
    el.dataset.fullHtml = full;
    el.innerHTML = kpiHtml +
      '<div class="pro-banner"><b>🔒 Демо завершено.</b> Итоги видны выше. Чтобы открыть строки и Excel — активируйте PRO.</div>' +
      '<div class="blur-lock" aria-hidden="true">' + full + '</div>';
    const map = { regs: "btnRegXlsx", r6062: "btnOsvXlsx", nds: "btnNdsXlsx", acq: "btnAcqXlsx" };
    const xb = document.getElementById(map[mode]);
    if (xb) xb.classList.add("hidden");
    window.__DEMO_MODE = null;
    refreshHubCards();
    return true;
  }
  el.innerHTML = full;
  return false;
}

`;

mustReplace(
  "licenseJs",
  "/* ========== V2: навигация и доп. режимы ========== */",
  licenseJs + "\n/* ========== V2: навигация и доп. режимы ========== */"
);

// Replace hub navigation: cards are no longer buttons with data-mode click
mustReplace(
  "nav handlers",
  `document.querySelectorAll(".hub-card[data-mode]").forEach(btn => {
  btn.addEventListener("click", () => showPage(btn.getAttribute("data-mode")));
});
document.querySelectorAll("[data-back]").forEach(btn => {
  btn.addEventListener("click", () => showPage("hub"));
});`,
  `document.querySelectorAll("[data-back]").forEach(btn => {
  btn.addEventListener("click", () => { window.__DEMO_MODE = null; showPage("hub"); refreshHubCards(); });
});
document.getElementById("hubGrid").addEventListener("click", (e) => {
  const openBtn = e.target.closest("[data-open]");
  const demoBtn = e.target.closest("[data-demo]");
  if (demoBtn) { openMode(demoBtn.getAttribute("data-demo"), true); return; }
  if (openBtn) { openMode(openBtn.getAttribute("data-open"), false); return; }
});`
);

function injectAccessGate(btnId, mode, msgId) {
  const marker = `document.getElementById("${btnId}").addEventListener("click", async () => {`;
  const idx = html.indexOf(marker);
  if (idx < 0) throw new Error("handler not found: " + btnId);
  const insertAt = idx + marker.length;
  const gate = `
  if (!hasModuleAccess("${mode}") && window.__DEMO_MODE !== "${mode}") {
    showMsgIn("${msgId}", "Модуль PRO. Откройте «Демо» с главного экрана или активируйте ключ.", "err");
    return;
  }`;
  html = html.slice(0, insertAt) + gate + html.slice(insertAt);
}

injectAccessGate("btnRegRun", "regs", "msgReg");
injectAccessGate("btnOsvRun", "r6062", "msgOsv");
injectAccessGate("btnNdsRun", "nds", "msgNds");
injectAccessGate("btnAcqRun", "acq", "msgAcq");

// --- Demo locks after render ---
mustReplace(
  "regs render",
  `document.getElementById("reportReg").classList.remove("hidden");
    document.getElementById("btnRegXlsx").classList.remove("hidden");
    document.getElementById("btnRegReset").classList.remove("hidden");
    document.getElementById("panelsReg").innerHTML =
      renderKpi([
        [a.rows.length, "Строк в A"],
        [b.rows.length, "Строк в B"],
        [comp.matched.length, "Совпали"],
        [(comp.weakNum || []).length, "Только №"],
        [comp.missB.length, "Нет в B"],
        [comp.missA.length, "Нет в A"],
        [comp.sumDiff.length, "Σ отличается"],
        [comp.dateDiff.length, "Дата отличается"]
      ]) +
      '<div class="reason-box">Сначала ищем пару по <b>номеру+сумме</b>, затем по номеру+дате. Блок «только по номеру» — на ручную проверку.</div>' +
      '<h3 class="section">Нет в B (есть в A)</h3>' + renderTable(missBRows, [], "Все документы A найдены в B") +
      '<h3 class="section">Нет в A (есть в B)</h3>' + renderTable(missARows, [], "Все документы B найдены в A") +
      '<h3 class="section">Отличается сумма</h3>' + renderTable(comp.sumDiff, [], "Нет") +
      '<h3 class="section">Отличается дата</h3>' + renderTable(comp.dateDiff, [], "Нет") +
      '<h3 class="section">Совпали только по номеру (проверить)</h3>' + renderTable(comp.weakNum || [], [], "Нет") +
      '<h3 class="section">Совпадения</h3>' + renderTable(comp.matched.slice(0, 500), [], "Нет совпадений");
    showMsgIn("msgReg", "Сверка реестров выполнена.", "ok");`,
  `document.getElementById("reportReg").classList.remove("hidden");
    const kpiReg = renderKpi([
        [a.rows.length, "Строк в A"],
        [b.rows.length, "Строк в B"],
        [comp.matched.length, "Совпали"],
        [(comp.weakNum || []).length, "Только №"],
        [comp.missB.length, "Нет в B"],
        [comp.missA.length, "Нет в A"],
        [comp.sumDiff.length, "Σ отличается"],
        [comp.dateDiff.length, "Дата отличается"]
      ]);
    const fullReg = kpiReg +
      '<div class="reason-box">Сначала ищем пару по <b>номеру+сумме</b>, затем по номеру+дате. Блок «только по номеру» — на ручную проверку.</div>' +
      '<h3 class="section">Нет в B (есть в A)</h3>' + renderTable(missBRows, [], "Все документы A найдены в B") +
      '<h3 class="section">Нет в A (есть в B)</h3>' + renderTable(missARows, [], "Все документы B найдены в A") +
      '<h3 class="section">Отличается сумма</h3>' + renderTable(comp.sumDiff, [], "Нет") +
      '<h3 class="section">Отличается дата</h3>' + renderTable(comp.dateDiff, [], "Нет") +
      '<h3 class="section">Совпали только по номеру (проверить)</h3>' + renderTable(comp.weakNum || [], [], "Нет") +
      '<h3 class="section">Совпадения</h3>' + renderTable(comp.matched.slice(0, 500), [], "Нет совпадений");
    const demoReg = gateAfterProRun("regs", "panelsReg", () => fullReg, kpiReg + '<div class="reason-box">Найдено расхождений (нет в A/B + Σ/дата): <b>' + (comp.missA.length + comp.missB.length + comp.sumDiff.length + comp.dateDiff.length) + '</b></div>');
    document.getElementById("btnRegReset").classList.remove("hidden");
    if (!demoReg) document.getElementById("btnRegXlsx").classList.remove("hidden");
    showMsgIn("msgReg", demoReg ? "Демо: итоги посчитаны. Строки скрыты." : "Сверка реестров выполнена.", "ok");`
);

mustReplace(
  "osv render",
  `document.getElementById("reportOsv").classList.remove("hidden");
    document.getElementById("btnOsvXlsx").classList.remove("hidden");
    document.getElementById("btnOsvReset").classList.remove("hidden");
    document.getElementById("panelsOsv").innerHTML =
      renderKpi([[data.items.length, "Строк аналитики"], [issues.length, "Замечаний"]]) +
      '<div class="reason-box">Обычная ОСВ может показать «ноль», когда внутри одновременно висят долг и аванс. Ниже — такие случаи.</div>' +
      '<h3 class="section">Найденные проблемы</h3>' + renderTable(issues, [], "Критических замечаний не найдено");
    showMsgIn("msgOsv", "Проверка 60/62 выполнена.", "ok");`,
  `document.getElementById("reportOsv").classList.remove("hidden");
    const kpiOsv = renderKpi([[data.items.length, "Строк аналитики"], [issues.length, "Замечаний"]]);
    const fullOsv = kpiOsv +
      '<div class="reason-box">Обычная ОСВ может показать «ноль», когда внутри одновременно висят долг и аванс. Ниже — такие случаи.</div>' +
      '<h3 class="section">Найденные проблемы</h3>' + renderTable(issues, [], "Критических замечаний не найдено");
    const demoOsv = gateAfterProRun("r6062", "panelsOsv", () => fullOsv, kpiOsv + '<div class="reason-box">Найдено проблем: <b>' + issues.length + '</b></div>');
    document.getElementById("btnOsvReset").classList.remove("hidden");
    if (!demoOsv) document.getElementById("btnOsvXlsx").classList.remove("hidden");
    showMsgIn("msgOsv", demoOsv ? "Демо: итоги посчитаны. Строки скрыты." : "Проверка 60/62 выполнена.", "ok");`
);

mustReplace(
  "nds render",
  `document.getElementById("reportNds").classList.remove("hidden");
    document.getElementById("btnNdsXlsx").classList.remove("hidden");
    document.getElementById("btnNdsReset").classList.remove("hidden");
    document.getElementById("panelsNds").innerHTML =
      renderKpi([[a.rows.length, "СФ в A"], [b.rows.length, "СФ в B"], [comp.ok.length, "OK"], [comp.missB.length, "Нет в B"], [comp.sumDiff.length + comp.ndsDiff.length, "Σ/НДС ≠"]]) +
      '<h3 class="section">Нет в B</h3>' + renderTable(mapMiss(comp.missB), [], "Нет") +
      '<h3 class="section">Нет в A</h3>' + renderTable(mapMiss(comp.missA), [], "Нет") +
      '<h3 class="section">Отличается стоимость</h3>' + renderTable(comp.sumDiff, [], "Нет") +
      '<h3 class="section">Отличается НДС</h3>' + renderTable(comp.ndsDiff, [], "Нет");
    showMsgIn("msgNds", "Сверка НДС выполнена.", "ok");`,
  `document.getElementById("reportNds").classList.remove("hidden");
    const kpiNds = renderKpi([[a.rows.length, "СФ в A"], [b.rows.length, "СФ в B"], [comp.ok.length, "OK"], [comp.missB.length, "Нет в B"], [comp.sumDiff.length + comp.ndsDiff.length, "Σ/НДС ≠"]]);
    const fullNds = kpiNds +
      '<h3 class="section">Нет в B</h3>' + renderTable(mapMiss(comp.missB), [], "Нет") +
      '<h3 class="section">Нет в A</h3>' + renderTable(mapMiss(comp.missA), [], "Нет") +
      '<h3 class="section">Отличается стоимость</h3>' + renderTable(comp.sumDiff, [], "Нет") +
      '<h3 class="section">Отличается НДС</h3>' + renderTable(comp.ndsDiff, [], "Нет");
    const demoNds = gateAfterProRun("nds", "panelsNds", () => fullNds, kpiNds + '<div class="reason-box">Проблемных позиций: <b>' + (comp.missA.length + comp.missB.length + comp.sumDiff.length + comp.ndsDiff.length) + '</b></div>');
    document.getElementById("btnNdsReset").classList.remove("hidden");
    if (!demoNds) document.getElementById("btnNdsXlsx").classList.remove("hidden");
    showMsgIn("msgNds", demoNds ? "Демо: итоги посчитаны. Строки скрыты." : "Сверка НДС выполнена.", "ok");`
);

mustReplace(
  "acq render",
  `document.getElementById("reportAcq").classList.remove("hidden");
    document.getElementById("btnAcqXlsx").classList.remove("hidden");
    document.getElementById("btnAcqReset").classList.remove("hidden");
    const hintFee = term.fees === 0
      ? '<div class="reason-box">Комиссия = 0: в файле терминала не найдена колонка «Комиссия» или она пустая. Ожидаемое перечисление = продажи.</div>'
      : "";
    document.getElementById("panelsAcq").innerHTML =
      renderKpi([[fmtMoney(term.sales), "Продажи"], [fmtMoney(term.fees), "Комиссия"], [fmtMoney(bankIn), "Банк"], [fmtMoney(diff), "Δ"]]) +
      hintFee +
      (Math.abs(diff) < 0.02
        ? '<div class="reason-box">Суммы сходятся: продажи − комиссия ≈ перечисление банка.</div>'
        : '<div class="reason-box">Есть расхождение. Проверьте незавершённые дни, возвраты и удержания банка. В выписке суммируются только поступления (кредит/зачисление), без остатков.</div>') +
      '<h3 class="section">Итоги</h3>' + renderTable(rows);
    showMsgIn("msgAcq", "Сверка эквайринга выполнена.", "ok");`,
  `document.getElementById("reportAcq").classList.remove("hidden");
    const hintFee = term.fees === 0
      ? '<div class="reason-box">Комиссия = 0: в файле терминала не найдена колонка «Комиссия» или она пустая. Ожидаемое перечисление = продажи.</div>'
      : "";
    const kpiAcq = renderKpi([[fmtMoney(term.sales), "Продажи"], [fmtMoney(term.fees), "Комиссия"], [fmtMoney(bankIn), "Банк"], [fmtMoney(diff), "Δ"]]);
    const fullAcq = kpiAcq + hintFee +
      (Math.abs(diff) < 0.02
        ? '<div class="reason-box">Суммы сходятся: продажи − комиссия ≈ перечисление банка.</div>'
        : '<div class="reason-box">Есть расхождение. Проверьте незавершённые дни, возвраты и удержания банка. В выписке суммируются только поступления (кредит/зачисление), без остатков.</div>') +
      '<h3 class="section">Итоги</h3>' + renderTable(rows);
    const demoAcq = gateAfterProRun("acq", "panelsAcq", () => fullAcq, kpiAcq + '<div class="reason-box">Расхождение: <b>' + fmtMoney(diff) + '</b></div>');
    document.getElementById("btnAcqReset").classList.remove("hidden");
    if (!demoAcq) document.getElementById("btnAcqXlsx").classList.remove("hidden");
    showMsgIn("msgAcq", demoAcq ? "Демо: итоги посчитаны. Детали скрыты." : "Сверка эквайринга выполнена.", "ok");`
);

const boot = `
document.getElementById("btnShowLicense").addEventListener("click", () => {
  document.getElementById("licensePanel").classList.toggle("open");
});
document.getElementById("btnCopyMachine").addEventListener("click", async () => {
  const id = getOrCreateDeviceId();
  try {
    await navigator.clipboard.writeText(id);
    document.getElementById("licenseHint").textContent = "Код ПК скопирован: " + id;
  } catch {
    document.getElementById("licenseHint").textContent = "Код ПК: " + id;
  }
});
document.getElementById("btnActivateKey").addEventListener("click", async () => {
  const hint = document.getElementById("licenseHint");
  const device = getOrCreateDeviceId();
  const check = await validateAndParseKey(document.getElementById("licenseKeyInput").value, device);
  if (!check.ok) { hint.textContent = check.error; return; }
  activateEntitlement(check.product, check.expiryYmd);
  document.getElementById("licenseKeyInput").value = "";
  hint.textContent = "Активировано: " + check.product + " до " + fmtDateLicense(parseYmd(check.expiryYmd));
  refreshLicenseUI();
});
getOrCreateDeviceId();
refreshLicenseUI();
`;

const lastScriptClose = html.lastIndexOf("</script>");
if (lastScriptClose < 0) throw new Error("no closing script");
if (html.includes('btnActivateKey").addEventListener')) {
  // already present — skip
} else {
  html = html.slice(0, lastScriptClose) + boot + "\n" + html.slice(lastScriptClose);
}

fs.writeFileSync(file, html.replace(/\n/g, "\r\n"), "utf8");

const h = fs.readFileSync(file, "utf8");
const mainStart = h.lastIndexOf("<script>");
const mainEnd = h.lastIndexOf("</script>");
const s = h.slice(mainStart + 8, mainEnd);
try {
  new Function(s);
  console.log("JS OK", fs.statSync(file).size);
} catch (e) {
  console.log("JS FAIL", e.message);
  process.exit(1);
}

const checks = {
  "12 900": h.includes("12 900"),
  "SF-PRO": h.includes("SF-(PRO"),
  gateAfterProRun: h.includes("gateAfterProRun"),
  openMode: h.includes("function openMode"),
  hasModuleAccess: h.includes('hasModuleAccess("regs")'),
  bootOk: h.includes('btnActivateKey").addEventListener') && !h.slice(0, 500).includes("btnActivateKey"),
  xlsxOk: /xlsx\.bundle\.js"><\/script>/.test(h) || /xlsx\.bundle\.js"\s*><\/script>/.test(h),
  pageHub: (h.match(/id="page-hub"/g) || []).length === 1,
  pageRegs: (h.match(/id="page-regs"/g) || []).length === 1,
  showPageOnce: (h.match(/function showPage/g) || []).length === 1
};
for (const [k, v] of Object.entries(checks)) console.log(k, v);
if (Object.values(checks).some((v) => !v)) process.exit(1);
