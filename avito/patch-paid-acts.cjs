/**
 * Убрать FREE: акты 8 000 ₽/год (продукт ACT), единый хаб, демо для актов.
 */
const fs = require("fs");
const dir = "C:/Users/cobra/Desktop/Папки РС/Сверка актов 1 С/";

const HUB_V2 = `    <div id="page-hub" class="page page-hub active">
      <section class="card hub-shell">
        <h2 class="mode-title">Модули сверки</h2>
        <p class="mode-sub">Каждый модуль — отдельный ключ или пакет «Все модули». Один демо-запуск на модуль.</p>
        <div class="hub-pack">
          <div class="hub-pack-main">
            <strong>Все модули</strong>
            <span>Акты, реестры, 60/62, НДС, эквайринг — один ключ на ПК</span>
          </div>
          <div class="hub-pack-price">16 900 ₽<small>/год</small></div>
        </div>
        <div class="hub-grid" id="hubGrid">
          <div class="hub-card pro-locked" data-mode="acts" id="card-acts">
            <h3>Акты сверки</h3>
            <p>Два акта Excel или PDF: сопоставление, причины расхождений, Excel-отчёт.</p>
            <span class="price">8 000 ₽/год</span>
            <span class="tag lock" data-tag>ключ</span>
            <div class="hub-actions">
              <button type="button" data-open="acts">Открыть</button>
              <button type="button" class="secondary" data-demo="acts">Демо</button>
            </div>
          </div>
          <div class="hub-card pro-locked" data-mode="regs" id="card-regs">
            <h3>Две базы / реестры</h3>
            <p>УТ ↔ БП и любые два Excel-реестра: нет в A/B, сумма, дата.</p>
            <span class="price">5 900 ₽/год</span>
            <span class="tag lock" data-tag>ключ</span>
            <div class="hub-actions">
              <button type="button" data-open="regs">Открыть</button>
              <button type="button" class="secondary" data-demo="regs">Демо</button>
            </div>
          </div>
          <div class="hub-card pro-locked" data-mode="r6062" id="card-r6062">
            <h3>Доктор 60/62</h3>
            <p>Развёрнутое сальдо, просрочка, дубли, авансы: Дт 60 ↔ 76.ВА и Кт 62 ↔ 76.АВ.</p>
            <span class="price">6 900 ₽/год</span>
            <span class="tag lock" data-tag>ключ</span>
            <div class="hub-actions">
              <button type="button" data-open="r6062">Открыть</button>
              <button type="button" class="secondary" data-demo="r6062">Демо</button>
            </div>
          </div>
          <div class="hub-card pro-locked" data-mode="nds" id="card-nds">
            <h3>Сверка НДС</h3>
            <p>СФ: ИНН/КПП, ставки, исправления, корр. СФ, дубли и причины.</p>
            <span class="price">7 900 ₽/год</span>
            <span class="tag lock" data-tag>ключ</span>
            <div class="hub-actions">
              <button type="button" data-open="nds">Открыть</button>
              <button type="button" class="secondary" data-demo="nds">Демо</button>
            </div>
          </div>
          <div class="hub-card pro-locked" data-mode="acq" id="card-acq">
            <h3>Эквайринг</h3>
            <p>Терминал ↔ банк: дата, сумма, комиссия, возвраты, дубли.</p>
            <span class="price">4 900 ₽/год</span>
            <span class="tag lock" data-tag>ключ</span>
            <div class="hub-actions">
              <button type="button" data-open="acq">Открыть</button>
              <button type="button" class="secondary" data-demo="acq">Демо</button>
            </div>
          </div>
        </div>
        <div class="pro-banner" style="margin-top:16px">
          После оплаты: «Активировать» → вставьте ключ. Тест всех модулей — ключ на 7 дней.
        </div>
      </section>
    </div>`;

const HUB_V21 = `    <div id="page-hub" class="page page-hub active">
      <section class="card hub-shell">
        <h2 class="mode-title">Модули сверки</h2>
        <p class="mode-sub">Тестовая сборка: все модули открыты без ключа. Цены — как в продаже.</p>
        <div class="hub-pack">
          <div class="hub-pack-main">
            <strong>Все модули</strong>
            <span>Пакет в продаже</span>
          </div>
          <div class="hub-pack-price">16 900 ₽<small>/год</small></div>
        </div>
        <div class="hub-grid">
          <button type="button" class="hub-card" data-mode="acts"><h3>Акты сверки</h3><p>Два акта Excel или PDF: сопоставление и причины расхождений.</p><span class="price">8 000 ₽/год</span><span class="tag open">тест</span></button>
          <button type="button" class="hub-card" data-mode="regs"><h3>Две базы / реестры</h3><p>УТ ↔ БП или любые два Excel-реестра.</p><span class="price">5 900 ₽/год</span><span class="tag open">тест</span></button>
          <button type="button" class="hub-card" data-mode="r6062"><h3>Доктор 60/62</h3><p>Сальдо, просрочка, дубли, авансы 60↔76.ВА / 62↔76.АВ.</p><span class="price">6 900 ₽/год</span><span class="tag open">тест</span></button>
          <button type="button" class="hub-card" data-mode="nds"><h3>Сверка НДС</h3><p>СФ: ИНН/КПП, ставки, исправления, дубли.</p><span class="price">7 900 ₽/год</span><span class="tag open">тест</span></button>
          <button type="button" class="hub-card" data-mode="acq"><h3>Эквайринг</h3><p>Терминал ↔ банк: сумма, комиссия, возвраты.</p><span class="price">4 900 ₽/год</span><span class="tag open">тест</span></button>
        </div>
      </section>
    </div>`;

const HUB_PACK_CSS = `
    .hub-shell .mode-title { margin-bottom: 6px; }
    .hub-pack {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      justify-content: space-between;
      gap: 12px 20px;
      margin: 0 0 18px;
      padding: 16px 18px;
      border-radius: var(--radius);
      border: 1px solid #9fc4c2;
      background: linear-gradient(135deg, #e4f2f1 0%, #f7fbfa 55%, #fffefb 100%);
      box-shadow: var(--shadow-sm);
    }
    .hub-pack-main { display: grid; gap: 4px; min-width: 200px; flex: 1; }
    .hub-pack-main strong { font-size: 1.05rem; color: var(--accent); }
    .hub-pack-main span { font-size: 0.88rem; color: var(--muted); }
    .hub-pack-price {
      font-size: 1.45rem;
      font-weight: 700;
      color: var(--accent);
      font-variant-numeric: tabular-nums;
      white-space: nowrap;
    }
    .hub-pack-price small { font-size: 0.75rem; font-weight: 600; color: var(--muted); margin-left: 2px; }
    .hub-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
      gap: 12px;
    }
`;

function mustReplace(src, from, to, label) {
  const n = src.split(from).length - 1;
  if (n !== 1) throw new Error(label + ": " + n);
  return src.replace(from, to);
}

function replaceBetween(src, startMarker, endMarker, replacement, label) {
  const a = src.indexOf(startMarker);
  const b = src.indexOf(endMarker, a + 1);
  if (a < 0 || b < 0) throw new Error("block " + label);
  return src.slice(0, a) + replacement + src.slice(b);
}

// ——— v2 ———
{
  let s = fs.readFileSync(dir + "SverkaFact _v2.html", "utf8");

  s = s.replace("<title>СверкаФакт — FREE + PRO</title>", "<title>СверкаФакт</title>");
  s = s.replace(
    "<p>Сверка актов и учёта на вашем компьютере. Файлы никуда не отправляются.</p>",
    "<p>Модули сверки на вашем компьютере. Файлы никуда не отправляются.</p>"
  );

  // CSS: remove hub-free, add pack; keep .hub-grid definition but inject pack after hub-lanes
  if (!s.includes(".hub-pack {")) {
    s = mustReplace(s,
      "    .hub-lanes { display: grid; gap: 18px; }\n",
      "    .hub-lanes { display: none; }\n" + HUB_PACK_CSS,
      "hub pack css");
  }
  s = s.replace(/\.hub-grid\.hub-free \{[^}]+\}\n/, "");

  s = replaceBetween(s, '    <div id="page-hub"', '    <div id="page-acts"', HUB_V2 + "\n\n    ", "hub");

  s = mustReplace(s,
    `      <div class="status" id="licenseStatus">СверкаФакт FREE — акты доступны без оплаты</div>
      <div class="license-actions">
        <button type="button" class="secondary" id="btnShowLicense" style="padding:8px 12px;font-size:13px">Активировать PRO</button>`,
    `      <div class="status" id="licenseStatus">Нет активного ключа — доступен демо-запуск модулей</div>
      <div class="license-actions">
        <button type="button" class="secondary" id="btnShowLicense" style="padding:8px 12px;font-size:13px">Активировать</button>`,
    "license bar");

  s = mustReplace(s,
    `          <tbody>
            <tr><td>Акты сверки</td><td><b>Бесплатно</b></td></tr>
            <tr><td>Две базы / реестры</td><td>5 900 ₽/год</td></tr>
            <tr><td>Доктор 60/62</td><td>6 900 ₽/год</td></tr>
            <tr><td>Сверка НДС</td><td>7 900 ₽/год</td></tr>
            <tr><td>Эквайринг</td><td>4 900 ₽/год</td></tr>
            <tr><td><b>Все PRO-модули</b></td><td><b>16 900 ₽/год</b></td></tr>
            <tr><td>Все PRO, 2 года</td><td>28 900 ₽</td></tr>
            <tr><td>Тест PRO (все модули)</td><td>ключ на 7 дней</td></tr>
          </tbody>`,
    `          <tbody>
            <tr><td>Акты сверки</td><td><b>8 000 ₽/год</b></td></tr>
            <tr><td>Две базы / реестры</td><td>5 900 ₽/год</td></tr>
            <tr><td>Доктор 60/62</td><td>6 900 ₽/год</td></tr>
            <tr><td>Сверка НДС</td><td>7 900 ₽/год</td></tr>
            <tr><td>Эквайринг</td><td>4 900 ₽/год</td></tr>
            <tr><td><b>Все модули</b></td><td><b>16 900 ₽/год</b></td></tr>
            <tr><td>Все модули, 2 года</td><td>28 900 ₽</td></tr>
            <tr><td>Тест (все модули)</td><td>ключ на 7 дней</td></tr>
          </tbody>`,
    "price table");

  s = mustReplace(s,
    `/* ========== FREE + PRO лицензия ========== */
const LICENSE_CFG = {
  SECRET: "SverkaPro-Avito-2026-K7mQ9xWp2nR4",
  STORE_DEVICE: "sverkafact_device_id",
  STORE_ENTS: "sverkafact_ents_v2",
  STORE_DEMO: "sverkafact_demo_v2",
  STORE_TRIAL: "sverkafact_trial_v2"
};

const MODULES = {
  acts: { product: "FREE", title: "Акты сверки", free: true },
  regs: { product: "REG", title: "Две базы / реестры", price: "5 900 ₽/год" },
  r6062: { product: "OSV", title: "Доктор 60/62", price: "6 900 ₽/год" },
  nds: { product: "NDS", title: "Сверка НДС", price: "7 900 ₽/год" },
  acq: { product: "ACQ", title: "Эквайринг", price: "4 900 ₽/год" }
};`,
    `/* ========== Лицензия модулей ========== */
const LICENSE_CFG = {
  SECRET: "SverkaPro-Avito-2026-K7mQ9xWp2nR4",
  STORE_DEVICE: "sverkafact_device_id",
  STORE_ENTS: "sverkafact_ents_v2",
  STORE_DEMO: "sverkafact_demo_v2",
  STORE_TRIAL: "sverkafact_trial_v2"
};

const MODULES = {
  acts: { product: "ACT", title: "Акты сверки", price: "8 000 ₽/год" },
  regs: { product: "REG", title: "Две базы / реестры", price: "5 900 ₽/год" },
  r6062: { product: "OSV", title: "Доктор 60/62", price: "6 900 ₽/год" },
  nds: { product: "NDS", title: "Сверка НДС", price: "7 900 ₽/год" },
  acq: { product: "ACQ", title: "Эквайринг", price: "4 900 ₽/год" }
};`,
    "MODULES");

  s = mustReplace(s,
    `  for (const mode of Object.keys(MODULES)) {
    if (MODULES[mode].free) continue;
    d[mode] = true;
  }`,
    `  for (const mode of Object.keys(MODULES)) {
    d[mode] = true;
  }`,
    "lock demos");

  s = mustReplace(s,
    `function hasModuleAccess(mode) {
  const m = MODULES[mode];
  if (!m || m.free) return true;
  if (isTrialExpiredLocked()) return false;
  return isEntitlementActive(m.product) || isEntitlementActive("PRO");
}`,
    `function hasModuleAccess(mode) {
  const m = MODULES[mode];
  if (!m) return false;
  if (isTrialExpiredLocked()) return false;
  return isEntitlementActive(m.product) || isEntitlementActive("PRO");
}`,
    "hasModuleAccess");

  s = mustReplace(s,
    `  const m = raw.match(/^SF-(PRO|REG|OSV|NDS|ACQ)-([A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4})-(\\d{8})-([A-Z0-9]{10})$/);`,
    `  const m = raw.match(/^SF-(PRO|ACT|REG|OSV|NDS|ACQ)-([A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4})-(\\d{8})-([A-Z0-9]{10})$/);`,
    "key regex");

  s = mustReplace(s,
    `  ["btnRegXlsx", "btnOsvXlsx", "btnNdsXlsx", "btnAcqXlsx"].forEach(id => {`,
    `  ["btnXlsx", "btnRegXlsx", "btnOsvXlsx", "btnNdsXlsx", "btnAcqXlsx"].forEach(id => {`,
    "hide excel");

  s = mustReplace(s,
    `  for (const [mode, meta] of Object.entries(MODULES)) {
    if (meta.free) continue;
    const card = document.getElementById("card-" + mode);
    if (!card) continue;
    const tag = card.querySelector("[data-tag]");
    const open = hasModuleAccess(mode);
    card.classList.toggle("pro-locked", !open);
    if (tag) {
      tag.className = "tag " + (open ? "open" : "lock");
      tag.textContent = open ? "PRO открыт" : "PRO";
    }`,
    `  for (const [mode] of Object.entries(MODULES)) {
    const card = document.getElementById("card-" + mode);
    if (!card) continue;
    const tag = card.querySelector("[data-tag]");
    const open = hasModuleAccess(mode);
    card.classList.toggle("pro-locked", !open);
    if (tag) {
      tag.className = "tag " + (open ? "open" : "lock");
      tag.textContent = open ? "открыт" : "ключ";
    }`,
    "refreshHub");

  s = mustReplace(s,
    `    status.innerHTML = "Тестовый период <b>закончился</b> (" + fmtDateLicense(parseYmd(trial.expiryYmd)) + "). Все PRO-модули и демо закрыты. Активируйте платный ключ.";
  } else {
    bar.className = "license-bar free";
    status.innerHTML = "СверкаФакт <b>FREE</b> — акты без оплаты. PRO-модули можно купить или запустить демо.";
  }`,
    `    status.innerHTML = "Тестовый период <b>закончился</b> (" + fmtDateLicense(parseYmd(trial.expiryYmd)) + "). Все модули и демо закрыты. Активируйте платный ключ.";
  } else {
    bar.className = "license-bar free";
    status.innerHTML = "Нет активного ключа. Можно купить модуль или запустить <b>демо</b> (один раз на модуль).";
  }`,
    "license status");

  s = mustReplace(s,
    `  if (mode === "acts" || hasModuleAccess(mode)) {
    window.__DEMO_MODE = null;
    showPage(mode);
    return;
  }
  if (isTrialExpiredLocked()) {
    alert("Тестовый период закончился. Все PRO-возможности закрыты.\\nАктивируйте платный ключ PRO.");
    document.getElementById("licensePanel").classList.add("open");
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
      div.innerHTML = "<b>Демо-режим</b>: один бесплатный запуск. После расчёта увидите итоги; строки и Excel — после активации модуля.";
      banner.after(div);
    }
    return;
  }
  alert("Модуль «" + MODULES[mode].title + "» — PRO (" + MODULES[mode].price + ").\\nМожно нажать «Демо» для одного пробного запуска или активировать ключ.");
  document.getElementById("licensePanel").classList.add("open");
}`,
    `  if (hasModuleAccess(mode)) {
    window.__DEMO_MODE = null;
    showPage(mode);
    return;
  }
  if (isTrialExpiredLocked()) {
    alert("Тестовый период закончился. Все модули закрыты.\\nАктивируйте платный ключ.");
    document.getElementById("licensePanel").classList.add("open");
    return;
  }
  if (asDemo) {
    if (!canUseDemo(mode)) {
      alert("Демо этого модуля уже использовано. Активируйте ключ для полного доступа.");
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
      div.innerHTML = "<b>Демо-режим</b>: один пробный запуск. После расчёта увидите итоги; строки и Excel — после активации модуля.";
      banner.after(div);
    }
    return;
  }
  alert("Модуль «" + MODULES[mode].title + "» — " + MODULES[mode].price + ".\\nМожно нажать «Демо» для одного пробного запуска или активировать ключ.");
  document.getElementById("licensePanel").classList.add("open");
}`,
    "openMode");

  s = mustReplace(s,
    `    const map = { regs: "btnRegXlsx", r6062: "btnOsvXlsx", nds: "btnNdsXlsx", acq: "btnAcqXlsx" };`,
    `    const map = { acts: "btnXlsx", regs: "btnRegXlsx", r6062: "btnOsvXlsx", nds: "btnNdsXlsx", acq: "btnAcqXlsx" };`,
    "demo map");

  // Gate btnRun for acts
  s = mustReplace(s,
    `document.getElementById("btnRun").addEventListener("click", async () => {
  const f1 = document.getElementById("act1").files[0];
  const f2 = document.getElementById("act2").files[0];
  const btn = document.getElementById("btnRun");
  if (!f1 || !f2) { showMsg("Загрузите оба акта.", "err"); return; }
  btn.disabled = true;
  showMsg("Читаю файлы и выполняю сверку…", "info");
  try {`,
    `document.getElementById("btnRun").addEventListener("click", async () => {
  if (!hasModuleAccess("acts") && window.__DEMO_MODE !== "acts") {
    showMsg(isTrialExpiredLocked()
      ? "Тестовый период закончился. Активируйте платный ключ."
      : "Модуль платный. Откройте «Демо» с главного экрана или активируйте ключ.", "err");
    return;
  }
  const f1 = document.getElementById("act1").files[0];
  const f2 = document.getElementById("act2").files[0];
  const btn = document.getElementById("btnRun");
  if (!f1 || !f2) { showMsg("Загрузите оба акта.", "err"); return; }
  btn.disabled = true;
  showMsg("Читаю файлы и выполняю сверку…", "info");
  try {`,
    "btnRun gate");

  s = mustReplace(s,
    `    const comp = compareActs(act1, act2, flags);
    LAST = { act1, act2, comp };

    document.getElementById("report").classList.remove("hidden");
    document.getElementById("btnXlsx").classList.remove("hidden");
    document.getElementById("btnReset").classList.remove("hidden");
    renderReport(act1, act2, comp);

    showMsg("Сверка выполнена.", "ok");`,
    `    const comp = compareActs(act1, act2, flags);
    LAST = { act1, act2, comp };

    document.getElementById("report").classList.remove("hidden");
    document.getElementById("btnReset").classList.remove("hidden");
    renderReport(act1, act2, comp);
    const panelsEl = document.getElementById("panels");
    const fullActs = panelsEl.innerHTML;
    const kpiActs = renderKpi([
      [act1.operations.length, "Операций 1"],
      [act2.operations.length, "Операций 2"],
      [(comp.notFound1 || []).length + (comp.notFound2 || []).length, "Без пары"],
      [(comp.reasons || []).length, "Пояснений"]
    ]);
    const demoActs = gateAfterProRun("acts", "panels", () => fullActs, kpiActs);
    if (!demoActs) document.getElementById("btnXlsx").classList.remove("hidden");
    else document.getElementById("btnXlsx").classList.add("hidden");

    showMsg(demoActs ? "Демо: итоги посчитаны. Строки скрыты." : "Сверка выполнена.", "ok");`,
    "acts demo gate");

  // placeholder key hint
  s = s.replace("Вставьте ключ (SF-PRO-… или модуль)", "Вставьте ключ (SF-PRO-… / SF-ACT-…)");

  fs.writeFileSync(dir + "SverkaFact _v2.html", s, "utf8");
  console.log("OK v2");
}

// ——— v2.1 hub ———
{
  let s = fs.readFileSync(dir + "SverkaFact _v2.1.html", "utf8");
  if (!s.includes(".hub-pack {")) {
    s = s.replace(
      "    .hub-lanes { display: grid; gap: 18px; }\n",
      "    .hub-lanes { display: none; }\n" + HUB_PACK_CSS
    );
  }
  s = s.replace(/\.hub-grid\.hub-free \{[^}]+\}\n/, "");
  s = replaceBetween(s, '    <div id="page-hub"', '    <div id="page-acts"', HUB_V21 + "\n\n    ", "hub v21");
  fs.writeFileSync(dir + "SverkaFact _v2.1.html", s, "utf8");
  console.log("OK v2.1");
}

// ——— KeyGen ———
{
  let s = fs.readFileSync(dir + "KeyGen_продавцу.html", "utf8");
  s = s.replace(
    `<select id="product">
        <option value="PRO" selected>Все PRO-модули — 16 900 ₽/год</option>
        <option value="REG">Две базы / реестры — 5 900 ₽/год</option>
        <option value="OSV">Доктор 60/62 — 6 900 ₽/год</option>
        <option value="NDS">Сверка НДС — 7 900 ₽/год</option>
        <option value="ACQ">Эквайринг — 4 900 ₽/год</option>
      </select>`,
    `<select id="product">
        <option value="PRO" selected>Все модули — 16 900 ₽/год</option>
        <option value="ACT">Акты сверки — 8 000 ₽/год</option>
        <option value="REG">Две базы / реестры — 5 900 ₽/год</option>
        <option value="OSV">Доктор 60/62 — 6 900 ₽/год</option>
        <option value="NDS">Сверка НДС — 7 900 ₽/год</option>
        <option value="ACQ">Эквайринг — 4 900 ₽/год</option>
      </select>`
  );
  s = s.replace(
    `const PRODUCT_LABEL = {
  PRO: "Все PRO",
  REG: "Реестры",
  OSV: "Доктор 60/62",
  NDS: "Сверка НДС",
  ACQ: "Эквайринг"
};`,
    `const PRODUCT_LABEL = {
  PRO: "Все модули",
  ACT: "Акты сверки",
  REG: "Реестры",
  OSV: "Доктор 60/62",
  NDS: "Сверка НДС",
  ACQ: "Эквайринг"
};`
  );
  s = s.replace(
    `        Акты сверки — бесплатно (ключ не нужен).<br>
        Для теста тестеру: продукт «Все PRO» + срок «7 дней».<br>
        После окончания 7 дней все PRO-модули и демо на этом ПК закрываются автоматически.<br>`,
    `        Акты сверки — 8 000 ₽/год (продукт ACT).<br>
        Для теста: продукт «Все модули» + срок «7 дней».<br>
        После окончания 7 дней все модули и демо на этом ПК закрываются автоматически.<br>`
  );
  s = s.replace(
    `<option value="7d">7 дней — тест всего PRO</option>`,
    `<option value="7d">7 дней — тест всех модулей</option>`
  );
  s = s.replace(
    `<option value="2y">2 года (PRO: 28 900 ₽)</option>`,
    `<option value="2y">2 года (все модули: 28 900 ₽)</option>`
  );
  fs.writeFileSync(dir + "KeyGen_продавцу.html", s, "utf8");
  console.log("OK KeyGen");
}

console.log("done");
