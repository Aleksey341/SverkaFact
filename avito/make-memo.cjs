const { Document, Packer, Paragraph, TextRun, Header, Footer, AlignmentType,
        HeadingLevel, BorderStyle, PageNumber, LevelFormat } = require("docx");
const fs = require("fs");
const path = require("path");

const outPath = path.join(
  "C:", "Users", "cobra", "Desktop", "Папки РС", "Сверка актов 1 С",
  "Памятка_СверкаФакт_для_клиента.docx"
);

const accent = "1F4E79";
const muted = "5B6B7C";

function h1(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_1,
    spacing: { before: 280, after: 120 },
    children: [new TextRun({ text, bold: true, color: accent, font: "Calibri", size: 28 })]
  });
}

function h2(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_2,
    spacing: { before: 220, after: 100 },
    children: [new TextRun({ text, bold: true, color: accent, font: "Calibri", size: 24 })]
  });
}

function p(text, opts = {}) {
  return new Paragraph({
    spacing: { after: 120, line: 276 },
    children: [new TextRun({
      text,
      font: "Calibri",
      size: 22,
      color: opts.muted ? muted : "1A2332",
      bold: !!opts.bold,
      italics: !!opts.italics
    })]
  });
}

function bullet(text) {
  return new Paragraph({
    numbering: { reference: "bullets", level: 0 },
    spacing: { after: 80, line: 276 },
    children: [new TextRun({ text, font: "Calibri", size: 22 })]
  });
}

function step(text) {
  return new Paragraph({
    numbering: { reference: "steps", level: 0 },
    spacing: { after: 90, line: 276 },
    children: [new TextRun({ text, font: "Calibri", size: 22 })]
  });
}

function note(text) {
  return new Paragraph({
    spacing: { before: 80, after: 140 },
    border: {
      left: { style: BorderStyle.SINGLE, size: 24, color: accent, space: 10 }
    },
    indent: { left: 120 },
    children: [new TextRun({ text, font: "Calibri", size: 20, color: muted, italics: true })]
  });
}

const doc = new Document({
  numbering: {
    config: [
      {
        reference: "steps",
        levels: [{
          level: 0,
          format: LevelFormat.DECIMAL,
          text: "%1.",
          alignment: AlignmentType.LEFT,
          style: { paragraph: { indent: { left: 360, hanging: 240 } } }
        }]
      },
      {
        reference: "bullets",
        levels: [{
          level: 0,
          format: LevelFormat.BULLET,
          text: "•",
          alignment: AlignmentType.LEFT,
          style: { paragraph: { indent: { left: 360, hanging: 240 } } }
        }]
      },
      {
        reference: "steps2",
        levels: [{
          level: 0,
          format: LevelFormat.DECIMAL,
          text: "%1.",
          alignment: AlignmentType.LEFT,
          style: { paragraph: { indent: { left: 360, hanging: 240 } } }
        }]
      },
      {
        reference: "steps3",
        levels: [{
          level: 0,
          format: LevelFormat.DECIMAL,
          text: "%1.",
          alignment: AlignmentType.LEFT,
          style: { paragraph: { indent: { left: 360, hanging: 240 } } }
        }]
      }
    ]
  },
  sections: [{
    properties: {
      page: {
        margin: { top: 850, bottom: 850, left: 1000, right: 1000 }
      }
    },
    headers: {
      default: new Header({
        children: [new Paragraph({
          children: [
            new TextRun({ text: "СверкаФакт", bold: true, color: accent, font: "Calibri", size: 18 }),
            new TextRun({ text: "  ·  памятка для пользователя", color: muted, font: "Calibri", size: 18 })
          ]
        })]
      })
    },
    footers: {
      default: new Footer({
        children: [new Paragraph({
          alignment: AlignmentType.CENTER,
          children: [
            new TextRun({ text: "Страница ", color: muted, font: "Calibri", size: 16 }),
            new TextRun({ children: [PageNumber.CURRENT], color: muted, font: "Calibri", size: 16 }),
            new TextRun({ text: " из ", color: muted, font: "Calibri", size: 16 }),
            new TextRun({ children: [PageNumber.TOTAL_PAGES], color: muted, font: "Calibri", size: 16 })
          ]
        })]
      })
    },
    children: [
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { after: 60 },
        children: [new TextRun({ text: "ПАМЯТКА", bold: true, color: accent, font: "Calibri", size: 36 })]
      }),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { after: 80 },
        children: [new TextRun({
          text: "Запуск и работа с программой «СверкаФакт»",
          bold: true, color: "1A2332", font: "Calibri", size: 28
        })]
      }),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { after: 240 },
        children: [new TextRun({
          text: "Автоматическая сверка актов взаиморасчётов",
          color: muted, font: "Calibri", size: 22, italics: true
        })]
      }),

      h1("1. Что это за программа"),
      p("СверкаФакт помогает бухгалтеру автоматически сравнить два акта взаиморасчётов (ваш и контрагента) и показать совпадения и расхождения."),
      bullet("Загружаете два файла актов (Excel или PDF)"),
      bullet("Программа сопоставляет операции по дате, номеру документа и сумме"),
      bullet("Получаете отчёт на экране и можете скачать его в Excel"),
      note("Обработка идёт только на вашем компьютере. Файлы актов в интернет не отправляются."),

      h1("2. Что нужно для работы"),
      bullet("Компьютер с Windows"),
      bullet("Браузер Google Chrome или Microsoft Edge"),
      bullet("Файл программы: SverkaFact.html (или SverkaFact_v1.html)"),
      bullet("Два акта сверки в формате .xlsx, .xls, .csv или .pdf"),
      note("Если акт в формате .xlsb — откройте его в Excel и сохраните как .xlsx. PDF должен быть с текстом (не просто скан-картинка без распознавания)."),

      h1("3. Как запустить"),
      new Paragraph({
        numbering: { reference: "steps", level: 0 },
        spacing: { after: 90, line: 276 },
        children: [new TextRun({ text: "Сохраните файл программы в удобную папку (например, на Рабочий стол).", font: "Calibri", size: 22 })]
      }),
      new Paragraph({
        numbering: { reference: "steps", level: 0 },
        spacing: { after: 90, line: 276 },
        children: [new TextRun({ text: "Дважды щёлкните по файлу — он откроется в браузере.", font: "Calibri", size: 22 })]
      }),
      new Paragraph({
        numbering: { reference: "steps", level: 0 },
        spacing: { after: 90, line: 276 },
        children: [new TextRun({ text: "Если Windows спросит, чем открыть файл — выберите Chrome или Edge.", font: "Calibri", size: 22 })]
      }),
      note("Для чтения Excel и PDF нужен интернет при первом запуске (подгружаются библиотеки). Сами акты остаются на вашем ПК."),

      h1("4. Работа с PDF"),
      p("Акты можно загружать в PDF так же, как Excel. Подходит акт из 1С, сохранённый в PDF с текстом."),
      bullet("Читаются операции: дата, документ, дебет, кредит"),
      bullet("Читаются сальдо начальное и конечное (строки «Сальдо…» или «Остаток на…»)"),
      bullet("Можно сверять PDF с Excel или два PDF между собой"),
      bullet("Если в акте две таблицы (ваш и контрагент), берётся левая"),
      note("PDF должен быть с текстом: текст выделяется мышью. Скан-картинка без распознавания не подойдёт — сохраните акт из 1С в PDF или Excel."),
      note("Если в PDF у начального сальдо нет суммы, в отчёте начальное и конечное могут совпасть (берётся найденная строка сальдо с суммой)."),

      h1("5. Методы поиска — зачем они нужны"),
      p("Программа ищет пары операций между Актом 1 и Актом 2. Методы — это разные правила сопоставления. Они применяются по порядку: сначала самый строгий, потом более мягкие."),
      p("Операция, уже сопоставленная более строгим методом, повторно не ищется. Поэтому зелёные совпадения надёжнее серых."),
      note("По умолчанию включены все 4 метода — так обычно и нужно. Отключайте метод только если понимаете, зачем."),

      h2("Метод 1 — Дата + Номер + Сумма (зелёный)"),
      p("Что сравнивает: дату операции (или дату из документа), номер документа и сумму."),
      p("Когда срабатывает: документ один и тот же в обоих актах, дата и сумма совпали."),
      p("Что это значит для бухгалтера: наиболее надёжное совпадение. Обычно это правильная пара."),
      p("Цвет в отчёте: зелёный."),

      h2("Метод 2 — Номер + Сумма (жёлтый)"),
      p("Что сравнивает: номер документа и сумму. Дата может отличаться."),
      p("Когда срабатывает: один номер и одна сумма, но даты в актах разные (например, дата проводки и дата документа)."),
      p("Что это значит: скорее всего та же операция, но даты записаны по-разному. Имеет смысл проверить."),
      p("Цвет в отчёте: жёлтый."),

      h2("Метод 3 — Дата + Сумма (бирюзовый)"),
      p("Что сравнивает: дату и сумму. Номер может отсутствовать или отличаться."),
      p("Когда срабатывает: в один день в обоих актах есть одинаковая сумма, но номера документов разные или не распознаны."),
      p("Что это значит: возможное совпадение по сумме в ту же дату. Проверьте вручную — совпадение может быть случайным."),
      p("Цвет в отчёте: бирюзовый."),

      h2("Метод 4 — только Сумма (серый)"),
      p("Что сравнивает: только сумму операции."),
      p("Когда срабатывает: в актах нашлась одинаковая сумма, но дата и номер не совпали."),
      p("Что это значит: самое «мягкое» правило. Полезно, когда номера документов оформлены по-разному. Требует ручной проверки."),
      p("Цвет в отчёте: серый."),

      h2("Не найдено (красный)"),
      p("Если ни один включённый метод не нашёл пару — строка красная. Это операции без соответствия в другом акте. Их смотрите на вкладке «Расхождения»."),

      h1("6. Как настраивать методы"),
      p("Настройки находятся в блоке «Методы поиска» перед кнопкой «Сверить акты»."),
      bullet("Галочка включена — метод используется при сверке"),
      bullet("Галочка снята — метод не применяется"),
      bullet("Должен быть включён хотя бы один метод"),

      h2("Рекомендации по настройке"),
      bullet("Обычная сверка: оставьте все 4 метода включёнными"),
      bullet("Нужны только точные совпадения: включите только метод 1 (Дата+Номер+Сумма)"),
      bullet("Номера документов часто разные, а суммы важны: оставьте 1, 2 и 4"),
      bullet("Много ложных совпадений по одной сумме: отключите метод 4"),
      note("После смены галочек нажмите «Сверить акты» ещё раз — результат пересчитается."),

      h2("Номер документа: из скобок / вне скобок"),
      p("В правой панели настроек можно выбрать, откуда брать номер:"),
      bullet("«номер из скобок» — для текстов вида «Приход (81820 от 22.07.2026)» берётся 81820"),
      bullet("«номер вне скобок» — номер ищется в тексте до скобок"),
      p("Настройка задаётся отдельно для Акта 1 и Акта 2. Если номера в актах не совпадают при сверке, попробуйте переключить этот параметр."),

      h1("7. Как сверить акты"),
      new Paragraph({
        numbering: { reference: "steps2", level: 0 },
        spacing: { after: 90, line: 276 },
        children: [new TextRun({ text: "В блоке «Акт 1» выберите первый файл акта.", font: "Calibri", size: 22 })]
      }),
      new Paragraph({
        numbering: { reference: "steps2", level: 0 },
        spacing: { after: 90, line: 276 },
        children: [new TextRun({ text: "В блоке «Акт 2» выберите второй файл акта.", font: "Calibri", size: 22 })]
      }),
      new Paragraph({
        numbering: { reference: "steps2", level: 0 },
        spacing: { after: 90, line: 276 },
        children: [new TextRun({ text: "Проверьте методы поиска (по умолчанию все включены).", font: "Calibri", size: 22 })]
      }),
      new Paragraph({
        numbering: { reference: "steps2", level: 0 },
        spacing: { after: 90, line: 276 },
        children: [new TextRun({ text: "При необходимости настройте «номер из скобок / вне скобок».", font: "Calibri", size: 22 })]
      }),
      new Paragraph({
        numbering: { reference: "steps2", level: 0 },
        spacing: { after: 90, line: 276 },
        children: [new TextRun({ text: "Нажмите «Сверить акты».", font: "Calibri", size: 22 })]
      }),
      new Paragraph({
        numbering: { reference: "steps2", level: 0 },
        spacing: { after: 90, line: 276 },
        children: [new TextRun({ text: "Дождитесь сообщения «Сверка выполнена» и изучите вкладки отчёта.", font: "Calibri", size: 22 })]
      }),
      new Paragraph({
        numbering: { reference: "steps2", level: 0 },
        spacing: { after: 90, line: 276 },
        children: [new TextRun({ text: "При необходимости нажмите «Скачать Excel-отчёт».", font: "Calibri", size: 22 })]
      }),
      new Paragraph({
        numbering: { reference: "steps2", level: 0 },
        spacing: { after: 90, line: 276 },
        children: [new TextRun({ text: "Чтобы начать заново — нажмите «Новая сверка».", font: "Calibri", size: 22 })]
      }),

      h1("8. Как читать результат"),
      h2("Цвета строк (и легенда в Excel)"),
      bullet("Зелёный — метод 1: дата + номер + сумма"),
      bullet("Жёлтый — метод 2: номер + сумма"),
      bullet("Бирюзовый — метод 3: дата + сумма"),
      bullet("Серый — метод 4: только сумма"),
      bullet("Красный — пара не найдена"),
      note("В Excel на листах «Акт 1» и «Акт 2» легенда цветов находится сверху таблицы."),

      h2("Вкладки отчёта"),
      bullet("Сводка — периоды сверки, сальдо и обороты"),
      bullet("Акт 1 / Акт 2 — все операции с раскраской по методу"),
      bullet("Расхождения — операции без пары в другом акте"),
      bullet("Разные суммы/даты — частичные совпадения (номер есть, дата или сумма отличается)"),
      bullet("Дубликаты — повторы даты/номера внутри одного акта"),

      h1("9. Пробный период и лицензия"),
      p("В версии с лицензией при первом открытии начинается пробный период — 7 дней."),
      p("После окончания пробного периода сверка блокируется до активации ключа."),
      h2("Как активировать ключ на 2 года"),
      new Paragraph({
        numbering: { reference: "steps3", level: 0 },
        spacing: { after: 90, line: 276 },
        children: [new TextRun({ text: "В верхней панели нажмите «Код ПК» — код скопируется.", font: "Calibri", size: 22 })]
      }),
      new Paragraph({
        numbering: { reference: "steps3", level: 0 },
        spacing: { after: 90, line: 276 },
        children: [new TextRun({ text: "После оплаты отправьте продавцу этот код ПК.", font: "Calibri", size: 22 })]
      }),
      new Paragraph({
        numbering: { reference: "steps3", level: 0 },
        spacing: { after: 90, line: 276 },
        children: [new TextRun({ text: "Получите ключ лицензии от продавца.", font: "Calibri", size: 22 })]
      }),
      new Paragraph({
        numbering: { reference: "steps3", level: 0 },
        spacing: { after: 90, line: 276 },
        children: [new TextRun({ text: "Нажмите «Активировать ключ», вставьте ключ и нажмите «Активировать».", font: "Calibri", size: 22 })]
      }),
      note("Лицензия действует 2 года и привязана к одному компьютеру. Версия SverkaFact_v1.html работает без ключей."),

      h1("10. Частые вопросы"),
      p("Почему в «Разные суммы/даты» написано «частичных расхождений нет»?", { bold: true }),
      p("Это нормально: значит нет «почти совпавших» пар. Смотрите вкладку «Расхождения» — там операции без пары."),
      p("Что значит «Расхождений с актом № … нет»?", { bold: true }),
      p("Все операции этого акта нашли пару в другом акте."),
      p("На листе две таблицы — какую берёт программа?", { bold: true }),
      p("Если на одном листе два контрагента рядом, программа берёт левую таблицу."),
      p("Что делать, если акты не читаются?", { bold: true }),
      bullet("Для Excel: колонки Дата / Документ / Дебет / Кредит (или Долг / Долг)"),
      bullet("Для PDF: текст должен выделяться мышью (не «картинка»-скан без OCR)"),
      bullet("Можно сохранить акт из 1С сразу в PDF или Excel (.xlsx)"),
      bullet("Проверьте, что в акте есть строки с датой и суммой"),
      p("Можно ли сверять PDF с Excel?", { bold: true }),
      p("Да. Один акт может быть в PDF, второй — в Excel (или оба в PDF)."),
      p("Почему в PDF пустое сальдо?", { bold: true }),
      p("Проверьте, что в PDF есть строки «Сальдо начальное/конечное» или «Остаток на …» с суммами. Обороты программа считает сама по операциям; сальдо берётся из этих строк."),
      p("Можно ли переносить программу на другой компьютер?", { bold: true }),
      p("Файл можно скопировать. В лицензионной версии ключ привязан к коду ПК — на новом компьютере нужен новый ключ."),

      h1("11. Краткая шпаргалка"),
      bullet("Открыть программу в Chrome / Edge"),
      bullet("Загрузить Акт 1 и Акт 2 (Excel или PDF)"),
      bullet("При необходимости настроить методы 1–4"),
      bullet("Нажать «Сверить акты»"),
      bullet("Смотреть цвета: зелёный — точнее, серый — слабее, красный — нет пары"),
      bullet("Проверить блок «Сальдо и обороты»"),
      bullet("Скачать Excel-отчёт при необходимости"),

      new Paragraph({ spacing: { before: 280 }, children: [] }),
      p("Желаем удобной работы!", { italics: true }),
      p("При вопросах по запуску напишите продавцу — поможем с первым стартом.", { muted: true })
    ]
  }]
});

Packer.toBuffer(doc).then(buf => {
  fs.writeFileSync(outPath, buf);
  console.log("Saved:", outPath);
});
