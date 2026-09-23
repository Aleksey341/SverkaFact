# NDS regression samples

Обезличенные матрицы реестров СФ для `node tools/verify-nds.cjs`.

| Файл | Что проверяет |
|------|----------------|
| `ok-match.json` | Пара совпала → OK, без расхождений |
| `sum-diff.json` | NDS-SUM (+ evidence Источник/Строка) |
| `vat-diff.json` | NDS-VAT |
| `miss-b.json` | NDS-MISS-B (есть в A, нет в B) |
| `dup-a.json` | NDS-DUP в файле A |

Формат: `{ "a": { "fileName", "matrix" }, "b": { "fileName", "matrix" } }`.
