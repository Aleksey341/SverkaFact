# regulatory/

Машиночитаемые ставки и даты для сверки (не копия НК РФ).

| Файл | Назначение |
|------|------------|
| `vat-rates.json` | Стандартные / пониженные ставки НДС по периодам |

В `index.html` встроена копия `REGULATORY` (для file://).

Синхронизация:

```bash
node tools/sync-embedded.cjs
node tools/verify-controls.cjs
node tools/verify-osv.cjs
```

Стандартная ставка с **01.01.2026 — 22%** (расчётная 22/122). До этой даты — 20% (20/120).
