import { useEffect, useState } from 'react'
import Aquarium from './components/Aquarium/Aquarium'
import Header from './components/Header/Header'
import LoginOverlay from './components/Login/LoginOverlay'
import FeedPanel from './components/Feed/FeedPanel'
import ShopModal from './components/Shop/ShopModal'
import Toast from './components/common/Toast'
import { restoreSession } from './hooks/useKeychain'
import { useAppStore } from './store/appStore'

export default function App() {
  const user = useAppStore(s => s.user)
  const [shopOpen, setShopOpen] = useState(false)

  useEffect(() => {
    restoreSession()
  }, [])

  return (
    <>
      <Aquarium />
      <Header />
      <LoginOverlay />
      <FeedPanel />

      {user && (
        <>
          <div
            style={{
              position: 'fixed', right: 92, bottom: 46, zIndex: 90,
              background: 'rgba(2,18,38,0.9)', border: '1px solid var(--border)',
              borderRadius: 20, padding: '6px 14px', fontSize: '0.8rem',
              color: 'var(--glow)', pointerEvents: 'none',
            }}
          >
            Loja de Peixes
          </div>

          <button
            onClick={() => setShopOpen(true)}
            title="Loja"
            style={{
              position: 'fixed', right: 24, bottom: 32, zIndex: 90,
              width: 60, height: 60, borderRadius: '50%',
              background: 'linear-gradient(135deg, #005599, #0088cc)',
              color: '#fff', fontSize: '1.6rem', cursor: 'pointer', border: 'none',
              boxShadow: '0 0 30px rgba(0,136,204,0.5)',
              transition: 'all 0.3s',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
            onMouseEnter={e => {
              const el = e.currentTarget as HTMLElement
              el.style.transform = 'scale(1.1) rotate(10deg)'
              el.style.boxShadow = '0 0 50px rgba(0,136,204,0.7)'
            }}
            onMouseLeave={e => {
              const el = e.currentTarget as HTMLElement
              el.style.transform = 'none'
              el.style.boxShadow = '0 0 30px rgba(0,136,204,0.5)'
            }}
          >
            🛒
          </button>

          <FishHUD />
        </>
      )}

      <ShopModal isOpen={shopOpen} onClose={() => setShopOpen(false)} />
      <Toast />

      <div style={{ position: 'fixed', bottom: 10, left: '50%', transform: 'translateX(-50%)', zIndex: 88, pointerEvents: 'none', textAlign: 'center', whiteSpace: 'nowrap' }}>
        <span style={{ fontFamily: 'Raleway, sans-serif', fontSize: '0.58rem', letterSpacing: 1, color: 'rgba(100,160,200,0.25)', marginRight: 4 }}>desenvolvido por</span>
        <a href="https://peakd.com/@shiftrox/posts" target="_blank" rel="noreferrer" style={{ fontFamily: "'Cinzel Decorative', serif", fontSize: '0.62rem', letterSpacing: '1.5px', color: 'rgba(0,180,220,0.35)', textDecoration: 'none', pointerEvents: 'all', transition: 'color 0.3s' }}>Shiftrox</a>
      </div>

      <style>{`
        @keyframes cardIn {
          from { opacity:0; transform:translateY(30px) scale(0.95); }
          to   { opacity:1; transform:translateY(0) scale(1); }
        }
      `}</style>
    </>
  )
}

function FishHUD() {
  const count = useAppStore(s => s.myFish.length)
  if (count === 0) return null
  return (
    <div style={{
      position: 'fixed', bottom: 32, left: 24, zIndex: 90,
      background: 'rgba(2,18,38,0.85)', border: '1px solid var(--border)',
      borderRadius: 14, padding: '10px 18px', fontSize: '0.8rem',
      color: 'var(--text-dim)', backdropFilter: 'blur(4px)',
    }}>
      🐠 <span style={{ color: 'var(--glow)', fontWeight: 600 }}>{count}</span> peixe{count !== 1 ? 's' : ''} no aquário
    </div>
  )
}
