import type { FormEvent } from 'react'
import { useState } from 'react'
import { createChatFromPhone, enrichChatProfile, useChatStore } from '@/entities/chat'
import { useSessionStore } from '@/entities/session'
import { phoneToChatId } from '@/shared/lib'
import { Button, Input } from '@/shared/ui'
import styles from './CreateChatForm.module.css'

interface CreateChatFormProps {
  onCreated?: () => void
}

export function CreateChatForm({ onCreated }: CreateChatFormProps) {
  const credentials = useSessionStore((s) => s.credentials)
  const addChat = useChatStore((s) => s.addChat)
  const [phone, setPhone] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault()
    setError('')

    try {
      const chatId = phoneToChatId(phone)
      const chat = createChatFromPhone(phone.trim(), chatId)
      addChat(chat)
      setPhone('')
      onCreated?.()

      if (credentials) {
        void enrichChatProfile(credentials, chatId, chat.title)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Некорректный номер')
    }
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <Input
        label="Номер телефона получателя"
        name="phone"
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
        placeholder="79991234567"
        autoComplete="tel"
      />
      {error ? <p className={styles.error}>{error}</p> : null}
      <Button type="submit" className={styles.submit}>
        Создать чат
      </Button>
    </form>
  )
}
