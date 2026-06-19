import { useEffect, useState } from 'react'
import { FISH_CATALOG } from '../../data/fishCatalog'
import { useAppStore } from '../../store/appStore'
import { fetchHivePrice } from '../../lib/hivePrice'
import { useShowToast } from '../common/Toast'
import FishCard from './FishCard'

const APP_ID = 'hive-aquarium/1.0'
const SHOP_ACCOUNT = 'hive-aquarium'

interface Props { isOpen: boolean; onClose(): void }

export default function ShopModal({ isOpen, onClose }: Props) {
  const user = useAppStore(s => s.user)
  const myFish = useAppStore(s => s.myFish)
  const addFish = useAppStore(s => s.addFish)
  const showToast = useShowToast()
  const [hivePrice, setHivePrice] = useState<number | null>(null)
  const [buying, setBuying] = useState<string | null>(null)

  useEffect(() => {
    fetchHivePrice().then(p => { if (p) setHivePrice(p) })
  }, [])

  if (!isOpen) return null

  async function buyFish(fishId: string) {
    const fish = FISH_CATALOG.find(f => f.id === fishId)
    if (!fish || !user || !window.hive_keychain) return

    setBuying(fishId)
    const usdStr = hivePrice ? ` (≈ $${(fish.price * hivePrice).toFixed(2)})` : ''
    showToast('🔑 Keychain', `Confirme o pagamento de ${fish.price} HIVE${usdStr} para comprar ${fish.name}`, false)

    const transferTimeout = setTimeout(() => {
      showToast('⏱️ Timeout', 'O Keychain não respondeu. Tente novamente.', true)
      setBuying(null)
    }, 60000)

    window.hive_keychain.requestTransfer(
      user.username,
      SHOP_ACCOUNT,
      fish.price.toFixed(3),
      fish.memo,
      'HIVE',
      (txResponse) => {
        clearTimeout(transferTimeout)
        if (!txResponse.success) {
          showToast('❌ Cancelado', txResponse.message ?? 'Transação cancelada.', true)
          setBuying(null)
          return
        }

        showToast('✅ Pagamento enviado!', `Registrando ${fish.name} na blockchain...`, false)

        const fishJson = JSON.stringify({
          action: 'add_fish',
          fish_id: fishId,
          fish_name: fish.name,
          tx: txResponse.result?.id ?? 'unknown',
          app: APP_ID,
        })

        window.hive_keychain!.requestCustomJson(
          user.username,
          APP_ID,
          'Posting',
          fishJson,
          `Hive Aquarium: Adicionar ${fish.name}`,
          (jsonResponse) => {
            const newFish = { id: fishId, name: fish.name, boughtAt: new Date().toISOString() }
            addFish(newFish)
            localStorage.setItem(
              `fish_${user.username}`,
              JSON.stringify([...myFish, newFish])
            )
            onClose()
            setBuying(null)
            if (jsonResponse.success) {
              showToast(`🎉 ${fish.name} adquirido!`, 'Seu novo peixe já está nadando no aquário!', false)
            } else {
              showToast(`⚠️ ${fish.name} adquirido!`, 'Peixe no aquário! (registro on-chain com aviso)', false)
            }
          }
        )
      }
    )
  }

  return (
    <div
      data-overlay
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
      style={{
        position: 'fixed', inset: 0, zIndex: 150,
        background: 'rgba(0,5,15,0.85)',
        backdropFilter: 'blur(6px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}
    >
      <div
        style={{
          background: 'var(--panel)',
          border: '1px solid var(--border)',
          borderRadius: 20,
          width: '92%', maxWidth: 820,
          maxHeight: '88vh',
          overflowY: 'auto',
          boxShadow: '0 0 100px rgba(0,80,160,0.4)',
          animation: 'cardIn 0.4s ease both',
        }}
        onClick={e => e.stopPropagation()}
      >
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '24px 32px',
          borderBottom: '1px solid var(--border)',
          position: 'sticky', top: 0,
          background: 'var(--panel)', zIndex: 2,
        }}>
          <div>
            <h2 style={{ fontFamily: "'Cinzel Decorative', serif", fontSize: '1.3rem', color: 'var(--glow)' }}>
              🛒 Loja de Peixes
            </h2>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-dim)', marginTop: 2 }}>
              Compre peixes com HIVE. Cada peixe fica salvo na blockchain para sempre.
            </p>
          </div>
          <button
            onClick={onClose}
            style={{
              width: 36, height: 36, borderRadius: '50%',
              background: 'rgba(255,80,80,0.1)', border: '1px solid rgba(255,80,80,0.2)',
              color: '#ff8080', fontSize: '1.2rem', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
          >
            ✕
          </button>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
          gap: 20,
          padding: '28px 32px',
        }}>
          {FISH_CATALOG.map(fish => (
            <FishCard
              key={fish.id}
              fish={fish}
              owned={myFish.some(f => f.id === fish.id)}
              hivePrice={hivePrice}
              onBuy={() => buyFish(fish.id)}
              isBuying={buying === fish.id}
            />
          ))}
        </div>
      </div>

      <style>{`
        @keyframes cardIn {
          from { opacity:0; transform:translateY(20px) scale(0.97); }
          to   { opacity:1; transform:none; }
        }
      `}</style>
    </div>
  )
}
