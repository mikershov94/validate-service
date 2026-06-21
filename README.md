# URL Checker

Fullstack-приложение для проверки доступности списка URL через HEAD-запросы.

## Быстрый запуск через Docker

.env уже есть в репозитории.
Создавать не нужно

Запустите приложение:

```bash
docker compose up -d --build
```

После запуска приложение будет доступно по адресу:

```text
http://127.0.0.1:5173
```

---

## Тестирование Backend

Перейдите в папку backend:

```bash
cd backend
```

### Unit-тесты

```bash
npm run test
```

### E2E-тесты

```bash
npm run test:e2e
```
