import { create } from 'zustand'
import type { GreenApiCredentials } from '@/shared/api'
import { SESSION_STORAGE_KEY } from '@/shared/config'

function loadSession(): GreenApiCredentials | null {
  try {
    const raw = sessionStorage.getItem(SESSION_STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as GreenApiCredentials
    if (parsed.idInstance && parsed.apiTokenInstance && parsed.apiUrl) {
      return parsed
    }
  } catch {
    // ignore
  }
  return null
}

function saveSession(creds: GreenApiCredentials | null) {
  if (!creds) {
    sessionStorage.removeItem(SESSION_STORAGE_KEY)
    return
  }
  sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(creds))
}

interface SessionState {
  credentials: GreenApiCredentials | null
  hydrated: boolean
  setCredentials: (creds: GreenApiCredentials) => void
  clearCredentials: () => void
  hydrate: () => void
}

export const useSessionStore = create<SessionState>((set) => ({
  credentials: null,
  hydrated: false,
  setCredentials: (creds) => {
    saveSession(creds)
    set({ credentials: creds })
  },
  clearCredentials: () => {
    saveSession(null)
    set({ credentials: null })
  },
  hydrate: () => {
    set({ credentials: loadSession(), hydrated: true })
  },
}))
