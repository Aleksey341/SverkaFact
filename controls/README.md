# CONTROL_REGISTRY_V1

Машиночитаемый реестр контролей SverkaFact.

- Источник правды: [`index.json`](index.json)
- В `index.html` — встроенная копия `CONTROL_REGISTRY` (для работы без сети / file://)
- Синхронизация и проверка: `node tools/verify-controls.cjs`
- Регрессия OSV: `node tools/verify-osv.cjs`
- Регрессия НДС: `node tools/verify-nds.cjs`

## Semantic status → UI

| status | Колонка «Статус» | «Важность» |
|--------|------------------|------------|
| ACCOUNTING_ERROR | ошибка учёта | ошибка |
| REVIEW | проверить | внимание |
| INSUFFICIENT_DATA | мало данных | справочно |
| PASS / DEFERRED / NOT_APPLICABLE | ок / отложено / не применимо | справочно |

## DATA_SUFFICIENCY_V1

Профиль evidence (`buildOsvEvidence`) → уровень набора данных и по каждому контролю:

`COMPLETE` · `PARTIAL` · `INSUFFICIENT` · `INVALID`

## CONTROL_ROUTER_V1 (модуль r6062)

`routeR6062Controls(evidence)` → `applicable` / `partial` / `deferred` / `notApplicable`.  
Доктор 60/62 показывает план в отчёте и не гоняет VAT/AGE/ARITH, если они отложены.

## CONTROL_ROUTER_V1 (модуль nds)

`routeNdsControls(evidence)` — то же для сверки реестров СФ.  
`compareNds` возвращает `router` + `datasetSufficiency` и не выдаёт отложенные коды (например `NDS-MULTI` без multi-rate колонок).

Ставки НДС: [`regulatory/vat-rates.json`](../regulatory/vat-rates.json) → встроенный `REGULATORY` / `getStandardVatRate`.

## Evidence в отчёте (UI / Excel)

Каждая строка контроля несёт:

- **Источник** — имя файла (ОСВ / 76.* / СФ A+B)
- **Строка** — номер строки в исходной выгрузке (для SETTLE-001 — две строки через `/`)
- `_evidence[]` — машинный пакет `{ source, row }` (в Excel не выгружается; для SETTLE есть колонка `Evidence`)
