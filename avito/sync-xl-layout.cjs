const fs = require("fs");
const path = require("path");
const dir = path.join("C:", "Users", "cobra", "Desktop", "Папки РС", "Сверка актов 1 С");
let v2 = fs.readFileSync(path.join(dir, "SverkaFact _v2.html"), "utf8");
const v21 = fs.readFileSync(path.join(dir, "SverkaFact _v2.1.html"), "utf8");

function copyBlock(src, dest, startRe, endRe, label) {
  const s = src.search(startRe);
  const e = src.search(endRe);
  if (s < 0 || e < 0 || e <= s) throw new Error("block " + label + " " + s + " " + e);
  const ds = dest.search(startRe);
  const de = dest.search(endRe);
  if (ds < 0 || de < 0 || de <= ds) throw new Error("dest block " + label);
  return dest.slice(0, ds) + src.slice(s, e) + dest.slice(de);
}

v2 = copyBlock(v21, v2, /function finishSheet\(/, /function writeSection\(/, "finish");
v2 = copyBlock(v21, v2, /function writeSection\(/, /function buildReportSheet\(/, "writeSec+title");
v2 = copyBlock(v21, v2, /function buildReportSheet\(/, /function writeColorLegend\(/, "report");
v2 = copyBlock(v21, v2, /function writeColorLegend\(/, /function buildMultiSectionSheet\(/, "legend+data");

fs.writeFileSync(path.join(dir, "SverkaFact _v2.html"), v2);
for (const f of ["SverkaFact _v2.1.html", "SverkaFact _v2.html"]) {
  const h = fs.readFileSync(path.join(dir, f), "utf8");
  const sc = h.slice(h.lastIndexOf("<script>") + 8, h.lastIndexOf("</script>"));
  try { new Function(sc); console.log(f, "OK", h.includes("без искусственного растягивания")); }
  catch (e) { console.log(f, "FAIL", e.message); process.exit(1); }
}
