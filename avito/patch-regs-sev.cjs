const fs = require("fs");
const dir = "C:/Users/cobra/Desktop/Папки РС/Сверка актов 1 С/";

function mustReplace(src, from, to, label) {
  const n = src.split(from).length - 1;
  if (n !== 1) throw new Error(label + ": " + n);
  return src.replace(from, to);
}

for (const file of ["SverkaFact _v2.html", "SverkaFact _v2.1.html"]) {
  let src = fs.readFileSync(dir + file, "utf8").replace(/\r\n/g, "\n");

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
    "regs return");

  src = mustReplace(src,
    `    const missBRows = comp.missB.map(r => ({ "Дата": fmtDate(r.date), "№": r.number, "Документ": r.doc, "Сумма": r.amount, "Контрагент": r.partner || "—", "Строка": r.sourceRow }));
    const missARows = comp.missA.map(r => ({ "Дата": fmtDate(r.date), "№": r.number, "Документ": r.doc, "Сумма": r.amount, "Контрагент": r.partner || "—", "Строка": r.sourceRow }));
    document.getElementById("reportReg").classList.remove("hidden");
    const kpiReg = renderKpi([
        [a.rows.length, "Строк в A"],
        [b.rows.length, "Строк в B"],
        [comp.matched.length, "Совпали"],
        [(comp.weakNum || []).length, "Только №"],
        [comp.missB.length, "Нет в B"],
        [comp.missA.length, "Нет в A"],
        [comp.sumDiff.length, "Σ отличается"],
        [comp.dateDiff.length, "Дата отличается"]
      ]);
    const fullReg = kpiReg +
      '<div class="reason-box">Сначала ищем пару по <b>номеру+сумме</b>, затем по номеру+дате. Блок «только по номеру» — на ручную проверку.</div>' +
      '<h3 class="section">Нет в B (есть в A)</h3>' + renderTable(missBRows, [], "Все документы A найдены в B") +
      '<h3 class="section">Нет в A (есть в B)</h3>' + renderTable(missARows, [], "Все документы B найдены в A") +`,
    `    const missBRows = comp.missB.map(r => withSeverity({ "Дата": fmtDate(r.date), "№": r.number, "Документ": r.doc, "Сумма": r.amount, "Контрагент": r.partner || "—", "Строка": r.sourceRow }, "warning"));
    const missARows = comp.missA.map(r => withSeverity({ "Дата": fmtDate(r.date), "№": r.number, "Документ": r.doc, "Сумма": r.amount, "Контрагент": r.partner || "—", "Строка": r.sourceRow }, "warning"));
    document.getElementById("reportReg").classList.remove("hidden");
    const kpiReg = renderKpi([
        [a.rows.length, "Строк в A"],
        [b.rows.length, "Строк в B"],
        [comp.matched.length, "Совпали"],
        [(comp.weakNum || []).length, "Только №"],
        [comp.missB.length, "Нет в B"],
        [comp.missA.length, "Нет в A"],
        [comp.sumDiff.length, "Σ отличается"],
        [comp.dateDiff.length, "Дата отличается"]
      ]);
    const regLegend = '<div class="legend" style="margin:0 0 12px">'
      + '<span><i class="sev sev-warning" style="margin-right:4px">внимание</i>нет пары / сумма / только №</span>'
      + '<span><i class="sev sev-info" style="margin-right:4px">справочно</i>даты разные</span></div>';
    const fullReg = kpiReg + regLegend +
      '<div class="reason-box">Сначала ищем пару по <b>номеру+сумме</b>, затем по номеру+дате. Блок «только по номеру» — на ручную проверку.</div>' +
      '<h3 class="section">Нет в B (есть в A)</h3>' + renderTable(missBRows, [], "Все документы A найдены в B") +
      '<h3 class="section">Нет в A (есть в B)</h3>' + renderTable(missARows, [], "Все документы B найдены в A") +`,
    "regs handler");

  fs.writeFileSync(dir + file, src.replace(/\n/g, "\r\n"), "utf8");
  console.log("OK", file);
}
