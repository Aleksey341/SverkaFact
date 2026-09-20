const fs = require("fs");
const p = "C:/Users/cobra/Desktop/Папки РС/Сверка актов 1 С/SverkaFact _v2.html";
const h = fs.readFileSync(p, "utf8");
const start = h.lastIndexOf("<script>");
const end = h.lastIndexOf("</script>");
new Function(h.slice(start + 8, end));
const checks = {
  price: h.includes("12 900"),
  gate: h.includes("gateAfterProRun"),
  openMode: h.includes("function openMode"),
  regGate: h.includes('hasModuleAccess("regs")'),
  osvGate: h.includes('hasModuleAccess("r6062")'),
  ndsGate: h.includes('hasModuleAccess("nds")'),
  acqGate: h.includes('hasModuleAccess("acq")'),
  demo: h.includes('data-demo="regs"'),
  free: h.includes("Бесплатно"),
  boot: h.includes('btnActivateKey").addEventListener'),
  xlsxHead: h.indexOf("btnActivateKey") > 2000,
  actsNoGate: !/getElementById\("btnRun"\)[\s\S]{0,200}hasModuleAccess/.test(h)
};
console.log(checks);
if (Object.values(checks).some((v) => !v)) process.exit(1);
console.log("OK");
