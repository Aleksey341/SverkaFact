# CONTROL_REGISTRY_V1

Машиночитаемый реестр контролей SverkaFact.

- Источник правды: [`index.json`](index.json)
- В `index.html` — встроенная копия `CONTROL_REGISTRY` (для работы без сети / file://)
- Синхронизация и проверка: `node tools/verify-controls.cjs`

## Semantic status → UI

| status | Колонка «Статус» | «Важность» |
|--------|------------------|------------|
| ACCOUNTING_ERROR | ошибка учёта | ошибка |
| REVIEW | проверить | внимание |
| INSUFFICIENT_DATA | мало данных | справочно |
| PASS / DEFERRED / NOT_APPLICABLE | ок / отложено / не применимо | справочно |

Алгоритмы проверок не меняются: registry задаёт метаданные и статус по умолчанию для кода.
