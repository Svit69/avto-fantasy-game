# KHL Fixtures

## Как сохранить данные матча

1. Откройте страницу матча KHL в обычном браузере.
2. Откройте DevTools -> Network.
3. Обновите страницу.
4. Отфильтруйте `Fetch/XHR`.
5. Сохраните нужный JSON или используйте `Save all as HAR with content`.
6. Не коммитьте HAR без очистки: там могут быть cookies и токены.

## Что нельзя коммитить

- `Cookie`
- `Set-Cookie`
- `Authorization`
- `Proxy-Authorization`
- `X-Api-Key`
- персональные данные и полный HAR без проверки

## Импорт

```bash
npm run khl:import -- path/to/file.har
npm run khl:import -- path/to/play-by-play.json
npm run khl:import -- path/to/snapshots/
```

Импорт складывает fixture в `storage/khl-fixtures/<tournamentId>-<gameId>/`.

## Replay

```bash
npm run khl:replay -- 1369 898228 --speed=10
npm run khl:replay -- 1369 898228 --step
```

Replay использует тот же ingestion pipeline, что и обычная обработка.

## Env

```env
KHL_AUTOMOBILIST_TEAM_ID=37
KHL_DATA_PROVIDER=fixture
KHL_FIXTURE_PATH=storage/khl-fixtures
KHL_MANUAL_IMPORT_ENABLED=false
KHL_MANUAL_IMPORT_TOKEN=
```
