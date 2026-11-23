# GREEN-API Telegram Chat

**Язык:** [EN](README.md) · [RU](README.ru.md)

Веб-чат Telegram через GREEN-API: React, TypeScript, Vite, Feature-Sliced Design; GitHub Pages.

**Live:** https://r-sarviro.github.io/GREEN-API-Telegram-Chat/

Деплой на GitHub Pages выполняется автоматически при push в `main` (Actions).

## Стек

- React 19 + TypeScript + Vite
- Feature-Sliced Design
- Zustand, React Router
- Vitest + Testing Library + MSW

## Требования

- Node.js 20+
- npm
- Инстанс GREEN-API Telegram (`idInstance`, `apiTokenInstance`, `apiUrl`)

## Быстрый старт

```bash
npm install
npm run dev
```

Откройте http://localhost:5173

## Учётные данные и настройки инстанса

1. Зарегистрируйтесь на [green-api.com](https://green-api.com/telegram) и создайте инстанс Telegram.
2. В личном кабинете скопируйте `idInstance`, `apiTokenInstance` и `apiUrl`.
3. Убедитесь, что инстанс в статусе **authorized** (авторизован в Telegram). При входе приложение проверяет это через `getStateInstance`: неверные креды или статус `notAuthorized` не пустят на экран чатов.
4. Поле **`webhookUrl` оставьте пустым** — приложение получает события через HTTP API (`ReceiveNotification` / `DeleteNotification`), без внешнего webhook URL.
5. В настройках уведомлений инстанса включите:
   - **входящие сообщения** (`incomingWebhook`) — иначе новые сообщения из Telegram не появятся в чате;
   - **уведомления о статусах исходящих** (`outgoingWebhook`) — иначе галочки доставки/прочтения в UI не обновятся;
   - при необходимости — **исходящие сообщения с телефона / через API** (`outgoingAPIMessageWebhook`), чтобы видеть в очереди уведомлений и такие события.

Без включённых статусов исходящих в кабинете галочки в интерфейсе останутся на «отправлено» и не перейдут в «доставлено» / «прочитано».

## Сценарий использования

1. Войдите, указав `idInstance`, `apiTokenInstance`, `apiUrl`.
2. На экране чатов список синхронизируется через `GetChats` (личные чаты); при необходимости нажмите «Новый чат» и введите номер телефона.
3. При открытии диалога подгружается история (`GetChatHistory`); имена контактов — через `GetContactInfo`.
4. Отправьте текстовое сообщение; статусы исходящих обновляются из `outgoingMessageStatus`.
5. Ответ из Telegram появится автоматически (long-polling).

## Скрипты

| Команда         | Назначение         |
| --------------- | ------------------ |
| `npm run dev`   | Dev-сервер         |
| `npm run build` | Production-сборка  |
| `npm test`      | Unit-тесты         |
| `npm run lint`  | ESLint             |

## Структура проекта

```text
src/
  app/        — роутер, провайдеры, глобальные стили
  pages/      — login, chat
  widgets/    — sidebar, message panel
  features/   — auth, create-chat, send-message, receive-messages, load-chat-history, sync-chats
  entities/   — session, chat, message
  shared/     — api, ui, lib, config
```

## API

- Отправка: [`SendMessage`](https://green-api.com/v3/docs/api/sending/SendMessage/)
- Получение: [`ReceiveNotification`](https://green-api.com/en/telegram/docs/api/receiving/technology-http-api/ReceiveNotification/) + [`DeleteNotification`](https://green-api.com/en/telegram/docs/api/receiving/technology-http-api/DeleteNotification/)
- Контакты и чаты: `GetContactInfo`, `GetChats`, `GetChatHistory`, `GetAvatar`

## Лицензия

MIT
