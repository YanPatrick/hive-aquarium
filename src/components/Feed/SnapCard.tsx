import type { HivePost } from '../../lib/hiveApi'

interface Props { post: HivePost }

export default function SnapCard({ post }: Props) {
  let image = ''
  try { image = JSON.parse(post.json_metadata).image?.[0] ?? '' } catch {}

  const avatarUrl = `https://images.hive.blog/u/${post.author}/avatar`
  const text = post.body.slice(0, 280)

  return (
    <div
      style={{
        background: 'rgba(0,20,50,0.45)',
        border: '1px solid var(--border)',
        borderRadius: 12,
        padding: '12px 14px',
        marginBottom: 10,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
        <img src={avatarUrl} alt={post.author} style={{ width: 24, height: 24, borderRadius: '50%', border: '1.5px solid var(--glow)' }} />
        <span style={{ fontSize: '0.78rem', color: 'var(--glow)' }}>@{post.author}</span>
        <span style={{ fontSize: '0.7rem', color: 'var(--text-dim)', marginLeft: 'auto' }}>
          {new Date(post.created).toLocaleDateString('pt-BR')}
        </span>
      </div>

      <p style={{ fontSize: '0.85rem', color: 'var(--text)', lineHeight: 1.5, marginBottom: image ? 8 : 0 }}>
        {text}
      </p>

      {image && (
        <img src={image} alt="" style={{ width: '100%', borderRadius: 8, marginTop: 4, maxHeight: 200, objectFit: 'cover' }} onError={e => { (e.target as HTMLImageElement).style.display = 'none' }} />
      )}

      <div style={{ marginTop: 8, fontSize: '0.72rem', color: 'var(--text-dim)' }}>
        ▲ {post.net_votes}
      </div>
    </div>
  )
}
