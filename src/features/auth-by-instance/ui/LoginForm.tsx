import type { FormEvent } from 'react'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSessionStore } from '@/entities/session'
import { useChatStore } from '@/entities/chat'
import { useMessageStore } from '@/entities/message'
import {
  ApiError,
  getStateInstance,
  resolveLoginGate,
} from '@/shared/api'
import { Button, Input } from '@/shared/ui'
import styles from './LoginForm.module.css'

export function LoginForm() {
  const navigate = useNavigate()
  const setCredentials = useSessionStore((s) => s.setCredentials)
  const resetChats = useChatStore((s) => s.reset)
  const resetMessages = useMessageStore((s) => s.reset)

  const [idInstance, setIdInstance] = useState('')
  const [apiTokenInstance, setApiTokenInstance] = useState('')
  const [apiUrl, setApiUrl] = useState('https://api.green-api.com')
  const [error, setError] = useState('')
  const [checking, setChecking] = useState(false)

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    setError('')

    const trimmedId = idInstance.trim()
    const trimmedToken = apiTokenInstance.trim()
    const trimmedUrl = apiUrl.trim().replace(/\/$/, '')

    if (!trimmedId || !trimmedToken || !trimmedUrl) {
      setError('Заполните все поля')
      return
    }

    if (!/^https?:\/\//i.test(trimmedUrl)) {
      setError('apiUrl должен начинаться с http:// или https://')
      return
    }

    const credentials = {
      idInstance: trimmedId,
      apiTokenInstance: trimmedToken,
      apiUrl: trimmedUrl,
    }

    setChecking(true)
    try {
      const { stateInstance } = await getStateInstance(credentials)
      const gate = resolveLoginGate(stateInstance)
      if (!gate.ok) {
        setError(gate.message ?? 'Вход недоступен')
        return
      }

      resetChats()
      resetMessages()
      setCredentials(credentials)
      navigate('/chat')
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.status === 401 || err.status === 403 || err.status === 404) {
          setError('Неверные idInstance или apiTokenInstance. Проверьте данные в кабинете.')
          return
        }
        setError(err.message)
        return
      }
      setError(
        err instanceof Error
          ? err.message
          : 'Не удалось проверить инстанс. Попробуйте снова.',
      )
    } finally {
      setChecking(false)
    }
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <h1 className={styles.title}>GREEN-API Telegram Chat</h1>
      <p className={styles.subtitle}>Введите учётные данные из личного кабинета</p>

      <Input
        label="idInstance"
        name="idInstance"
        value={idInstance}
        onChange={(e) => setIdInstance(e.target.value)}
        placeholder="1101000000"
        autoComplete="off"
        required
        disabled={checking}
      />
      <Input
        label="apiTokenInstance"
        name="apiTokenInstance"
        value={apiTokenInstance}
        onChange={(e) => setApiTokenInstance(e.target.value)}
        placeholder="d75b3a66374942c5b3c019c698abc2067e151558"
        autoComplete="off"
        required
        disabled={checking}
      />
      <Input
        label="apiUrl"
        name="apiUrl"
        value={apiUrl}
        onChange={(e) => setApiUrl(e.target.value)}
        placeholder="https://api.green-api.com"
        autoComplete="off"
        required
        disabled={checking}
      />

      {error ? <p className={styles.error}>{error}</p> : null}

      <Button
        type="submit"
        className={styles.submit}
        loading={checking}
        loadingLabel="Проверка…"
      >
        Войти
      </Button>
    </form>
  )
}
