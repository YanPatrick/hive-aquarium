import { useState } from 'react'
import { useInteractions } from '../../hooks/useInteractions'

interface Props {
  author: string
  permlink: string
  onClose(): void
  onVoted(): void
}

export default function VoteSlider({ author, permlink, onClose, onVoted }: Props) {
  const [weight, setWeight] = useState(100)
  const [voting, setVoting] = useState(false)
  const { vote } = useInteractions()

  async function handleVote() {
    setVoting(true)
    const success = await vote(author, permlink, weight * 100)
    setVoting(false)
    if (success) {
      onVoted()
      onClose()
    }
  }

  return (
    <div
      style={{
        marginTop: 8,
        padding: '10px 12px',
        background: 'rgba(0,30,70,0.7)',
        border: '1px solid rgba(0,200,220,0.2)',
        borderRadius: 10,
        display: 'flex',
        alignItems: 'center',
        gap: 10,
      }}
    >
      <input
        type="range"
        min={1}
        max={100}
        value={weight}
        onChange={e => setWeight(Number(e.target.value))}
        disabled={voting}
        style={{ flex: 1, accentColor: 'var(--glow)', cursor: voting ? 'wait' : 'pointer' }}
      />
      <span style={{ fontSize: '0.75rem', color: 'var(--glow)', minWidth: 36, textAlign: 'right' }}>
        {weight}%
      </span>
      <button
        onClick={handleVote}
        disabled={voting}
        style={{
          padding: '4px 12px',
          background: 'rgba(0,180,220,0.2)',
          border: '1px solid var(--glow)',
          borderRadius: 8,
          color: 'var(--glow)',
          fontSize: '0.78rem',
          cursor: voting ? 'wait' : 'pointer',
          fontFamily: 'Raleway, sans-serif',
          whiteSpace: 'nowrap',
        }}
      >
        {voting ? 'Votando...' : 'Votar'}
      </button>
      <button
        onClick={onClose}
        disabled={voting}
        style={{
          background: 'none',
          border: 'none',
          color: 'var(--text-dim)',
          cursor: 'pointer',
          fontSize: '1.1rem',
          padding: '0 2px',
          lineHeight: 1,
        }}
        aria-label="Fechar"
      >
        ×
      </button>
    </div>
  )
}
