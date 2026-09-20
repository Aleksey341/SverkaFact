const fs = require("fs");
const path = require("path");
const dir = path.join("C:", "Users", "cobra", "Desktop", "Папки РС", "Сверка актов 1 С");
const v21 = fs.readFileSync(path.join(dir, "SverkaFact _v2.1.html"), "utf8");
const v2 = fs.readFileSync(path.join(dir, "SverkaFact _v2.html"), "utf8");
const startMark = "function isPlausibleMoney";
const endMark = 'document.getElementById("btnRun")';
const a = v21.indexOf(startMark);
const b = v21.indexOf(endMark);
if (a < 0 || b < 0) throw new Error("v21 markers");
let block = v21.slice(a, b);
block = block.replace(
  'if (!f1 || !f2) { showMsgIn("msgAcq", "Загрузите оба файла.", "err"); return; }\n  showMsgIn',
  'if (!f1 || !f2) { showMsgIn("msgAcq", "Загрузите оба файла.", "err"); return; }\n  try { assertLicenseOrThrow(); } catch (e) { showMsgIn("msgAcq", e.message, "err"); return; }\n  showMsgIn'
);
const oldStart = v2.indexOf("function sumAmountColumn");
const oldEnd = v2.indexOf(endMark);
if (oldStart < 0 || oldEnd < 0) throw new Error("v2 markers " + oldStart + " " + oldEnd);
fs.writeFileSync(path.join(dir, "SverkaFact _v2.html"), v2.slice(0, oldStart) + block + v2.slice(oldEnd));
console.log("v2 synced, has isPlausibleMoney", fs.readFileSync(path.join(dir, "SverkaFact _v2.html"), "utf8").includes("isPlausibleMoney"));
