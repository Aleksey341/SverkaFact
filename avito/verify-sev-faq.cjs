const fs = require("fs");
const path = require("path");
const { execFileSync } = require("child_process");

const dir = "C:/Users/cobra/Desktop/Папки РС/Сверка актов 1 С/";
const tmp = path.join(__dirname, ".syntax-tmp2");
fs.mkdirSync(tmp, { recursive: true });
let fail = 0;
const markers = [
  'row["Важность"]',
  'k === "Важность"',
  "Кратко: как читать результат",
  "Кратко: авансы и 76",
  "Кратко: сверка НДС",
  "Кратко: эквайринг",
  "Кратко: реестры УТ",
  "withSeverity(Object.assign({}, r), \"warning\")",
  "withSeverity(row, \"warning\")"
];

for (const f of ["SverkaFact _v2.html", "SverkaFact _v2.1.html"]) {
  const src = fs.readFileSync(dir + f, "utf8");
  console.log("===", f);
  for (const m of markers) {
    if (!src.includes(m)) { console.log(" MISS", m); fail++; }
  }
  // conflict: severity should not use Тип as badge key anymore in withSeverity
  if (/row\["Тип"\] = m\.label/.test(src)) { console.log(" BAD still Тип=label"); fail++; }
  const re = /<script(?![^>]*\bsrc=)[^>]*>([\s\S]*?)<\/script>/g;
  let i = 0, m;
  while ((m = re.exec(src))) {
    i++;
    const file = path.join(tmp, f.replace(/\W/g, "_") + i + ".js");
    fs.writeFileSync(file, m[1], "utf8");
    try {
      execFileSync(process.execPath, ["--check", file], { stdio: "pipe" });
      console.log(" script", i, "OK");
    } catch (e) {
      fail++;
      console.log(" script", i, "FAIL\n", String(e.stderr || e.message).slice(0, 1000));
    }
  }
}
console.log(fail ? "FAIL " + fail : "ALL OK");
process.exit(fail ? 1 : 0);
