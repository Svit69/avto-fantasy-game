# KHL Fixtures

## Импорт PDF-протокола

Основной источник для КХЛ: официальный PDF-протокол матча.
Админ загружает PDF, сервер извлекает дату, арену, команды, соперника,
статистику хоккеистов и считает fantasy points через общий scoring pipeline.

## Что нельзя коммитить

- `Cookie`
- `Set-Cookie`
- `Authorization`
- `Proxy-Authorization`
- `X-Api-Key`
- персональные данные и полный HAR без проверки

## Импорт

```bash
npm run khl:import-pdf -- path/to/protocol.pdf 1369 898099
npm run khl:import -- path/to/file.har
npm run khl:import -- path/to/play-by-play.json
npm run khl:import -- path/to/snapshots/
```

Импорт складывает fixture в `storage/khl-fixtures/<tournamentId>-<gameId>/`.

## Admin API

```bash
curl -X POST https://example.ru/api/internal/khl/import \
  -H "Content-Type: application/json" \
  -H "x-khl-import-token: $KHL_MANUAL_IMPORT_TOKEN" \
  -d '{"match":{"tournamentId":"1369","gameId":"898099","homeTeamId":"190","league":"КХЛ","status":"finished"},"pdfBase64":"..."}'
```

## Replay

```bash
npm run khl:replay -- 1369 898228 --speed=10
npm run khl:replay -- 1369 898228 --step
```

Replay использует тот же ingestion pipeline, что и обычная обработка.

## Env

```env
KHL_AUTOMOBILIST_TEAM_ID=190
KHL_DATA_PROVIDER=fixture
KHL_FIXTURE_PATH=storage/khl-fixtures
KHL_MANUAL_IMPORT_ENABLED=false
KHL_MANUAL_IMPORT_TOKEN=
```
