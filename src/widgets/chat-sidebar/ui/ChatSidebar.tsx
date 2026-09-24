import { useState } from 'react'
import { LogoutButton } from '@/features/auth-by-instance'
import { CreateChatForm } from '@/features/create-chat'
import { ChatAvatar, useChatStore } from '@/entities/chat'
import { Button } from '@/shared/ui'
import styles from './ChatSidebar.module.css'

export function ChatSidebar() {
  const chats = useChatStore((s) => s.chats)
  const activeChatId = useChatStore((s) => s.activeChatId)
  const setActiveChat = useChatStore((s) => s.setActiveChat)
  const [showCreate, setShowCreate] = useState(false)

  return (
    <aside className={styles.sidebar}>
      <header className={styles.header}>
        <h2 className={styles.title}>Чаты</h2>
        <LogoutButton />
      </header>

      <div className={styles.actions}>
        <Button
          type="button"
          className={styles.newChat}
          onClick={() => setShowCreate((v) => !v)}
        >
          {showCreate ? 'Скрыть' : 'Новый чат'}
        </Button>
      </div>

      {showCreate ? (
        <CreateChatForm onCreated={() => setShowCreate(false)} />
      ) : null}

      <ul className={styles.list}>
        {chats.length === 0 ? (
          <li className={styles.empty}>Нет чатов. Создайте новый.</li>
        ) : (
          chats.map((chat) => (
            <li key={chat.chatId}>
              <button
                type="button"
                className={`${styles.item} ${
                  chat.chatId === activeChatId ? styles.active : ''
                }`}
                onClick={() => setActiveChat(chat.chatId)}
              >
                <ChatAvatar title={chat.title} avatarUrl={chat.avatarUrl} />
                <span className={styles.name}>{chat.title}</span>
              </button>
            </li>
          ))
        )}
      </ul>
    </aside>
  )
}
