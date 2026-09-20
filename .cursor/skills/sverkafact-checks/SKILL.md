---
name: sverkafact-checks
description: >-
  Adds or fixes SverkaFact HTML checks (acts, 60/62 doctor, VAT, acquiring)
  using the project kb/ methodology. Use when editing SverkaFact _v2.html /
  _v2.1.html, OSV parsers, advance 60↔76.VA logic, freemium PRO modules, or
  when the user asks to add a reconciliation rule, explanation text, or sample.
---

# SverkaFact: проверки и БЗ

## Сначала прочитай

1. `kb/README.md` — слои (код / карточки / скилл).
2. Карточки нужного модуля в `kb/01-akty` … `kb/04-ekvayring`.
3. Для ОСВ — обязательно `kb/02-doktor-6062/00-parser-osv.md`.

## Жёсткие правила продукта

- Локальный HTML, **без** живой 1С / MCP к ИБ / серверного бэкенда.
- Менять логику в `SverkaFact _v2.html`; функционал PRO → синхронизировать в `_v2.1.html` (без лицензии), обычно через `avito/sync-pro-to-v21.cjs` или зеркальный патч.
- Новая проверка = **карточка в kb** (по `_template.md`) + код + тексты UI из `kb/ui-copy.md` при необходимости.
- Различать **ошибка** vs **право/справочно**. В UI колонка **«Важность»** через `withSeverity` / `severityMeta` (не путать с «Тип» в актах/эквайринге).
- FAQ в формах: `details.faq-box`.
- Эталоны: `kb/_samples/` (`node avito/make-kb-samples.cjs`).

## ОСВ 60/62 — не ломать парсер

- Шапка: `findOsvHeaderRow` (Дебет/Кредит), **не** `findHeaderRow` актов.
- Суммы: `resolveOsvAmountCols` → **конечное** сальдо + обороты.
- Контрагенты vs документы-регистраторы: `isOsvDocumentRow` / `isOsvServiceRow`.
- Авансы: `checkAdvanceVat` / `buildVatAdvanceIndex`.
- Эталон: `avito/test-osv.cjs` на файлах ОСВ 60 + 76.ВА; контроль суммы Дт.

## Чеклист новой проверки

1. Карточка `kb/…/NN-….md` с `id`, `severity`, UI-текстами.
2. Код в том же стиле, что соседние `issueRow` / `withSeverity` / таблицы отчёта.
3. Секция отчёта + лист Excel при необходимости (`rowsToTable` уже скрывает ключи `_…`, «Важность» идёт первой).
4. Прогон: `kb/_samples/INTERNAL.md` или `avito/verify-severity-samples.cjs`.
5. Синхрон v2 → v2.1.
6. Не трогать лицензию/KeyGen без явного запроса.

## Синхрон HTML ↔ kb (после правки текстов)

- [ ] Текст «Проблема / причина / что сделать» в HTML = блок UI в карточке `kb/`.
- [ ] Подпись формы / FAQ (`details.faq-box`) = `kb/ui-copy.md` или `client-faq.md`.
- [ ] `severity` карточки = аргумент `withSeverity(..., level)`.
- [ ] Оба файла: `SverkaFact _v2.html` и `SverkaFact _v2.1.html`.
- [ ] При новом эталоне — дописать строку в `kb/_samples/MANIFEST.md` и пересобрать `make-kb-samples.cjs`.

## Не делать в этом скилле

ГОЗ, ЗУП, ERP-консалтинг, универсальные «налоговые агенты», доступ к базе 1С.
