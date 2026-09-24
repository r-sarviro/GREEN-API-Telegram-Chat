import { useState } from 'react'
import styles from './ChatAvatar.module.css'

interface ChatAvatarProps {
  title: string
  avatarUrl?: string
  className?: string
}

export function ChatAvatar({ title, avatarUrl, className = '' }: ChatAvatarProps) {
  const [failed, setFailed] = useState(false)
  const initials = title.replace(/\D/g, '').slice(-2) || title.slice(0, 2)

  if (avatarUrl && !failed) {
    return (
      <img
        src={avatarUrl}
        alt=""
        className={`${styles.avatar} ${styles.image} ${className}`.trim()}
        onError={() => setFailed(true)}
      />
    )
  }

  return (
    <span className={`${styles.avatar} ${styles.fallback} ${className}`.trim()}>
      {initials}
    </span>
  )
}
