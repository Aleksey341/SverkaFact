const fs = require("fs");
const path = require("path");
const file = path.join("C:", "Users", "cobra", "Desktop", "Папки РС", "Сверка актов 1 С", "SverkaFact _v2.html");
const h = fs.readFileSync(file, "utf8");
const start = h.indexOf("<script>");
const end = h.indexOf("</script>", start + 1);
console.log("first script ends at", end, "last at", h.lastIndexOf("</script>"));
console.log("early close?", end !== h.lastIndexOf("</script>"));
const s = h.slice(start + 8, end);
// binary search for error
let lo = 0, hi = s.length;
while (lo < hi - 1) {
  const mid = Math.floor((lo + hi) / 2);
  try {
    new Function(s.slice(0, mid));
    lo = mid;
  } catch {
    hi = mid;
  }
}
console.log("fail near", hi);
console.log(s.slice(Math.max(0, hi - 200), hi + 100));
