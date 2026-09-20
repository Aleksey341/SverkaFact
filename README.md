# СверкаФакт

Одностраничное приложение для сверки актов и модулей учёта 1С. Файлы обрабатываются только в браузере на компьютере пользователя.

**Продакшен:** https://sverka-fact.vercel.app ← автодеплой с ветки `main` (как у [1C_Analitik](https://github.com/Aleksey341/1C_Analitik)).

## Запуск локально

Откройте `index.html` или `SverkaFact _v2.html` в Chrome / Edge.

Перед пушем в GitHub синхронизируйте точку входа для Vercel:

```bash
npm run sync-index
```

(копирует `SverkaFact _v2.html` → `index.html`)

## Что в репозитории

| Путь | Назначение |
|------|------------|
| `index.html` | То, что отдаёт Vercel на `/` |
| `SverkaFact _v2.html` | Рабочая копия для правок |
| `kb/` | База знаний проверок |
| `DESIGN.md` | Визуальная система «Ясный стол» |
| `vercel.json` | Настройки статического хостинга |

Не публикуются: `KeyGen_*.html`, клиентские Excel/PDF, `node_modules`.

## Деплой (как у 1С Аналитик)

1. Правки → `npm run sync-index` → `git push` в `main`
2. Vercel сам собирает и выкладывает сайт
3. Первый раз: [vercel.com/new](https://vercel.com/new) → Import Git Repository → этот репозиторий → Framework Preset: **Other** → Deploy

## Форматы

`.xlsx`, `.xls`, `.csv`, `.pdf` (с выделяемым текстом).
