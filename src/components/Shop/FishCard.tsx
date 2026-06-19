import type { FishEntry } from '../../data/fishCatalog'

const RARITY_LABEL: Record<string, string> = {
  common: 'Comum', rare: '✦ Raro', epic: '✦✦ Épico', legendary: '★ Lendário',
}
const RARITY_COLOR: Record<string, string> = {
  common: '#80b0e0', rare: '#60ccff', epic: '#cc80ff', legendary: '#f0c040',
}

interface Props {
  fish: FishEntry
  owned: boolean
  hivePrice: number | null
  onBuy(): void
  isBuying: boolean
}

export default function FishCard({ fish, owned, hivePrice, onBuy, isBuying }: Props) {
  return (
    <div
      data-card
      style={{
        position: 'relative',
        background: 'rgba(0,20,50,0.6)',
        border: '1px solid rgba(0,100,200,0.2)',
        borderRadius: 14,
        padding: 20,
        textAlign: 'center',
        transition: 'all 0.3s',
        cursor: 'pointer',
      }}
      onMouseEnter={e => {
        const el = e.currentTarget as HTMLElement
        el.style.borderColor = 'var(--glow)'
        el.style.transform = 'translateY(-4px)'
        el.style.boxShadow = '0 8px 30px rgba(0,212,255,0.2)'
      }}
      onMouseLeave={e => {
        const el = e.currentTarget as HTMLElement
        el.style.borderColor = 'rgba(0,100,200,0.2)'
        el.style.transform = 'none'
        el.style.boxShadow = 'none'
      }}
    >
      {owned && (
        <div style={{
          position: 'absolute', top: 10, right: 10,
          background: 'rgba(0,200,100,0.2)', border: '1px solid rgba(0,200,100,0.4)',
          borderRadius: 10, padding: '2px 8px', fontSize: '0.65rem', color: '#00cc88',
        }}>
          ✓ Seu
        </div>
      )}

      <div style={{ height: 80, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <img
          src={`data:image/svg+xml;charset=utf-8,${encodeURIComponent(fish.svgString(0.9))}`}
          alt={fish.name}
          style={{ maxHeight: 80, maxWidth: '100%', objectFit: 'contain' }}
        />
      </div>

      <h3 style={{ fontSize: '1rem', color: 'var(--text)', margin: '10px 0 4px', fontWeight: 500 }}>
        {fish.name}
      </h3>

      <div style={{ fontSize: '0.7rem', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 8, fontWeight: 500, color: RARITY_COLOR[fish.rarity] }}>
        {RARITY_LABEL[fish.rarity]}
      </div>

      <p style={{ fontSize: '0.78rem', color: 'var(--text-dim)', lineHeight: 1.4, marginBottom: 14 }}>
        {fish.desc}
      </p>

      <div style={{ fontSize: '1.1rem', color: 'var(--gold)', fontWeight: 500, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
        🐝 {fish.price} HIVE
        <span style={{ fontSize: '0.7rem', color: 'var(--text-dim)' }}>
          {hivePrice ? `≈ $${(fish.price * hivePrice).toFixed(2)}` : '...'}
        </span>
      </div>

      <button
        onClick={owned ? undefined : onBuy}
        disabled={owned || isBuying}
        style={{
          width: '100%',
          marginTop: 12,
          padding: '10px 0',
          background: owned || isBuying
            ? 'rgba(0,60,120,0.3)'
            : 'linear-gradient(135deg, #004488, #0077cc)',
          color: owned || isBuying ? 'var(--text-dim)' : '#fff',
          border: 'none',
          borderRadius: 8,
          fontSize: '0.85rem',
          cursor: owned || isBuying ? 'not-allowed' : 'pointer',
          fontFamily: 'Raleway, sans-serif',
          transition: 'all 0.3s',
        }}
      >
        {isBuying ? '⏳ Aguardando...' : owned ? '✓ Já no aquário' : '🛒 Comprar'}
      </button>
    </div>
  )
}
