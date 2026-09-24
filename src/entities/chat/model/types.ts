export interface Chat {
  chatId: string
  title: string
  phone?: string
  avatarUrl?: string
  username?: string
}

export function createChatFromPhone(
  phone: string,
  chatId: string,
  avatarUrl?: string,
): Chat {
  return {
    chatId,
    title: phone.startsWith('+') ? phone : `+${phone.replace(/\D/g, '')}`,
    phone,
    avatarUrl,
  }
}
