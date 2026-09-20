const fs = require("fs");
const path = require("path");
const dir = path.join("C:", "Users", "cobra", "Desktop", "Папки РС", "Сверка актов 1 С");
let v2 = fs.readFileSync(path.join(dir, "SverkaFact _v2.html"), "utf8");
const v21 = fs.readFileSync(path.join(dir, "SverkaFact _v2.1.html"), "utf8");

function copyFn(src, name, dest) {
  const re = new RegExp(`function ${name}\\([\\s\\S]*?\\n\\}\\r?\\n(?=\\r?\\n|function |let |document\\.|const |\\/\\*)`);
  const m = src.match(re);
  if (!m) throw new Error("fn not in src: " + name);
  if (!re.test(dest)) throw new Error("fn not in dest: " + name);
  return dest.replace(re, m[0]);
}

// preferred widths block
v2 = v2.replace(
  /const preferred = \{[\s\S]*?\n  \};/,
  v21.match(/const preferred = \{[\s\S]*?\n  \};/)[0]
);

// writeSection empty merge fix - copy whole writeSection
v2 = copyFn(v21, "writeSection", v2);
v2 = copyFn(v21, "compareRegistries", v2);

// replace registry UI+export block from missBRows through btnRegXlsx handler end
const markA = "const missBRows = comp.missB.map";
const markB = "function parseOsv6062";
const i21a = v21.indexOf(markA);
const i21b = v21.indexOf(markB);
const i2a = v2.indexOf(markA);
const i2b = v2.indexOf(markB);
if (i21a < 0 || i21b < 0 || i2a < 0 || i2b < 0) throw new Error("markers " + [i21a,i21b,i2a,i2b]);
// include license assert if v2 had it before btnRegRun - leave as is
v2 = v2.slice(0, i2a) + v21.slice(i21a, i21b) + v2.slice(i2b);

fs.writeFileSync(path.join(dir, "SverkaFact _v2.html"), v2);
console.log("v2 synced registries");
