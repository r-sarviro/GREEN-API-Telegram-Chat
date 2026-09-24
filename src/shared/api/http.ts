export class ApiError extends Error {
  constructor(
    message: string,
    public readonly status?: number,
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

export interface GreenApiCredentials {
  idInstance: string
  apiTokenInstance: string
  apiUrl: string
}

const NETWORK_ERROR_MESSAGE =
  'Нет соединения с сервером. Проверьте интернет и apiUrl.'

function buildUrl(
  creds: GreenApiCredentials,
  method: string,
  suffix = '',
): string {
  const base = creds.apiUrl.replace(/\/$/, '')
  return `${base}/waInstance${creds.idInstance}/${method}/${creds.apiTokenInstance}${suffix}`
}

function looksLikeJson(text: string): boolean {
  const trimmed = text.trim()
  return (
    (trimmed.startsWith('{') && trimmed.endsWith('}')) ||
    (trimmed.startsWith('[') && trimmed.endsWith(']'))
  )
}

function shortenDescription(description: string): string {
  const firstSentence = description.split(/(?<=[.!?])\s+/)[0]?.trim() ?? description
  if (firstSentence.length <= 220) {
    return firstSentence
  }
  return `${firstSentence.slice(0, 217)}…`
}

/** Exported for unit tests */
export function extractApiErrorMessage(payload: unknown, fallback: string): string {
  if (!payload || typeof payload !== 'object') {
    return fallback
  }

  const data = payload as Record<string, unknown>

  if (typeof data.message === 'string' && data.message) return data.message
  if (typeof data.error === 'string' && data.error) return data.error

  const correspondents = data.correspondentsStatus as
    | { description?: string }
    | undefined
  if (correspondents?.description) {
    return shortenDescription(correspondents.description)
  }

  const invoke = data.invokeStatus as { description?: string } | undefined
  if (invoke?.description) {
    return shortenDescription(invoke.description)
  }

  return fallback
}

async function parseError(response: Response): Promise<ApiError> {
  const statusFallback = `Ошибка API (${response.status})`
  let message = statusFallback

  try {
    const text = await response.text()
    if (text) {
      try {
        const json: unknown = JSON.parse(text)
        message = extractApiErrorMessage(json, statusFallback)
        if (looksLikeJson(message)) {
          message = statusFallback
        }
      } catch {
        message = looksLikeJson(text) ? statusFallback : text
      }
    }
  } catch {
    // ignore parse errors
  }

  return new ApiError(message, response.status)
}

export async function greenApiRequest<T>(
  creds: GreenApiCredentials,
  method: string,
  options: {
    httpMethod?: 'GET' | 'POST' | 'DELETE'
    body?: unknown
    suffix?: string
    query?: Record<string, string | number>
  } = {},
): Promise<T> {
  const { httpMethod = 'GET', body, suffix = '', query } = options
  let url = buildUrl(creds, method, suffix)

  if (query) {
    const params = new URLSearchParams()
    for (const [key, value] of Object.entries(query)) {
      params.set(key, String(value))
    }
    url += `?${params.toString()}`
  }

  let response: Response
  try {
    response = await fetch(url, {
      method: httpMethod,
      headers: body ? { 'Content-Type': 'application/json' } : undefined,
      body: body ? JSON.stringify(body) : undefined,
    })
  } catch {
    throw new ApiError(NETWORK_ERROR_MESSAGE)
  }

  if (!response.ok) {
    throw await parseError(response)
  }

  const text = await response.text()
  if (!text) {
    return null as T
  }

  return JSON.parse(text) as T
}
