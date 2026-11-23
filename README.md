# GREEN-API Telegram Chat

**Language:** [EN](README.md) · [RU](README.ru.md)

Telegram web chat via GREEN-API: React, TypeScript, Vite, Feature-Sliced Design; GitHub Pages.

**Live:** https://r-sarviro.github.io/GREEN-API-Telegram-Chat/

Deploy to GitHub Pages runs automatically on push to `main` (Actions).

## Stack

- React 19 + TypeScript + Vite
- Feature-Sliced Design
- Zustand, React Router
- Vitest + Testing Library + MSW

## Requirements

- Node.js 20+
- npm
- A GREEN-API Telegram instance (`idInstance`, `apiTokenInstance`, `apiUrl`)

## Quick start

```bash
npm install
npm run dev
```

Open http://localhost:5173

## Instance credentials and settings

1. Sign up at [green-api.com](https://green-api.com/telegram) and create a Telegram instance.
2. Copy `idInstance`, `apiTokenInstance`, and `apiUrl` from the dashboard.
3. Make sure the instance status is **authorized**. On login the app checks this via `getStateInstance`: invalid credentials or `notAuthorized` block access to chats.
4. Leave **`webhookUrl` empty** — the app receives events via HTTP API (`ReceiveNotification` / `DeleteNotification`), without an external webhook URL.
5. In the instance notification settings enable:
   - **incoming messages** (`incomingWebhook`) — otherwise new Telegram messages will not appear in the chat;
   - **outgoing message status** (`outgoingWebhook`) — otherwise delivery/read ticks will not update in the UI;
   - optionally **outgoing messages from phone / via API** (`outgoingAPIMessageWebhook`) to see those events in the notification queue as well.

Without outgoing status notifications enabled, ticks stay on “sent” and never move to “delivered” / “read”.

## Usage scenario

1. Sign in with `idInstance`, `apiTokenInstance`, `apiUrl`.
2. On the chats screen the list syncs via `GetChats` (personal chats); use “New chat” and enter a phone number when needed.
3. Opening a dialog loads history (`GetChatHistory`); contact names come from `GetContactInfo`.
4. Send a text message; outgoing statuses update from `outgoingMessageStatus`.
5. Replies from Telegram appear automatically (long-polling).

## Scripts

| Command         | Purpose            |
| --------------- | ------------------ |
| `npm run dev`   | Dev server         |
| `npm run build` | Production build   |
| `npm test`      | Unit tests         |
| `npm run lint`  | ESLint             |

## Project structure

```text
src/
  app/        — router, providers, global styles
  pages/      — login, chat
  widgets/    — sidebar, message panel
  features/   — auth, create-chat, send-message, receive-messages, load-chat-history, sync-chats
  entities/   — session, chat, message
  shared/     — api, ui, lib, config
```

## API

- Send: [`SendMessage`](https://green-api.com/v3/docs/api/sending/SendMessage/)
- Receive: [`ReceiveNotification`](https://green-api.com/en/telegram/docs/api/receiving/technology-http-api/ReceiveNotification/) + [`DeleteNotification`](https://green-api.com/en/telegram/docs/api/receiving/technology-http-api/DeleteNotification/)
- Contacts and chats: `GetContactInfo`, `GetChats`, `GetChatHistory`, `GetAvatar`

## License

MIT
