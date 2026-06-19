import type { HivePost } from '../../lib/hiveApi'

function stripMarkdown(text: string): string {
  return text
    .replace(/!\[.*?\]\(.*?\)/g, '')
    .replace(/\[([^\]]+)\]\(.*?\)/g, '$1')
    .replace(/#{1,6}\s?/g, '')
    .replace(/\*\*(.+?)\*\*/g, '$1')
    .replace(/\*(.+?)\*/g, '$1')
    .replace(/`(.+?)`/g, '$1')
    .replace(/>\s?.+/g, '')
    .replace(/\n+/g, ' ')
    .trim()
}

interface Props { post: HivePost }

export default function PostCard({ post }: Props) {
  let thumbnail = ''
  try {
    const meta = JSON.parse(post.json_metadata)
    thumbnail = meta.image?.[0] ?? ''
  } catch {}

  const excerpt = stripMarkdown(post.body).slice(0, 180)
  const peakdUrl = `https://peakd.com/@${post.author}/${post.permlink}`
  const avatarUrl = `https://images.hive.blog/u/${post.author}/avatar`

  return (
    <a
      href={peakdUrl}
      target="_blank"
      rel="noreferrer"
      style={{
        display: 'block',
        textDecoration: 'none',
        background: 'rgba(0,20,50,0.5)',
        border: '1px solid var(--border)',
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        transition: 'border-color 0.2s, transform 0.2s',
        cursor: 'pointer',
      }}
      onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--glow)'; (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)' }}
      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--border)'; (e.currentTarget as HTMLElement).style.transform = 'none' }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
        <img src={avatarUrl} alt={post.author} style={{ width: 28, height: 28, borderRadius: '50%', border: '1.5px solid var(--glow)' }} />
        <span style={{ fontSize: '0.8rem', color: 'var(--glow)', fontWeight: 500 }}>@{post.author}</span>
        <span style={{ fontSize: '0.72rem', color: 'var(--text-dim)', marginLeft: 'auto' }}>
          {new Date(post.created).toLocaleDateString('pt-BR')}
        </span>
      </div>

      <div style={{ display: 'flex', gap: 12 }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontWeight: 600, color: 'var(--text)', fontSize: '0.92rem', lineHeight: 1.3, marginBottom: 6, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
            {post.title}
          </div>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-dim)', lineHeight: 1.5, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
            {excerpt}
          </div>
        </div>
        {thumbnail && (
          <img src={thumbnail} alt="" style={{ width: 72, height: 72, borderRadius: 8, objectFit: 'cover', flexShrink: 0 }} onError={e => { (e.target as HTMLImageElement).style.display = 'none' }} />
        )}
      </div>

      <div style={{ display: 'flex', gap: 14, marginTop: 10, fontSize: '0.75rem', color: 'var(--text-dim)' }}>
        <span>▲ {post.net_votes}</span>
        <span>💬 {post.children}</span>
        <span style={{ marginLeft: 'auto', color: 'var(--gold)' }}>{post.pending_payout_value}</span>
      </div>
    </a>
  )
}
