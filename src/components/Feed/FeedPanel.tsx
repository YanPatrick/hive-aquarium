import { useAppStore } from '../../store/appStore'
import { useFollowingFeed, useTagFeed } from '../../hooks/useHiveFeed'
import { useSnaps } from '../../hooks/useSnaps'
import PostCard from './PostCard'
import SnapCard from './SnapCard'
import TagFilterStrip from './TagFilterStrip'

export default function FeedPanel() {
  const user = useAppStore(s => s.user)
  const activeTab = useAppStore(s => s.activeTab)
  const activeTag = useAppStore(s => s.activeTag)
  const setTab = useAppStore(s => s.setTab)
  const setTag = useAppStore(s => s.setTag)

  const followingFeed = useFollowingFeed()
  const tagFeed = useTagFeed(activeTag)
  const snaps = useSnaps()

  if (!user) return null

  const isTagActive = !!activeTag
  const postFeed = isTagActive ? tagFeed : followingFeed
  const currentFeed = activeTab === 'posts' ? postFeed : snaps

  const { posts, isLoading, isError, fetchNextPage, hasMore } = currentFeed

  return (
    <div
      style={{
        position: 'fixed',
        top: 64,
        left: '50%',
        transform: 'translateX(-50%)',
        width: 480,
        maxWidth: '100vw',
        height: 'calc(100vh - 64px)',
        zIndex: 50,
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <div
        style={{
          background: 'rgba(2,18,38,0.88)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          border: '1px solid var(--border)',
          borderTop: 'none',
          borderRadius: '0 0 16px 16px',
          display: 'flex',
          flexDirection: 'column',
          height: '100%',
          overflow: 'hidden',
        }}
      >
        {/* Tabs */}
        <div style={{ display: 'flex', borderBottom: '1px solid var(--border)', flexShrink: 0 }}>
          {(['posts', 'snaps'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setTab(tab)}
              style={{
                flex: 1,
                padding: '14px 0',
                background: 'none',
                border: 'none',
                borderBottom: activeTab === tab ? '2px solid var(--glow)' : '2px solid transparent',
                color: activeTab === tab ? 'var(--glow)' : 'var(--text-dim)',
                fontFamily: 'Raleway, sans-serif',
                fontSize: '0.9rem',
                fontWeight: activeTab === tab ? 600 : 400,
                cursor: 'pointer',
                transition: 'color 0.2s',
                letterSpacing: '0.5px',
                textTransform: 'capitalize',
              }}
            >
              {tab === 'posts' ? 'Posts' : 'Snaps'}
            </button>
          ))}
        </div>

        {/* Tag filter */}
        <div style={{ padding: '8px 16px', borderBottom: '1px solid rgba(0,212,255,0.08)', flexShrink: 0 }}>
          <TagFilterStrip activeTag={activeTag} onTagChange={setTag} />
        </div>

        {/* Content */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '12px 16px' }}>
          {isLoading && (
            <div style={{ textAlign: 'center', color: 'var(--text-dim)', paddingTop: 40, fontSize: '0.85rem' }}>
              Carregando feed...
            </div>
          )}

          {isError && !isLoading && (
            <div style={{ textAlign: 'center', color: '#ff8080', paddingTop: 40, fontSize: '0.85rem' }}>
              Não foi possível carregar o feed.{' '}
              <button
                onClick={() => window.location.reload()}
                style={{ color: 'var(--glow)', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline' }}
              >
                Tentar novamente
              </button>
            </div>
          )}

          {!isLoading && !isError && posts.length === 0 && (
            <div style={{ textAlign: 'center', paddingTop: 60 }}>
              <div style={{ fontSize: '2rem', marginBottom: 12 }}>🌊</div>
              <p style={{ color: 'var(--text-dim)', fontSize: '0.85rem', lineHeight: 1.6 }}>
                Siga pessoas no Hive para ver o feed aqui.
              </p>
              <a
                href="https://peakd.com"
                target="_blank"
                rel="noreferrer"
                style={{ color: 'var(--glow)', fontSize: '0.8rem', marginTop: 8, display: 'inline-block' }}
              >
                Explorar no PeakD →
              </a>
            </div>
          )}

          {!isLoading && posts.map(post => (
            activeTab === 'posts'
              ? <PostCard key={`${post.author}/${post.permlink}`} post={post} />
              : <SnapCard key={`${post.author}/${post.permlink}`} post={post} />
          ))}

          {hasMore && !isLoading && (
            <button
              onClick={fetchNextPage}
              style={{
                width: '100%',
                padding: '12px 0',
                marginTop: 8,
                background: 'rgba(0,30,60,0.6)',
                border: '1px solid var(--border)',
                borderRadius: 10,
                color: 'var(--glow)',
                fontFamily: 'Raleway, sans-serif',
                fontSize: '0.85rem',
                cursor: 'pointer',
                transition: 'background 0.2s',
              }}
            >
              Carregar mais
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
