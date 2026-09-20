const fs = require("fs");
const path = require("path");
const { execFileSync } = require("child_process");

const dir = "C:/Users/cobra/Desktop/Папки РС/Сверка актов 1 С/";
const tmp = path.join(__dirname, ".syntax-tmp");
if (!fs.existsSync(tmp)) fs.mkdirSync(tmp);

const markers = [
  "function findOsvHeaderRow(matrix)",
  "function osvGroupHeaders(matrix, headerRow)",
  "function resolveOsvAmountCols(matrix, headerRow)",
  "function detectOsvMainAccount(matrix)",
  "function isOsvDocumentRow(name)",
  "function buildVatAdvanceIndex(vatData)",
  "function checkAdvanceVat(mainData, vatIndex, opts)",
  'osvMinAdvance',
  "ОСВ 76.ВА / 76.АВ или книга покупок",
  "Дт 60 ↔ 76.ВА",
  "vatNotRestored",
  "vatChecked: !!vatIndex"
];

let fail = 0;
for (const f of ["SverkaFact _v2.html", "SverkaFact _v2.1.html"]) {
  const src = fs.readFileSync(dir + f, "utf8");
  console.log("=== " + f);
  for (const m of markers) {
    const n = src.split(m).length - 1;
    if (n < 1) { console.log("  MISS | " + m); fail++; }
  }
  // синтаксис всех inline-скриптов
  const re = /<script(?![^>]*\bsrc=)[^>]*>([\s\S]*?)<\/script>/g;
  let i = 0, m2;
  while ((m2 = re.exec(src))) {
    i++;
    const file = path.join(tmp, "s" + i + ".js");
    fs.writeFileSync(file, m2[1], "utf8");
    try {
      execFileSync(process.execPath, ["--check", file], { stdio: "pipe" });
      console.log("  script #" + i + ": syntax OK (" + m2[1].length + " симв.)");
    } catch (e) {
      fail++;
      console.log("  script #" + i + ": SYNTAX ERROR\n" + String(e.stderr || e.message).slice(0, 1500));
    }
  }
  // старые ошибочные конструкции не должны остаться
  for (const bad of ['sfChecked: !!sfPartners', 'const headerRow = findHeaderRow(matrix) ?? 0;\r\n  const nameCol = findColSmart(matrix, headerRow, ["контрагент", "субконто"']) {
    if (src.includes(bad)) { console.log("  LEFTOVER | " + bad.slice(0, 50)); fail++; }
  }
}
console.log(fail ? "\nПРОВЕРКА: ошибок " + fail : "\nПРОВЕРКА: всё чисто");
process.exit(fail ? 1 : 0);
