const fs = require("fs");
const path = require("path");
const file = path.join("C:", "Users", "cobra", "Desktop", "Папки РС", "Сверка актов 1 С", "SverkaFact _v2.1.html");
const h = fs.readFileSync(file, "utf8");
const s = h.slice(h.lastIndexOf("<script>") + 8, h.lastIndexOf("</script>"));
try { new Function(s); console.log("JS OK"); } catch (e) { console.log("FAIL", e.message); process.exit(1); }
for (const id of ["btnRegReset", "btnOsvReset", "btnNdsReset", "btnAcqReset"]) {
  const html = h.includes(`id="${id}"`);
  const show = h.includes(`${id}").classList.remove("hidden")`);
  const click = h.includes(`${id}").addEventListener`);
  console.log(id, { html, show, click });
}
