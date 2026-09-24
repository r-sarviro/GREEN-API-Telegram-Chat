import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse } from 'msw'
import { setupServer } from 'msw/node'
import { MemoryRouter } from 'react-router-dom'
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it } from 'vitest'
import { LoginForm } from './LoginForm'
import { useSessionStore } from '@/entities/session'

const server = setupServer()

beforeAll(() => server.listen())
afterEach(() => server.resetHandlers())
afterAll(() => server.close())

describe('LoginForm', () => {
  beforeEach(() => {
    useSessionStore.setState({ credentials: null, hydrated: true })
    sessionStorage.clear()
  })

  it('показывает ошибку при невалидном apiUrl', async () => {
    const user = userEvent.setup()
    render(
      <MemoryRouter>
        <LoginForm />
      </MemoryRouter>,
    )

    await user.type(screen.getByLabelText('idInstance'), '1103')
    await user.type(screen.getByLabelText('apiTokenInstance'), 'secret-token')
    await user.clear(screen.getByLabelText('apiUrl'))
    await user.type(screen.getByLabelText('apiUrl'), 'not-a-url')
    await user.click(screen.getByRole('button', { name: 'Войти' }))

    expect(
      screen.getByText('apiUrl должен начинаться с http:// или https://'),
    ).toBeInTheDocument()
  })

  it('не пускает при notAuthorized', async () => {
    server.use(
      http.get(
        'https://api.green-api.com/waInstance1103/getStateInstance/secret-token',
        () => HttpResponse.json({ stateInstance: 'notAuthorized' }),
      ),
    )

    const user = userEvent.setup()
    render(
      <MemoryRouter>
        <LoginForm />
      </MemoryRouter>,
    )

    await user.type(screen.getByLabelText('idInstance'), '1103')
    await user.type(screen.getByLabelText('apiTokenInstance'), 'secret-token')
    await user.clear(screen.getByLabelText('apiUrl'))
    await user.type(screen.getByLabelText('apiUrl'), 'https://api.green-api.com')
    await user.click(screen.getByRole('button', { name: 'Войти' }))

    expect(
      await screen.findByText(/Инстанс не авторизован в Telegram/i),
    ).toBeInTheDocument()
    expect(useSessionStore.getState().credentials).toBeNull()
  })

  it('не пускает при неверных кредах', async () => {
    server.use(
      http.get(
        'https://api.green-api.com/waInstance1103/getStateInstance/bad-token',
        () => new HttpResponse('Unauthorized', { status: 401 }),
      ),
    )

    const user = userEvent.setup()
    render(
      <MemoryRouter>
        <LoginForm />
      </MemoryRouter>,
    )

    await user.type(screen.getByLabelText('idInstance'), '1103')
    await user.type(screen.getByLabelText('apiTokenInstance'), 'bad-token')
    await user.clear(screen.getByLabelText('apiUrl'))
    await user.type(screen.getByLabelText('apiUrl'), 'https://api.green-api.com')
    await user.click(screen.getByRole('button', { name: 'Войти' }))

    expect(
      await screen.findByText(/Неверные idInstance или apiTokenInstance/i),
    ).toBeInTheDocument()
    expect(useSessionStore.getState().credentials).toBeNull()
  })

  it('сохраняет credentials при authorized', async () => {
    server.use(
      http.get(
        'https://api.green-api.com/waInstance1103/getStateInstance/secret-token',
        () => HttpResponse.json({ stateInstance: 'authorized' }),
      ),
    )

    const user = userEvent.setup()
    render(
      <MemoryRouter>
        <LoginForm />
      </MemoryRouter>,
    )

    await user.type(screen.getByLabelText('idInstance'), '1103')
    await user.type(screen.getByLabelText('apiTokenInstance'), 'secret-token')
    await user.clear(screen.getByLabelText('apiUrl'))
    await user.type(screen.getByLabelText('apiUrl'), 'https://api.green-api.com')
    await user.click(screen.getByRole('button', { name: 'Войти' }))

    await waitFor(() => {
      expect(useSessionStore.getState().credentials).toEqual({
        idInstance: '1103',
        apiTokenInstance: 'secret-token',
        apiUrl: 'https://api.green-api.com',
      })
    })
  })
})
