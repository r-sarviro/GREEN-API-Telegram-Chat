export function formatMessageTime(timestamp: number): string {
  const date = new Date(timestamp * 1000)
  return date.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })
}
