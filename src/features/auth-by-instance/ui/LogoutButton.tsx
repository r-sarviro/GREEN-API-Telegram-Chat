import { useNavigate } from 'react-router-dom'
import { useSessionStore } from '@/entities/session'
import { useChatStore } from '@/entities/chat'
import { useMessageStore } from '@/entities/message'
import { Button } from '@/shared/ui'

export function LogoutButton() {
  const navigate = useNavigate()
  const clearCredentials = useSessionStore((s) => s.clearCredentials)
  const resetChats = useChatStore((s) => s.reset)
  const resetMessages = useMessageStore((s) => s.reset)

  const handleLogout = () => {
    clearCredentials()
    resetChats()
    resetMessages()
    navigate('/login')
  }

  return (
    <Button variant="ghost" onClick={handleLogout} type="button">
      Выйти
    </Button>
  )
}
