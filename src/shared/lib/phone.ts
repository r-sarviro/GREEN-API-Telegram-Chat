/**
 * Normalizes a phone number to GREEN-API chatId format: {digits}@c.us
 */
export function phoneToChatId(phone: string): string {
  const digits = phone.replace(/\D/g, '')
  if (digits.length < 10) {
    throw new Error('Номер телефона слишком короткий')
  }
  return `${digits}@c.us`
}

export function formatChatTitle(chatId: string, phone?: string): string {
  if (phone) return phone
  if (chatId.endsWith('@c.us')) {
    return `+${chatId.replace('@c.us', '')}`
  }
  return chatId
}
