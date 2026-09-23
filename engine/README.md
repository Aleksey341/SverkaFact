# engine/

Контрольное ядро SverkaFact (source of truth для registry-runtime).

| Файл | Содержание |
|------|------------|
| `01-control-result.js` | статусы, `CONTROL_RESULT_SCHEMA_V1`, `buildControlResults` |
| `02-evidence.js` | `buildOsvEvidence` / `buildNdsEvidence` / `attachEvidence` |
| `03-sufficiency.js` | `requires` + `requires_any`, sufficiency |
| `04-router.js` | `routeR6062Controls` / `routeNdsControls` |
| `05-match-confidence.js` | уверенность связи партнёров |
| `06-regulatory-vat.js` | ставки НДС / 20/120·22/122 |

Сборка в `index.html` (маркеры `SF_ENGINE_BEGIN` / `SF_ENGINE_END`):

```bash
node tools/build-engine.cjs
node tools/verify-controls.cjs
node tools/verify-osv.cjs
node tools/verify-nds.cjs
```

Парсеры, UI и модули ACT/OSV/NDS остаются в `index.html` до следующих итераций.
