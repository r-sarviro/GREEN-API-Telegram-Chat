import { http, HttpResponse } from 'msw'
import { setupServer } from 'msw/node'
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest'
import {
  ApiError,
  deleteNotification,
  extractApiErrorMessage,
  receiveNotification,
  sendMessage,
} from '@/shared/api'

const creds = {
  idInstance: '1103',
  apiTokenInstance: 'token',
  apiUrl: 'https://api.green-api.com',
}

const server = setupServer()

beforeAll(() => server.listen())
afterEach(() => server.resetHandlers())
afterAll(() => server.close())

describe('green-api client', () => {
  it('sendMessage отправляет POST и возвращает idMessage', async () => {
    server.use(
      http.post(
        'https://api.green-api.com/waInstance1103/sendMessage/token',
        async ({ request }) => {
          const body = (await request.json()) as { chatId: string; message: string }
          expect(body).toEqual({ chatId: '1@c.us', message: 'Hi' })
          return HttpResponse.json({ idMessage: 'msg-1' })
        },
      ),
    )

    await expect(sendMessage(creds, '1@c.us', 'Hi')).resolves.toEqual({ idMessage: 'msg-1' })
  })

  it('receiveNotification возвращает null при пустом теле', async () => {
    server.use(
      http.get(
        'https://api.green-api.com/waInstance1103/receiveNotification/token',
        () => new HttpResponse(null, { status: 200 }),
      ),
    )

    await expect(receiveNotification(creds, 5)).resolves.toBeNull()
  })

  it('deleteNotification вызывает DELETE', async () => {
    server.use(
      http.delete(
        'https://api.green-api.com/waInstance1103/deleteNotification/token/42',
        () => HttpResponse.json({ result: true }),
      ),
    )

    await expect(deleteNotification(creds, 42)).resolves.toEqual({ result: true })
  })

  it('возвращает читаемое описание квоты вместо сырого JSON', async () => {
    const quotaPayload = {
      invokeStatus: {
        method: 'sendmessage',
        status: 'QUOTE_ALLOWED',
        description:
          'Monthly quota has been exceeded. You can only send or receive messages from these numbers: 79191086664@c.us.',
      },
      correspondentsStatus: {
        method: 'correspondents',
        status: 'CORRESPONDENTS_QUOTE_EXCEEDED',
        description:
          'Monthly quota has been exceeded. You can only send or receive messages from these numbers: 79191086664@c.us.',
      },
    }

    server.use(
      http.post(
        'https://api.green-api.com/waInstance1103/sendMessage/token',
        () => HttpResponse.json(quotaPayload, { status: 466 }),
      ),
    )

    await expect(sendMessage(creds, '1@c.us', 'Hi')).rejects.toMatchObject({
      name: 'ApiError',
      message: 'Monthly quota has been exceeded.',
      status: 466,
    })
  })

  it('возвращает понятное сообщение при сетевой ошибке', async () => {
    server.use(
      http.post('https://api.green-api.com/waInstance1103/sendMessage/token', () => {
        return HttpResponse.error()
      }),
    )

    await expect(sendMessage(creds, '1@c.us', 'Hi')).rejects.toEqual(
      new ApiError('Нет соединения с сервером. Проверьте интернет и apiUrl.'),
    )
  })
})

describe('extractApiErrorMessage', () => {
  it('не возвращает сырой JSON как сообщение', () => {
    expect(
      extractApiErrorMessage({ foo: 'bar' }, 'Ошибка API (400)'),
    ).toBe('Ошибка API (400)')
  })
})
