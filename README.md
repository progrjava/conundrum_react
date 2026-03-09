# Conundrum React

Веб-приложение для генерации и прохождения обучающих головоломок на основе загруженного текста (кроссворд, филворд, ребус) с поддержкой LTI, PDF-экспорта и сохранения в Supabase.

## Что умеет проект

- Генерация игровых заданий из пользовательского документа (`/api/generate-game`).
- Поддержка нескольких режимов отображения (кроссворд, филворд, ребус).
- Пересчёт раскладки кроссворда (`/api/recalculate-game-layout`).
- Экспорт задания в PDF (`/api/generate-pdf`).
- LTI-интеграция: запуск из LMS, определение ролей, отправка оценки.
- Работа с Supabase для аутентификации и хранения данных.

## Стек

**Frontend**
- React (CRA)
- React Router
- Supabase JS Client
- Nginx (раздача статики и проксирование)

**Backend**
- Node.js + Express
- Multer (загрузка файлов)
- PDFKit
- OAuth / LTI middleware
- Supabase Admin API

**Инфраструктура**
- Docker / Docker Compose
- Разделение на 2 контейнера: `client` и `server`
- Healthcheck для каждого сервиса

## Структура репозитория

```text
.
├── client/                 # React-приложение
├── server/                 # Express API + LTI + генерация PDF
├── docker-compose.yml      # Оркестрация контейнеров
└── README.md
```

## Переменные окружения

> В репозитории сейчас нет `.env.example`, поэтому ниже — минимальный набор переменных по коду.

### 1) Корневой `.env` (для сборки client в docker-compose)

```env
REACT_APP_API_URL=http://localhost
REACT_APP_SUPABASE_URL=https://<project>.supabase.co
REACT_APP_SUPABASE_ANON_KEY=<anon-key>
REACT_APP_BASE_URL=http://localhost
```

### 2) `server/.env`

```env
PORT=5000
NODE_ENV=production

# CORS / Session
ALLOWED_ORIGINS=http://localhost
SESSION_SECRET=<strong-session-secret>
CLIENT_URL=http://localhost

# Supabase
SUPABASE_URL=https://<project>.supabase.co
SUPABASE_SERVICE_ROLE_KEY=<service-role-key>
SUPABASE_JWT_SECRET=<jwt-secret>

# LTI
LTI_KEY=<lti-consumer-key>
LTI_SECRET=<lti-consumer-secret>

# AI / генерация
OPENROUTER_API_KEY=<openrouter-key>
OPENROUTER_API_URL=<openrouter-api-url>
FREEPIK_API_KEY=<freepik-key>
```

## Запуск через Docker Compose (рекомендуется)

```bash
docker compose up -d --build
```

После запуска:
- Frontend: `http://localhost`
- Backend healthcheck: `http://localhost/api/health` (через прокси)  
  (внутри контейнера backend слушает `5000`)

Полезные команды:

```bash
# Логи
docker compose logs -f

# Остановка
docker compose down
```

## Локальный запуск без Docker

### Backend

```bash
cd server
npm ci
npm start
```

### Frontend

```bash
cd client
npm ci
npm start
```

## API (основные endpoint'ы)

- `POST /api/generate-game` — генерация игры по загруженному файлу.
- `POST /api/recalculate-game-layout` — перерасчёт layout кроссворда.
- `POST /api/track-activity` — трекинг активности.
- `POST /api/generate-pdf` — формирование PDF.
- `POST /api/lti/submit-score` — отправка результата в LMS через LTI.
- `GET /api/health` — проверка состояния backend.
- `POST /lti/launch` — LTI launch с редиректом в клиент.

## Тесты

```bash
# backend
cd server && npm test

# frontend
cd client && npm test
```
