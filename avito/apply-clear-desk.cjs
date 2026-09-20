/**
 * Дизайн «Ясный стол» — CSS + хаб для v2 и v2.1.
 */
const fs = require("fs");

const dir = "C:/Users/cobra/Desktop/Папки РС/Сверка актов 1 С/";

const FONT_LINKS = `  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@400;500;600;700&family=IBM+Plex+Serif:wght@600;700&display=swap" rel="stylesheet">
`;

const NEW_CSS = `    :root {
      --bg: #e8eef4;
      --bg-tint: #dfe8f0;
      --card: #fffefb;
      --surface: #f4f7fa;
      --surface-2: #eef3f7;
      --text: #1b2838;
      --muted: #4d5d6e;
      --line: #c9d4e0;
      --line-soft: #dde5ee;
      --accent: #0f5c5c;
      --accent-hover: #0a4848;
      --accent-soft: #e4f2f1;
      --free: #1b7a4e;
      --free-soft: #e8f6ee;
      --pro: #b86e00;
      --pro-soft: #fff6e8;
      --danger: #b42318;
      --danger-soft: #fef3f2;
      --warn: #a15c07;
      --warn-soft: #fff8eb;
      --info: #175cd3;
      --info-soft: #eff6ff;
      --shadow: 0 10px 28px rgba(27, 40, 56, .07);
      --shadow-sm: 0 4px 14px rgba(27, 40, 56, .05);
      --radius: 14px;
      --radius-sm: 10px;
      --font: "IBM Plex Sans", "Segoe UI", system-ui, sans-serif;
      --font-display: "IBM Plex Serif", "Times New Roman", serif;
      --m1: #80FF80;
      --m2: #FFFF80;
      --m3: #59A8B3;
      --m4: #C2C2C2;
      --m0: #FF8080;
    }
    * { box-sizing: border-box; }
    html { -webkit-text-size-adjust: 100%; }
    body {
      margin: 0;
      font-family: var(--font);
      font-size: 15px;
      color: var(--text);
      background:
        radial-gradient(900px 420px at 8% -8%, #d5e4ef 0%, transparent 55%),
        radial-gradient(700px 360px at 100% 0%, #d9ebe6 0%, transparent 48%),
        var(--bg);
      line-height: 1.45;
    }
    ::selection { background: #b8ddd9; color: var(--text); }
    :focus-visible {
      outline: 2px solid var(--accent);
      outline-offset: 2px;
    }
    button:focus:not(:focus-visible),
    a:focus:not(:focus-visible),
    input:focus:not(:focus-visible),
    select:focus:not(:focus-visible) { outline: none; }
    .wrap { max-width: 1160px; margin: 0 auto; padding: 24px 18px 64px; }
    .hero {
      background: var(--card);
      color: var(--text);
      border: 1px solid var(--line);
      border-radius: var(--radius);
      padding: 22px 26px;
      margin-bottom: 14px;
      box-shadow: var(--shadow-sm);
    }
    .hero h1 {
      margin: 0 0 6px;
      font-family: var(--font-display);
      font-size: 1.85rem;
      font-weight: 700;
      letter-spacing: -.02em;
      color: var(--accent);
    }
    .hero p { margin: 0; max-width: 54ch; color: var(--muted); font-size: 0.98rem; }
    .page { display: none; }
    .page.active { display: block; animation: deskIn .22s ease-out; }
    @keyframes deskIn {
      from { opacity: 0; transform: translateY(4px); }
      to { opacity: 1; transform: none; }
    }
    @media (prefers-reduced-motion: reduce) {
      .page.active { animation: none; }
      .hub-card { transition: none !important; }
    }
    .hub-lanes { display: grid; gap: 18px; }
    .hub-lane-title {
      margin: 0 0 10px;
      font-size: 0.78rem;
      font-weight: 700;
      letter-spacing: .06em;
      text-transform: uppercase;
      color: var(--muted);
    }
    .hub-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
      gap: 12px;
    }
    .hub-grid.hub-free { grid-template-columns: minmax(260px, 420px); }
    .hub-card {
      text-align: left;
      background: var(--card);
      border: 1px solid var(--line);
      border-radius: var(--radius);
      padding: 16px 16px 14px;
      cursor: default;
      box-shadow: var(--shadow-sm);
      transition: border-color .15s, box-shadow .15s, background .15s;
      width: 100%;
      color: inherit;
      font: inherit;
      display: flex;
      flex-direction: column;
      gap: 0;
      min-height: 100%;
    }
    .hub-card:hover {
      background: #fbfcfa;
      border-color: #a8c4c2;
      box-shadow: var(--shadow);
    }
    button.hub-card { cursor: pointer; }
    button.hub-card:hover { background: #f7fbfa; color: inherit; }
    .hub-card .ico { display: none; }
    .hub-card h3 {
      margin: 0 0 6px;
      font-size: 1.05rem;
      font-weight: 700;
      color: var(--text);
      letter-spacing: -.01em;
    }
    .hub-card p {
      margin: 0;
      color: var(--muted);
      font-size: 0.86rem;
      line-height: 1.45;
      font-weight: 500;
      flex: 1;
    }
    .hub-card .tag {
      display: inline-flex;
      align-items: center;
      margin-top: 10px;
      font-size: 11px;
      font-weight: 700;
      letter-spacing: .04em;
      text-transform: uppercase;
      color: var(--free);
      background: var(--free-soft);
      padding: 3px 8px;
      border-radius: 6px;
      width: fit-content;
    }
    .nav-back {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      margin-bottom: 14px;
      background: var(--card);
      color: var(--accent);
      border: 1px solid var(--line);
      border-radius: var(--radius-sm);
      padding: 8px 12px;
      font-weight: 600;
      font-size: 13px;
      cursor: pointer;
      box-shadow: var(--shadow-sm);
    }
    .nav-back:hover { background: var(--accent-soft); border-color: #9fc4c2; }
    .mode-title {
      margin: 0 0 4px;
      font-size: 1.35rem;
      font-weight: 700;
      color: var(--text);
      letter-spacing: -.015em;
    }
    .mode-sub { margin: 0 0 16px; color: var(--muted); font-size: 0.95rem; max-width: 62ch; }
    .sev {
      display: inline-block;
      padding: 2px 8px;
      border-radius: 6px;
      font-size: 11px;
      font-weight: 700;
      letter-spacing: 0.02em;
      white-space: nowrap;
    }
    .sev-error { background: var(--danger-soft); color: var(--danger); }
    .sev-warning { background: var(--warn-soft); color: var(--warn); }
    .sev-info { background: var(--info-soft); color: var(--info); }
    details.faq-box {
      margin: 12px 0 6px;
      border: 1px solid var(--line-soft);
      border-radius: var(--radius-sm);
      background: var(--surface);
      padding: 10px 14px;
      font-size: 13px;
      line-height: 1.45;
      color: var(--muted);
    }
    details.faq-box summary {
      cursor: pointer;
      font-weight: 650;
      color: var(--accent);
      list-style: none;
    }
    details.faq-box summary::-webkit-details-marker { display: none; }
    details.faq-box summary::before { content: "▸ "; color: var(--muted); }
    details.faq-box[open] summary::before { content: "▾ "; }
    details.faq-box ul { margin: 8px 0 2px; padding-left: 18px; }
    details.faq-box li { margin: 4px 0; }
    tr.sev-row-error { background: #fff8f7; }
    tr.sev-row-warning { background: #fffbf3; }
    tr.sev-row-info { background: #f7faff; }
    .reason-box {
      background: var(--accent-soft);
      border: 1px solid #c5ddd9;
      padding: 12px 14px;
      border-radius: var(--radius-sm);
      margin: 8px 0 14px;
      font-size: 14px;
      line-height: 1.45;
      color: var(--text);
    }
    .kpi-row {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(132px, 1fr));
      gap: 10px;
      margin: 0 0 14px;
    }
    .kpi {
      background: var(--card);
      border: 1px solid var(--line-soft);
      border-radius: var(--radius-sm);
      padding: 12px 14px;
      box-shadow: var(--shadow-sm);
    }
    .kpi .n { font-size: 1.35rem; font-weight: 700; color: var(--accent); font-variant-numeric: tabular-nums; }
    .kpi .l { font-size: 12px; color: var(--muted); margin-top: 2px; }
    .hub-card.pro-locked { border-style: solid; border-color: #e2d0b0; background: #fffcf7; }
    .hub-card.pro-locked:hover { border-color: #d4b888; background: #fffaf2; }
    .hub-card .price {
      display: block;
      margin-top: 10px;
      font-size: 0.95rem;
      font-weight: 700;
      color: var(--pro);
      font-variant-numeric: tabular-nums;
    }
    .hub-card .price.free { color: var(--free); }
    .hub-card .tag.lock { color: var(--pro); background: var(--pro-soft); }
    .hub-card .tag.open { color: var(--free); background: var(--free-soft); }
    .hub-actions { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 12px; }
    .hub-actions button { font-size: 13px; padding: 8px 14px; border-radius: var(--radius-sm); }
    .price-table { width: 100%; border-collapse: collapse; margin-top: 12px; font-size: 14px; }
    .price-table th, .price-table td { border: 1px solid var(--line-soft); padding: 8px 10px; text-align: left; }
    .price-table th { background: var(--surface-2); font-weight: 650; }
    .pro-banner {
      border: 1px solid #e2d0b0;
      background: var(--pro-soft);
      border-radius: var(--radius-sm);
      padding: 12px 14px;
      margin: 12px 0;
      font-size: 14px;
      line-height: 1.45;
    }
    .pro-banner b { color: var(--pro); }
    .blur-lock { filter: blur(2.5px); user-select: none; pointer-events: none; opacity: .55; }
    .license-bar {
      display: flex; flex-wrap: wrap; gap: 10px 16px; align-items: center; justify-content: space-between;
      background: var(--card); border: 1px solid var(--line); border-radius: var(--radius);
      padding: 12px 16px; margin-bottom: 14px; box-shadow: var(--shadow-sm);
    }
    .license-bar .status { font-size: 14px; line-height: 1.4; }
    .license-bar .status b { color: var(--accent); }
    .license-bar.ok { border-color: #9dceb2; background: var(--free-soft); }
    .license-bar.free { border-color: var(--line); background: var(--card); }
    .license-bar code {
      font-family: "IBM Plex Sans", Consolas, monospace;
      background: var(--surface-2);
      padding: 3px 8px; border-radius: 6px; font-size: 13px;
      font-variant-numeric: tabular-nums;
    }
    .license-actions { display: flex; flex-wrap: wrap; gap: 8px; align-items: center; }
    .license-actions input[type=text] {
      width: min(420px, 100%); border: 1px solid var(--line); border-radius: var(--radius-sm);
      padding: 9px 12px; font: inherit; font-family: "IBM Plex Sans", Consolas, monospace;
      background: #fff;
    }
    .license-panel { display: none; margin-top: 12px; padding-top: 12px; border-top: 1px solid var(--line-soft); width: 100%; }
    .license-panel.open { display: block; }
    .card {
      background: var(--card);
      border: 1px solid var(--line);
      border-radius: var(--radius);
      padding: 20px;
      margin-bottom: 14px;
      box-shadow: var(--shadow-sm);
    }
    .grid2 { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
    .file {
      border: 1.5px dashed #a9bfc8;
      border-radius: var(--radius-sm);
      padding: 16px;
      background: var(--surface);
      transition: border-color .15s, background .15s;
    }
    .file:hover { border-color: #7ea8a4; background: #f0f7f6; }
    label { display: block; font-weight: 650; margin-bottom: 8px; color: var(--text); }
    input[type=file], select, input[type=number], input[type=text] {
      width: 100%;
      border: 1px solid var(--line);
      border-radius: var(--radius-sm);
      padding: 10px 12px;
      background: #fff;
      font: inherit;
      color: var(--text);
    }
    .hint { color: var(--muted); font-size: 13px; line-height: 1.45; margin-top: 8px; }
    .opts {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 12px;
      margin-top: 14px;
    }
    .optbox {
      border: 1px solid var(--line-soft);
      border-radius: var(--radius-sm);
      padding: 12px 14px;
      background: var(--surface);
    }
    .optbox h3 { margin: 0 0 8px; font-size: 14px; font-weight: 650; }
    .checks { display: grid; gap: 6px; font-size: 14px; }
    .checks label { font-weight: 500; display: flex; gap: 8px; align-items: center; }
    .row { display: flex; gap: 10px; flex-wrap: wrap; align-items: center; margin-top: 14px; }
    button, .btn {
      border: 0;
      border-radius: var(--radius-sm);
      background: var(--accent);
      color: #fff;
      font-weight: 650;
      font-size: 14px;
      padding: 11px 16px;
      cursor: pointer;
      text-decoration: none;
      display: inline-block;
      font-family: inherit;
      transition: background .15s, box-shadow .15s;
    }
    button:hover, .btn:hover { background: var(--accent-hover); }
    button:disabled { background: #9aa8b8; cursor: default; }
    button.secondary {
      background: var(--surface-2);
      color: var(--text);
      border: 1px solid var(--line);
    }
    button.secondary:hover { background: #e4ebf2; }
    button.reset {
      background: var(--card);
      color: var(--accent);
      border: 1px solid var(--line);
    }
    button.reset:hover { background: var(--accent-soft); }
    .msg {
      display: none;
      margin-top: 12px;
      padding: 12px 14px;
      border-radius: var(--radius-sm);
      white-space: pre-wrap;
      line-height: 1.45;
    }
    .msg.info { display: block; background: var(--info-soft); color: var(--info); }
    .msg.ok { display: block; background: var(--free-soft); color: var(--free); }
    .msg.err { display: block; background: var(--danger-soft); color: var(--danger); }
    .kpis {
      display: grid;
      grid-template-columns: repeat(6, 1fr);
      gap: 10px;
    }
    .methods { display: grid; gap: 8px; margin-top: 14px; }
    .method {
      display: grid;
      grid-template-columns: 18px 1fr auto auto;
      gap: 10px;
      align-items: center;
      border: 1px solid var(--line-soft);
      border-radius: var(--radius-sm);
      padding: 10px 12px;
      background: var(--card);
    }
    .dot { width: 18px; height: 28px; border-radius: 6px; border: 1px solid #00000022; }
    .tabs { display: flex; gap: 6px; flex-wrap: wrap; margin: 0 0 12px; }
    .tab {
      background: var(--surface);
      color: var(--text);
      border: 1px solid var(--line);
      padding: 8px 12px;
      border-radius: 8px;
      font-weight: 600;
      font-size: 13px;
      font-family: inherit;
      cursor: pointer;
    }
    .tab.active { background: var(--accent); color: #fff; border-color: var(--accent); }
    .panel { display: none; }
    .panel.active { display: block; }
    .table-wrap {
      overflow: auto;
      max-height: 520px;
      border: 1px solid var(--line);
      border-radius: var(--radius-sm);
      background: #fff;
    }
    table.data {
      border-collapse: collapse;
      width: 100%;
      font-size: 13px;
      min-width: 980px;
      font-variant-numeric: tabular-nums;
    }
    table.data th, table.data td {
      border-bottom: 1px solid var(--line-soft);
      padding: 8px 10px;
      text-align: left;
      vertical-align: top;
    }
    table.data th {
      position: sticky;
      top: 0;
      background: var(--accent);
      color: #fff;
      z-index: 1;
      white-space: nowrap;
      font-weight: 650;
    }
    table.data tr:hover td { background: rgba(15, 92, 92, .04); }
    .num { text-align: right; white-space: nowrap; }
    .legend {
      display: flex;
      flex-wrap: wrap;
      gap: 10px 14px;
      margin: 0 0 12px;
      font-size: 13px;
      color: var(--muted);
      align-items: center;
    }
    .legend i {
      display: inline-block;
      width: 14px;
      height: 14px;
      border-radius: 3px;
      margin-right: 5px;
      vertical-align: -2px;
      border: 1px solid #00000018;
    }
    .hidden { display: none !important; }
    h2 { margin: 0 0 12px; font-size: 1.25rem; font-weight: 700; }
    h3.section {
      margin: 18px 0 8px;
      font-size: 0.95rem;
      font-weight: 700;
      color: var(--accent);
      letter-spacing: -.01em;
    }
    .empty-hint {
      border: 1.5px dashed var(--line);
      border-radius: var(--radius-sm);
      padding: 20px 18px;
      background: var(--surface);
      color: var(--muted);
      font-size: 14px;
      line-height: 1.5;
      margin: 8px 0 0;
    }
    @media (max-width: 900px) {
      .grid2, .opts, .kpis { grid-template-columns: 1fr 1fr; }
    }
    @media (max-width: 640px) {
      .grid2, .opts, .kpis { grid-template-columns: 1fr; }
      .hero h1 { font-size: 1.45rem; }
      .wrap { padding: 16px 12px 48px; }
    }
`;

function replaceStyle(src) {
  const start = src.indexOf("<style>");
  const end = src.indexOf("</style>");
  if (start < 0 || end < 0) throw new Error("style not found");
  return src.slice(0, start) + "<style>\n" + NEW_CSS + "  " + src.slice(end);
}

function ensureFonts(src) {
  if (src.includes("IBM+Plex+Sans")) return src;
  return src.replace("<title>", FONT_LINKS + "  <title>");
}

const HUB_V2 = `    <div id="page-hub" class="page page-hub active">
      <section class="card">
        <h2 class="mode-title">Что хотите проверить?</h2>
        <p class="mode-sub">Выберите задачу. Акты — без ограничений. PRO-модули можно один раз запустить в демо.</p>
        <div class="hub-lanes">
          <div class="hub-lane">
            <div class="hub-lane-title">Бесплатно</div>
            <div class="hub-grid hub-free" id="hubGridFree">
              <div class="hub-card" data-mode="acts" id="card-acts">
                <h3>Акты сверки</h3>
                <p>Два акта Excel или PDF: сопоставление операций, причины расхождений, Excel-отчёт.</p>
                <span class="price free">Бесплатно</span>
                <span class="tag open">FREE</span>
                <div class="hub-actions"><button type="button" data-open="acts">Открыть</button></div>
              </div>
            </div>
          </div>
          <div class="hub-lane">
            <div class="hub-lane-title">PRO</div>
            <div class="hub-grid" id="hubGrid">
              <div class="hub-card pro-locked" data-mode="regs" id="card-regs">
                <h3>Две базы / реестры</h3>
                <p>УТ ↔ БП и любые два Excel-реестра: нет в A/B, сумма, дата.</p>
                <span class="price">5 900 ₽/год</span>
                <span class="tag lock" data-tag>PRO</span>
                <div class="hub-actions">
                  <button type="button" data-open="regs">Открыть</button>
                  <button type="button" class="secondary" data-demo="regs">Демо</button>
                </div>
              </div>
              <div class="hub-card pro-locked" data-mode="r6062" id="card-r6062">
                <h3>Доктор 60/62</h3>
                <p>Развёрнутое сальдо, просрочка, дубли, авансы: Дт 60 ↔ 76.ВА и Кт 62 ↔ 76.АВ.</p>
                <span class="price">6 900 ₽/год</span>
                <span class="tag lock" data-tag>PRO</span>
                <div class="hub-actions">
                  <button type="button" data-open="r6062">Открыть</button>
                  <button type="button" class="secondary" data-demo="r6062">Демо</button>
                </div>
              </div>
              <div class="hub-card pro-locked" data-mode="nds" id="card-nds">
                <h3>Сверка НДС</h3>
                <p>СФ: ИНН/КПП, ставки, исправления, корр. СФ, дубли и причины.</p>
                <span class="price">7 900 ₽/год</span>
                <span class="tag lock" data-tag>PRO</span>
                <div class="hub-actions">
                  <button type="button" data-open="nds">Открыть</button>
                  <button type="button" class="secondary" data-demo="nds">Демо</button>
                </div>
              </div>
              <div class="hub-card pro-locked" data-mode="acq" id="card-acq">
                <h3>Эквайринг</h3>
                <p>Терминал ↔ банк: дата, сумма, комиссия, возвраты, дубли.</p>
                <span class="price">4 900 ₽/год</span>
                <span class="tag lock" data-tag>PRO</span>
                <div class="hub-actions">
                  <button type="button" data-open="acq">Открыть</button>
                  <button type="button" class="secondary" data-demo="acq">Демо</button>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="pro-banner" style="margin-top:16px">
          <b>Все PRO — 16 900 ₽/год</b> · 1 ПК. На 2 года — 28 900 ₽.<br>
          После оплаты: «Активировать PRO» → вставьте ключ. Один демо-запуск каждого модуля — бесплатно.
        </div>
      </section>
    </div>`;

const HERO_V2 = `    <section class="hero">
      <h1>СверкаФакт</h1>
      <p>Сверка актов и учёта на вашем компьютере. Файлы никуда не отправляются.</p>
    </section>`;

const HERO_V21 = `    <section class="hero">
      <h1>СверкаФакт</h1>
      <p>Тестовая сборка без лицензии. Сверка на вашем компьютере — файлы никуда не уходят.</p>
    </section>`;

const HUB_V21 = `    <div id="page-hub" class="page page-hub active">
      <section class="card">
        <h2 class="mode-title">Что хотите проверить?</h2>
        <p class="mode-sub">Выберите задачу. Это тестовая версия: все модули открыты без ключа.</p>
        <div class="hub-lanes">
          <div class="hub-lane">
            <div class="hub-lane-title">Модули</div>
            <div class="hub-grid">
              <button type="button" class="hub-card" data-mode="acts"><h3>Акты сверки</h3><p>Два акта Excel или PDF: сопоставление и причины расхождений.</p><span class="tag open">готово</span></button>
              <button type="button" class="hub-card" data-mode="regs"><h3>Две базы / реестры</h3><p>УТ ↔ БП или любые два Excel-реестра документов.</p><span class="tag open">готово</span></button>
              <button type="button" class="hub-card" data-mode="r6062"><h3>Доктор 60/62</h3><p>Сальдо, просрочка, дубли, авансы Дт 60 ↔ 76.ВА и Кт 62 ↔ 76.АВ.</p><span class="tag open">готово</span></button>
              <button type="button" class="hub-card" data-mode="nds"><h3>Сверка НДС</h3><p>СФ: ИНН/КПП, ставки, исправления, дубли и причины.</p><span class="tag open">готово</span></button>
              <button type="button" class="hub-card" data-mode="acq"><h3>Эквайринг</h3><p>Терминал ↔ банк: сумма, комиссия, возвраты, дубли.</p><span class="tag open">готово</span></button>
            </div>
          </div>
        </div>
      </section>
    </div>`;

function replaceBetween(src, startMarker, endMarker, replacement, label) {
  const a = src.indexOf(startMarker);
  const b = src.indexOf(endMarker, a + 1);
  if (a < 0 || b < 0) throw new Error("block " + label);
  return src.slice(0, a) + replacement + src.slice(b);
}

// --- v2 ---
{
  let src = fs.readFileSync(dir + "SverkaFact _v2.html", "utf8");
  src = ensureFonts(src);
  src = replaceStyle(src);
  src = replaceBetween(src, '    <section class="hero">', '    <section id="licenseBar"', HERO_V2 + "\n\n    ", "hero v2");
  src = replaceBetween(src, '    <div id="page-hub"', '    <div id="page-acts"', HUB_V2 + "\n\n    ", "hub v2");
  src = src
    .replace(/<tr><td>🧾 Акты сверки<\/td>/, "<tr><td>Акты сверки</td>")
    .replace(/<tr><td>🔄 Две базы \/ реестры<\/td>/, "<tr><td>Две базы / реестры</td>")
    .replace(/<tr><td>💰 Доктор 60\/62<\/td>/, "<tr><td>Доктор 60/62</td>")
    .replace(/<tr><td>🧮 Сверка НДС<\/td>/, "<tr><td>Сверка НДС</td>")
    .replace(/<tr><td>💳 Эквайринг<\/td>/, "<tr><td>Эквайринг</td>");
  // refreshHubCards may look for #hubGrid — acts moved to hubGridFree; keep id hubGrid on PRO grid. card-acts still exists.
  // Check if JS queries #hubGrid for all cards
  fs.writeFileSync(dir + "SverkaFact _v2.html", src, "utf8");
  console.log("OK v2");
}

// --- v2.1 ---
{
  let src = fs.readFileSync(dir + "SverkaFact _v2.1.html", "utf8");
  src = ensureFonts(src);
  src = replaceStyle(src);
  src = replaceBetween(src, '    <section class="hero">', '    <div id="page-hub"', HERO_V21 + "\n\n    ", "hero v21");
  src = replaceBetween(src, '    <div id="page-hub"', '    <div id="page-acts"', HUB_V21 + "\n\n    ", "hub v21");
  fs.writeFileSync(dir + "SverkaFact _v2.1.html", src, "utf8");
  console.log("OK v2.1");
}

console.log("design applied");
