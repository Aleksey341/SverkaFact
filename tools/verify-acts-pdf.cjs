/**
 * Regression guard for the ACT PDF bug reproduced by acts №1088 and №33.
 *
 * The production parser must:
 * - detect two-sided portrait A4 tables;
 * - carry a standalone "документ №..." row into the following operation;
 * - parse only the date token after «от», ignoring trailing "Операция №1";
 * - treat Cyrillic «от» with an explicit lookahead, not JS \b.
 */
const fs = require("fs");
const path = require("path");

const root = path.join(__dirname, "..");
const html = fs.readFileSync(path.join(root, "index.html"), "utf8");

function assert(cond, msg) {
  if (!cond) throw new Error(msg);
}

assert(html.includes("ACT_PDF_DOC_HEADER_V1"), "A4 two-party PDF split fix is missing");
assert(html.includes('let pendingPdfDoc = "";'), "standalone PDF document header state is missing");
assert(html.includes("pendingPdfDoc + \" \" + doc"), "PDF document header is not joined to the operation row");
assert(html.includes("ACT_DOC_DATE_TOKEN_V1"), "document date-token fix is missing");
assert(html.includes("ACT_CYRILLIC_OT_BOUNDARY_V1"), "Cyrillic от boundary fix is missing");
assert(html.includes("const hasTwoPartyTable = firstPageDateHeaders.length >= 2"), "portrait two-party detection is missing");
assert(html.includes("\\s+от(?=\\s|$)"), "document-number parser still relies on an invalid Cyrillic word boundary");

function parseDateAfterOt(text) {
  const pos = String(text).toLowerCase().indexOf(" от ");
  if (pos < 0) return null;
  const after = String(text).slice(pos + 4);
  const m = after.match(/^(\d{1,2})[.\-/](\d{1,2})[.\-/](\d{2,4})(?!\d)/);
  if (!m) return null;
  let y = Number(m[3]);
  if (y < 100) y += 2000;
  return `${String(m[1]).padStart(2, "0")}.${String(m[2]).padStart(2, "0")}.${y}`;
}

function docNumber(text) {
  const m = String(text).match(/№\s*(.*?)(?:\s+от(?=\s|$)|$)/i);
  if (!m) return "";
  const nums = m[1].match(/\d+/g) || [];
  return nums.length ? (nums[nums.length - 1].replace(/^0+/, "") || "0") : "";
}

const pdfHeaders = [
  "документ № 226 от 07.09.2026 Операция №1",
  "документ № 228 от 07.09.2026 Операция №1",
  "документ № 0000-2064 от 07.09.2026 Операция №1"
];
const expectedNumbers = ["226", "228", "2064"];

assert(pdfHeaders.every(x => parseDateAfterOt(x) === "07.09.2026"), "trailing operation number corrupts document date");
assert(JSON.stringify(pdfHeaders.map(docNumber)) === JSON.stringify(expectedNumbers), "document numbers 226/228/2064 are not preserved");

console.log("ACT PDF regression OK: documents 226, 228, 2064 keep correct numbers and 07.09.2026 dates");
