import { useState } from 'react'
import { useAppStore } from '../store/appStore'

declare global {
  interface Window {
    hive_keychain?: {
      requestSignBuffer(
        username: string,
        message: string,
        role: string,
        callback: (response: { success: boolean; message?: string }) => void
      ): void
      requestTransfer(
        username: string,
        to: string,
        amount: string,
        memo: string,
        currency: string,
        callback: (response: { success: boolean; message?: string; result?: { id?: string } }) => void
      ): void
      requestCustomJson(
        username: string,
        id: string,
        role: string,
        json: string,
        displayTitle: string,
        callback: (response: { success: boolean; message?: string }) => void
      ): void
    }
  }
}

function waitForKeychain(timeout = 5000): Promise<NonNullable<Window['hive_keychain']>> {
  return new Promise((resolve, reject) => {
    if (window.hive_keychain) { resolve(window.hive_keychain); return }
    const start = Date.now()
    const check = setInterval(() => {
      if (window.hive_keychain) { clearInterval(check); resolve(window.hive_keychain) }
      else if (Date.now() - start > timeout) { clearInterval(check); reject(new Error('Hive Keychain não encontrado')) }
    }, 200)
  })
}

export function useKeychain() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const login = useAppStore(s => s.login)

  async function loginWithKeychain(username: string) {
    const clean = username.trim().replace('@', '').toLowerCase()
    if (!clean) { setError('Digite seu usuário Hive.'); return }

    setIsLoading(true)
    setError(null)

    let keychain: NonNullable<Window['hive_keychain']>
    try {
      keychain = await waitForKeychain(5000)
    } catch {
      setError('Hive Keychain não encontrado. Verifique se a extensão está instalada.')
      setIsLoading(false)
      return
    }

    await new Promise<void>((resolve) => {
      keychain.requestSignBuffer(
        clean,
        `Login no Hive Aquarium — ${Date.now()}`,
        'Posting',
        (response) => {
          if (response.success) {
            login({
              username: clean,
              avatarUrl: `https://images.hive.blog/u/${clean}/avatar`,
              hivePower: 0,
              hiveBalance: '...',
            })
            localStorage.setItem('hive_aquarium_user', JSON.stringify({ username: clean }))
          } else {
            setError(response.message ?? 'Login cancelado')
          }
          setIsLoading(false)
          resolve()
        }
      )
    })
  }

  return { login: loginWithKeychain, isLoading, error }
}
