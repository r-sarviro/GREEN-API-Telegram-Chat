import type { FormEvent } from 'react'
import { useState } from 'react'
import { createOutgoingMessage, useMessageStore } from '@/entities/message'
import { useSessionStore } from '@/entities/session'
import { ApiError, sendMessage } from '@/shared/api'
import { Button } from '@/shared/ui'
import styles from './SendMessageForm.module.css'

interface SendMessageFormProps {
  chatId: string
}

export function SendMessageForm({ chatId }: SendMessageFormProps) {
  const credentials = useSessionStore((s) => s.credentials)
  const addMessage = useMessageStore((s) => s.addMessage)
  const updateMessageStatus = useMessageStore((s) => s.updateMessageStatus)
  const [text, setText] = useState('')
  const [sending, setSending] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    const message = text.trim()
    if (!message || !credentials || sending) return

    setSending(true)
    setError('')
    const tempId = `pending-${Date.now()}`
    addMessage(createOutgoingMessage(chatId, message, tempId, 'pending'))
    setText('')

    try {
      const { idMessage } = await sendMessage(credentials, chatId, message)
      // Replace pending id with real id by merging
      useMessageStore.setState((state) => {
        const list = state.messagesByChat[chatId] ?? []
        return {
          messagesByChat: {
            ...state.messagesByChat,
            [chatId]: list.map((m) =>
              m.id === tempId
                ? { ...m, id: idMessage, status: 'sent' as const }
                : m,
            ),
          },
        }
      })
    } catch (err) {
      updateMessageStatus(tempId, 'failed')
      const messageText =
        err instanceof ApiError
          ? err.message
          : err instanceof Error
            ? err.message
            : 'Не удалось отправить сообщение'
      setError(messageText)
    } finally {
      setSending(false)
    }
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      {error ? <p className={styles.error}>{error}</p> : null}
      <div className={styles.row}>
        <input
          className={styles.input}
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Написать сообщение..."
          maxLength={4096}
          disabled={sending}
          aria-label="Текст сообщения"
        />
        <Button
          type="submit"
          disabled={!text.trim()}
          className={styles.send}
          loading={sending}
          loadingLabel="Отправка…"
        >
          Отправить
        </Button>
      </div>
    </form>
  )
}
