import styles from './Spinner.module.css'

interface SpinnerProps {
  size?: 'sm' | 'md'
  /** Light ring for use on accent-colored backgrounds */
  tone?: 'default' | 'onAccent'
  label?: string
}

export function Spinner({
  size = 'md',
  tone = 'default',
  label = 'Загрузка',
}: SpinnerProps) {
  return (
    <div
      className={`${styles.spinner} ${styles[size]} ${styles[tone]}`}
      aria-label={label}
      role="status"
    />
  )
}
