/**
 * Patch ACT PDF parsing in index.html.
 *
 * Fixes reconciliation PDFs where:
 * 1) a portrait A4 page contains two party tables side by side;
 * 2) the real document number is printed on a row above "Операция №1";
 * 3) trailing digits after the document date (for example "Операция №1") must
 *    not become part of the year used for matching.
 *
 * Idempotent. Run from repository root:
 *   node tools/patch-acts-pdf.cjs
 */
const fs = require("fs");
const path = require("path");

const root = path.join(__dirname, "..");
const htmlPath = path.join(root, "index.html");
let html = fs.readFileSync(htmlPath, "utf8");
let changed = false;

const PDF_MARK = "ACT_PDF_DOC_HEADER_V1";
if (!html.includes(PDF_MARK)) {
  const oldSplit = `  const dual = pageWidth > 700;\n  const leftMax = dual ? pageWidth * 0.48 : pageWidth;\n  const leftWords = words.filter(w => w.x0 < leftMax);`;
  const newSplit = `  // ${PDF_MARK}: two-sided A4 acts have a second exact \"Дата\" header near the right half.\n  // pageWidth > 700 is not enough: portrait A4 is about 595 pt.\n  const firstPageDateHeaders = words\n    .filter(w => w.page === 1 && normalizeText(w.text).toLowerCase() === \"дата\")\n    .map(w => w.x0)\n    .sort((a, b) => a - b);\n  const hasTwoPartyTable = firstPageDateHeaders.length >= 2 &&\n    firstPageDateHeaders[1] - firstPageDateHeaders[0] > pageWidth * 0.25;\n  const leftMax = hasTwoPartyTable\n    ? Math.max(firstPageDateHeaders[1] - 2, pageWidth * 0.45)\n    : (pageWidth > 700 ? pageWidth * 0.48 : pageWidth);\n  const leftWords = words.filter(w => w.x0 < leftMax);`;
  if (!html.includes(oldSplit)) throw new Error("ACT PDF patch: split marker not found; index.html changed");
  html = html.replace(oldSplit, newSplit);

  const oldMatrix = `  const matrix = [[\"Дата\", \"Документ\", \"Дебет\", \"Кредит\"]];\n  for (const cl of clusters) {`;
  const newMatrix = `  const matrix = [[\"Дата\", \"Документ\", \"Дебет\", \"Кредит\"]];\n  let pendingPdfDoc = \"\";\n  for (const cl of clusters) {`;
  if (!html.includes(oldMatrix)) throw new Error("ACT PDF patch: matrix marker not found; index.html changed");
  html = html.replace(oldMatrix, newMatrix);

  const oldDoc = `    const doc = docParts.join(\" \").trim();\n    const lowAll = fixed.map(m => m.text).join(\" \").toLowerCase();\n\n    // итоги периода / подписи / текст внизу акта — не операции`;
  const newDoc = `    const doc = docParts.join(\" \").trim();\n    const fullLine = fixed.map(m => m.text).join(\" \").trim();\n    const lowAll = fullLine.toLowerCase();\n\n    // В актах Диадок/1С номер документа часто находится отдельной строкой\n    // непосредственно перед строкой операции. Не теряем эту строку: parseAct\n    // затем извлечёт реальный номер (226/228/2064), а не \"Операция №1\".\n    const isDocHeader = !amounts.length &&\n      /(?:^|\\s)(?:документ|накладн\\w*|упд|сч[её]т(?:-фактур\\w*)?)\\s*№/i.test(fullLine);\n    if (isDocHeader) {\n      pendingPdfDoc = fullLine;\n      continue;\n    }\n\n    // итоги периода / подписи / текст внизу акта — не операции`;
  if (!html.includes(oldDoc)) throw new Error("ACT PDF patch: document marker not found; index.html changed");
  html = html.replace(oldDoc, newDoc);

  const oldPush = `    if (!dateTok) continue;\n    if (!amounts.length) continue;\n    if (!doc) continue;\n\n    matrix.push([dateTok.text, doc, debit, credit]);`;
  const newPush = `    if (!dateTok) continue;\n    if (!amounts.length) continue;\n    if (!doc && !pendingPdfDoc) continue;\n\n    const effectiveDoc = pendingPdfDoc\n      ? collapseSpaces(pendingPdfDoc + \" \" + doc)\n      : doc;\n    pendingPdfDoc = \"\";\n    matrix.push([dateTok.text, effectiveDoc, debit, credit]);`;
  if (!html.includes(oldPush)) throw new Error("ACT PDF patch: operation marker not found; index.html changed");
  html = html.replace(oldPush, newPush);
  changed = true;
}

const DATE_MARK = "ACT_DOC_DATE_TOKEN_V1";
if (!html.includes(DATE_MARK)) {
  const oldDate = `  const pozOt = ostatok.toLowerCase().indexOf(\" от \");\n  if (pozOt >= 0) {\n    const after = ostatok.slice(pozOt + 4);\n    let digits = \"\";\n    for (const ch of after) if (/\\d/.test(ch)) digits += ch;\n    if (digits.length >= 6) {\n      const dd = digits.slice(0, 2);\n      const mm = digits.slice(2, 4);\n      const yy = digits.slice(4);\n      const yNum = yy.length === 2 ? 2000 + Number(yy) : Number(yy);\n      const d = new Date(Date.UTC(yNum, Number(mm) - 1, Number(dd)));\n      if (!Number.isNaN(d.getTime())) dateFromOper = d;\n    }\n  }`;
  const newDate = `  // ${DATE_MARK}: берём только первый токен даты после « от ».\n  // Иначе хвост вроде «Операция №1» превращал 2026 в 20261.\n  const pozOt = ostatok.toLowerCase().indexOf(\" от \");\n  if (pozOt >= 0) {\n    const after = ostatok.slice(pozOt + 4);\n    const md = after.match(/^(\\d{1,2})[.\\-/](\\d{1,2})[.\\-/](\\d{2,4})(?!\\d)/);\n    if (md) {\n      let yNum = Number(md[3]);\n      if (yNum < 100) yNum += 2000;\n      const d = new Date(Date.UTC(yNum, Number(md[2]) - 1, Number(md[1])));\n      if (!Number.isNaN(d.getTime())) dateFromOper = d;\n    }\n  }`;
  if (!html.includes(oldDate)) throw new Error("ACT date patch: date extraction marker not found; index.html changed");
  html = html.replace(oldDate, newDate);
  changed = true;
}

if (changed) {
  fs.writeFileSync(htmlPath, html, "utf8");
  console.log("ACT reconciliation patches applied to index.html");
} else {
  console.log("ACT reconciliation patches already applied");
}
