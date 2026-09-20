# Samples

Сгенерировано: `node avito/make-kb-samples.cjs`

| Файл | Модуль | Сценарий |
|------|--------|----------|
| osv-60-advance.xlsx | r6062 | Дт 60 у ВИННЕР ДЕМО, есть оплаты в периоде |
| osv-76va-advance.xlsx | r6062 | 76.ВА без ВИННЕРА → справочный «аванс без СФ» |
| act-a-demo.xlsx / act-b-demo.xlsx | acts | дата разная по Реализация 2; лишняя операция в B |
| sf-book-a.xlsx / sf-book-b.xlsx | nds | сумма/НДС разъехались; лишняя СФ в B |
| acq-terminal.xlsx / acq-bank.xlsx | acq | пачка + возврат, зачисление T+1 |

Пересобрать: `node avito/make-kb-samples.cjs`
