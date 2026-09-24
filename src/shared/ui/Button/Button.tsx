import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { Spinner } from '../Spinner'
import styles from './Button.module.css'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode
  variant?: 'primary' | 'ghost'
  loading?: boolean
  loadingLabel?: string
}

export function Button({
  children,
  variant = 'primary',
  className = '',
  loading = false,
  loadingLabel = 'Загрузка…',
  disabled,
  ...props
}: ButtonProps) {
  const isBusy = loading
  const spinnerTone = variant === 'primary' ? 'onAccent' : 'default'

  return (
    <button
      type="button"
      className={`${styles.button} ${styles[variant]} ${className}`.trim()}
      {...props}
      disabled={disabled || isBusy}
      aria-busy={isBusy || undefined}
    >
      {isBusy ? (
        <>
          <Spinner size="sm" tone={spinnerTone} label={loadingLabel} />
          <span>{loadingLabel}</span>
        </>
      ) : (
        children
      )}
    </button>
  )
}
