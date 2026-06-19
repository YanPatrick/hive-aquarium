import { useState, useEffect } from 'react'
import { useAppStore } from '../../store/appStore'
import { useKeychain } from '../../hooks/useKeychain'
import Button from '../common/Button'

export default function LoginOverlay() {
  const user = useAppStore(s => s.user)
  const { login, isLoading, error } = useKeychain()
  const [username, setUsername] = useState('')

  useEffect(() => {
    const saved = localStorage.getItem('hive_aquarium_user')
    if (saved) {
      try { setUsername(JSON.parse(saved).username ?? '') } catch {}
    }
  }, [])

  if (user) return null

  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 200,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: 'radial-gradient(ellipse at center, rgba(1,15,35,0.97) 0%, rgba(0,5,15,0.99) 100%)',
      }}
    >
      <div
        style={{
          background: 'var(--panel)',
          border: '1px solid var(--border)',
          borderRadius: 20,
          padding: '48px 56px',
          textAlign: 'center',
          boxShadow: '0 0 80px rgba(0,80,160,0.3), inset 0 1px 0 rgba(0,212,255,0.1)',
          maxWidth: 440,
          width: '90%',
          animation: 'cardIn 0.6s cubic-bezier(0.34,1.56,0.64,1) both',
        }}
      >
        <div style={{ fontSize: '2.2rem', marginBottom: 24 }}>🐠</div>

        <h1 style={{ fontFamily: "'Cinzel Decorative', serif", fontSize: '1.8rem', color: 'var(--glow)', textShadow: '0 0 30px rgba(0,212,255,0.5)', marginBottom: 8 }}>
          Hive <span style={{ color: 'var(--gold)' }}>Aquarium</span>
        </h1>

        <p style={{ color: 'var(--text-dim)', fontSize: '0.9rem', lineHeight: 1.6, marginBottom: 32 }}>
          Um aquário vivo na blockchain. Faça login com o Hive Keychain para coletar e cuidar dos seus peixes.
        </p>

        <div style={{ position: 'relative', marginBottom: 16 }}>
          <input
            type="text"
            placeholder="Seu usuário Hive (sem @)"
            value={username}
            onChange={e => setUsername(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && login(username)}
            autoComplete="off"
            style={{
              width: '100%',
              background: 'rgba(0,30,60,0.8)',
              border: '1px solid var(--border)',
              borderRadius: 10,
              padding: '14px 18px',
              color: 'var(--text)',
              fontFamily: 'Raleway, sans-serif',
              fontSize: '0.95rem',
              outline: 'none',
            }}
          />
        </div>

        <Button
          variant="keychain"
          fullWidth
          disabled={isLoading}
          onClick={() => login(username)}
        >
          <span style={{ fontSize: '1.3rem' }}>🔑</span>
          {isLoading ? 'Conectando...' : 'Entrar com Hive Keychain'}
        </Button>

        {error && (
          <div style={{ color: '#ff6b6b', fontSize: '0.82rem', marginTop: 10, background: 'rgba(255,80,80,0.08)', border: '1px solid rgba(255,80,80,0.2)', borderRadius: 8, padding: '8px 12px' }}>
            {error}
          </div>
        )}

        <p style={{ marginTop: 20, fontSize: '0.75rem', color: 'var(--text-dim)', lineHeight: 1.5 }}>
          Não tem a extensão?{' '}
          <a href="https://hive-keychain.com" target="_blank" rel="noreferrer" style={{ color: 'var(--glow)', textDecoration: 'none' }}>
            Baixar Hive Keychain →
          </a>
          <br />
          Sem conta Hive?{' '}
          <a href="https://peakd.com/register?ref=shiftrox" target="_blank" rel="noreferrer" style={{ color: 'var(--glow)', textDecoration: 'none' }}>
            Criar conta grátis →
          </a>
        </p>
      </div>

      <style>{`
        @keyframes cardIn {
          from { opacity:0; transform:translateY(30px) scale(0.95); }
          to   { opacity:1; transform:translateY(0) scale(1); }
        }
      `}</style>
    </div>
  )
}
