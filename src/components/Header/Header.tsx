import { useEffect } from 'react'
import { useAppStore } from '../../store/appStore'
import { useOwnedFish } from '../../hooks/useOwnedFish'
import { getAccounts } from '../../lib/hiveApi'
import Button from '../common/Button'

export default function Header() {
  const user = useAppStore(s => s.user)
  const logout = useAppStore(s => s.logout)
  const setFish = useAppStore(s => s.setFish)
  const { data: ownedFish } = useOwnedFish(user?.username ?? null)

  useEffect(() => {
    if (ownedFish) setFish(ownedFish)
  }, [ownedFish, setFish])

  useEffect(() => {
    if (!user) return
    getAccounts([user.username]).then(accounts => {
      if (accounts[0]) {
        useAppStore.setState(s => ({
          user: s.user ? { ...s.user, hiveBalance: accounts[0].balance } : null,
        }))
      }
    }).catch(() => {})
  }, [user?.username])

  function handleLogout() {
    localStorage.removeItem('hive_aquarium_user')
    logout()
  }

  return (
    <header
      style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '16px 32px',
        background: 'linear-gradient(180deg, rgba(1,8,16,0.98) 0%, transparent 100%)',
        borderBottom: '1px solid var(--border)',
      }}
    >
      <div style={{ fontFamily: "'Cinzel Decorative', serif", fontSize: '1.4rem', color: 'var(--glow)', textShadow: '0 0 20px rgba(0,212,255,0.6)', letterSpacing: 2 }}>
        🐠 Hive <span style={{ color: 'var(--gold)' }}>Aquarium</span>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        {user && (
          <>
            {user.hiveBalance && user.hiveBalance !== '...' && (
              <div style={{ fontSize: '0.8rem', color: 'var(--gold)', background: 'rgba(240,192,64,0.1)', border: '1px solid rgba(240,192,64,0.3)', padding: '6px 14px', borderRadius: 20 }}>
                ⚡ {user.hiveBalance}
              </div>
            )}

            <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'rgba(0,212,255,0.08)', border: '1px solid var(--border)', borderRadius: 24, padding: '6px 16px' }}>
              {user.avatarUrl && (
                <img
                  src={user.avatarUrl}
                  alt={user.username}
                  style={{ width: 28, height: 28, borderRadius: '50%', border: '2px solid var(--glow)', objectFit: 'cover' }}
                />
              )}
              <span style={{ fontSize: '0.85rem', color: 'var(--glow)', fontWeight: 500 }}>
                @{user.username}
              </span>
            </div>

            <Button variant="logout" onClick={handleLogout}>Sair</Button>
          </>
        )}
      </div>
    </header>
  )
}
