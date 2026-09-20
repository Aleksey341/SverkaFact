const fs = require("fs");
const p = "C:/Users/cobra/Desktop/Папки РС/Сверка актов 1 С/SverkaFact _v2.1.html";
let src = fs.readFileSync(p, "utf8").replace(/\r\n/g, "\n");

function mustReplace(src, from, to, label) {
  const n = src.split(from).length - 1;
  if (n !== 1) throw new Error(label + ": " + n);
  return src.replace(from, to);
}

src = mustReplace(src,
  `  const missA = b.rows.filter((_, i) => !used.has(i));
  return { matched, weakNum, missB, missA, sumDiff, dateDiff };
}`,
  `  const missA = b.rows.filter((_, i) => !used.has(i));
  const sevW = (arr) => (arr || []).map(r => withSeverity(Object.assign({}, r), "warning"));
  const sevI = (arr) => (arr || []).map(r => withSeverity(Object.assign({}, r), "info"));
  return {
    matched,
    weakNum: sevW(weakNum),
    missB,
    missA,
    sumDiff: sevW(sumDiff),
    dateDiff: sevI(dateDiff)
  };
}`,
  "return");

src = mustReplace(src,
  `    const missBRows = comp.missB.map(r => ({ "Дата": fmtDate(r.date), "№": r.number, "Документ": r.doc, "Сумма": r.amount, "Контрагент": r.partner || "—", "Строка": r.sourceRow }));
    const missARows = comp.missA.map(r => ({ "Дата": fmtDate(r.date), "№": r.number, "Документ": r.doc, "Сумма": r.amount, "Контрагент": r.partner || "—", "Строка": r.sourceRow }));
    document.getElementById("reportReg").classList.remove("hidden");
    document.getElementById("btnRegXlsx").classList.remove("hidden");
    document.getElementById("btnRegReset").classList.remove("hidden");
    document.getElementById("panelsReg").innerHTML =
      renderKpi([
        [a.rows.length, "Строк в A"],
        [b.rows.length, "Строк в B"],
        [comp.matched.length, "Совпали"],
        [(comp.weakNum || []).length, "Только №"],
        [comp.missB.length, "Нет в B"],
        [comp.missA.length, "Нет в A"],
        [comp.sumDiff.length, "Σ отличается"],
        [comp.dateDiff.length, "Дата отличается"]
      ]) +
      '<div class="reason-box">Сначала ищем пару по <b>номеру+сумме</b>, затем по номеру+дате. Блок «только по номеру» — на ручную проверку.</div>' +`,
  `    const missBRows = comp.missB.map(r => withSeverity({ "Дата": fmtDate(r.date), "№": r.number, "Документ": r.doc, "Сумма": r.amount, "Контрагент": r.partner || "—", "Строка": r.sourceRow }, "warning"));
    const missARows = comp.missA.map(r => withSeverity({ "Дата": fmtDate(r.date), "№": r.number, "Документ": r.doc, "Сумма": r.amount, "Контрагент": r.partner || "—", "Строка": r.sourceRow }, "warning"));
    document.getElementById("reportReg").classList.remove("hidden");
    document.getElementById("btnRegXlsx").classList.remove("hidden");
    document.getElementById("btnRegReset").classList.remove("hidden");
    document.getElementById("panelsReg").innerHTML =
      renderKpi([
        [a.rows.length, "Строк в A"],
        [b.rows.length, "Строк в B"],
        [comp.matched.length, "Совпали"],
        [(comp.weakNum || []).length, "Только №"],
        [comp.missB.length, "Нет в B"],
        [comp.missA.length, "Нет в A"],
        [comp.sumDiff.length, "Σ отличается"],
        [comp.dateDiff.length, "Дата отличается"]
      ]) +
      '<div class="legend" style="margin:0 0 12px">'
      + '<span><i class="sev sev-warning" style="margin-right:4px">внимание</i>нет пары / сумма / только №</span>'
      + '<span><i class="sev sev-info" style="margin-right:4px">справочно</i>даты разные</span></div>' +
      '<div class="reason-box">Сначала ищем пару по <b>номеру+сумме</b>, затем по номеру+дате. Блок «только по номеру» — на ручную проверку.</div>' +`,
  "handler");

fs.writeFileSync(p, src.replace(/\n/g, "\r\n"), "utf8");
console.log("OK v2.1 regs");
