import { greenApiRequest, type GreenApiCredentials } from './http'

export type InstanceState =
  | 'authorized'
  | 'notAuthorized'
  | 'blocked'
  | 'sleepMode'
  | 'starting'
  | 'yellowCard'
  | string

export interface GetStateInstanceResponse {
  stateInstance: InstanceState
}

export async function getStateInstance(
  creds: GreenApiCredentials,
): Promise<GetStateInstanceResponse> {
  return greenApiRequest<GetStateInstanceResponse>(creds, 'getStateInstance', {
    httpMethod: 'GET',
  })
}

/** Human-readable gate result for the login screen. */
export function resolveLoginGate(stateInstance: InstanceState): {
  ok: boolean
  message?: string
} {
  if (stateInstance === 'authorized') {
    return { ok: true }
  }

  if (stateInstance === 'notAuthorized') {
    return {
      ok: false,
      message:
        'Инстанс не авторизован в Telegram. Отсканируйте QR в личном кабинете GREEN-API и дождитесь статуса authorized.',
    }
  }

  if (stateInstance === 'blocked') {
    return {
      ok: false,
      message: 'Инстанс заблокирован. Проверьте статус в личном кабинете GREEN-API.',
    }
  }

  if (stateInstance === 'starting') {
    return {
      ok: false,
      message: 'Инстанс запускается. Подождите немного и попробуйте снова.',
    }
  }

  if (stateInstance === 'sleepMode') {
    return {
      ok: false,
      message: 'Инстанс в режиме сна. Разбудите его в кабинете GREEN-API и повторите вход.',
    }
  }

  if (stateInstance === 'yellowCard') {
    return {
      ok: false,
      message: 'На инстансе ограничение (yellow card). Проверьте кабинет GREEN-API.',
    }
  }

  return {
    ok: false,
    message: `Инстанс недоступен (статус: ${stateInstance}).`,
  }
}
