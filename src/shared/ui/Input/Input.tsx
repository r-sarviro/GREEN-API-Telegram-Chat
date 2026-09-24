import type { InputHTMLAttributes } from 'react'
import styles from './Input.module.css'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
}

export function Input({ label, error, id, className = '', ...props }: InputProps) {
  const inputId = id ?? props.name

  return (
    <label className={styles.field} htmlFor={inputId}>
      {label ? <span className={styles.label}>{label}</span> : null}
      <input id={inputId} className={`${styles.input} ${className}`.trim()} {...props} />
      {error ? <span className={styles.error}>{error}</span> : null}
    </label>
  )
}
