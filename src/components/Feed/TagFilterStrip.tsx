const DEFAULT_TAGS = ['hive-aquarium', 'photography', 'gaming', 'art', 'music']

interface Props {
  activeTag: string | null
  onTagChange(tag: string | null): void
}

export default function TagFilterStrip({ activeTag, onTagChange }: Props) {
  return (
    <div style={{ display: 'flex', gap: 8, overflowX: 'auto', padding: '8px 0', scrollbarWidth: 'none' }}>
      <Chip label="Todos" active={activeTag === null} onClick={() => onTagChange(null)} />
      {DEFAULT_TAGS.map(tag => (
        <Chip
          key={tag}
          label={`#${tag}`}
          active={activeTag === tag}
          onClick={() => onTagChange(tag)}
        />
      ))}
    </div>
  )
}

function Chip({ label, active, onClick }: { label: string; active: boolean; onClick(): void }) {
  return (
    <button
      onClick={onClick}
      data-active={active ? 'true' : 'false'}
      style={{
        flexShrink: 0,
        padding: '4px 12px',
        borderRadius: 20,
        fontSize: '0.75rem',
        cursor: 'pointer',
        border: `1px solid ${active ? 'var(--glow)' : 'var(--border)'}`,
        background: active ? 'rgba(0,212,255,0.15)' : 'rgba(0,20,50,0.5)',
        color: active ? 'var(--glow)' : 'var(--text-dim)',
        fontFamily: 'Raleway, sans-serif',
        transition: 'all 0.2s',
        whiteSpace: 'nowrap',
      }}
    >
      {label}
    </button>
  )
}
