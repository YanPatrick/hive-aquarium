import { useState } from 'react'
import { useAppStore } from '../../store/appStore'
import { useFollowingFeed, useTagFeed } from '../../hooks/useHiveFeed'
import { useSnaps } from '../../hooks/useSnaps'
import { useInteractions } from '../../hooks/useInteractions'
import PostCard from './PostCard'
import SnapCard from './SnapCard'
import TagFilterStrip from './TagFilterStrip'

const BUBBLES = [
  { size: 5,  left: '6%',  delay: 0,   dur: 7   },
  { size: 8,  left: '11%', delay: 2.5, dur: 9   },
  { size: 4,  left: '87%', delay: 1,   dur: 6   },
  { size: 7,  left: '92%', delay: 3.5, dur: 8   },
  { size: 5,  left: '4%',  delay: 5,   dur: 7.5 },
  { size: 6,  left: '95%', delay: 1.5, dur: 6.5 },
]

export default function FeedPanel() {
  const user = useAppStore(s => s.user)
  const activeTab = useAppStore(s => s.activeTab)
  const activeTag = useAppStore(s => s.activeTag)
  const setTab = useAppStore(s => s.setTab)
  const setTag = useAppStore(s => s.setTag)

  const followingFeed = useFollowingFeed()
  const tagFeed = useTagFeed(activeTag)
  const snaps = useSnaps()
  const { publishSnap } = useInteractions()

  const [snapBody, setSnapBody] = useState('')
  const [publishingSnap, setPublishingSnap] = useState(false)

  if (!user) return null

  const isTagActive = !!activeTag
  const postFeed = isTagActive ? tagFeed : followingFeed
  const currentFeed = activeTab === 'posts' ? postFeed : snaps

  const { posts: rawPosts, isLoading, isError, fetchNextPage, hasMore } = currentFeed

  const posts = (activeTab === 'snaps' && activeTag)
    ? rawPosts.filter(post => {
        try {
          const meta = JSON.parse(post.json_metadata)
          if (!Array.isArray(meta.tags)) return true
          return meta.tags.includes(activeTag)
        } catch {
          return true
        }
      })
    : rawPosts

  async function handlePublishSnap() {
    if (!snapBody.trim() || !snaps.containerPermlink) return
    setPublishingSnap(true)
    await publishSnap(snaps.containerPermlink, snapBody)
    setPublishingSnap(false)
    setSnapBody('')
  }

  return (
    <>
      <style>{`
        @keyframes bubbleRise {
          0%   { transform: translateY(0)   scaleX(1);    opacity: 0; }
          10%  { opacity: 0.5; }
          90%  { opacity: 0.3; }
          100% { transform: translateY(-340px) scaleX(1.1); opacity: 0; }
        }
      `}</style>

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
            position: 'relative',
            background: 'rgba(0,15,40,0.82)',
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
            border: '1px solid rgba(0,200,220,0.25)',
            borderTop: 'none',
            borderRadius: '0 0 18px 18px',
            boxShadow: 'inset 0 0 40px rgba(0,180,220,0.06), 0 0 60px rgba(0,120,180,0.2)',
            display: 'flex',
            flexDirection: 'column',
            height: '100%',
            overflow: 'hidden',
          }}
        >
          {/* Bubbles */}
          {BUBBLES.map((b, i) => (
            <span
              key={i}
              style={{
                position: 'absolute',
                bottom: 8,
                left: b.left,
                width: b.size,
                height: b.size,
                borderRadius: '50%',
                background: 'rgba(100,220,255,0.35)',
                border: '1px solid rgba(150,240,255,0.5)',
                animation: `bubbleRise ${b.dur}s ${b.delay}s ease-in infinite`,
                pointerEvents: 'none',
              }}
            />
          ))}

          {/* Tabs */}
          <div style={{ display: 'flex', borderBottom: '1px solid rgba(0,200,220,0.15)', flexShrink: 0, position: 'relative', zIndex: 1 }}>
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
          <div style={{ padding: '8px 16px', borderBottom: '1px solid rgba(0,200,220,0.08)', flexShrink: 0, position: 'relative', zIndex: 1 }}>
            <TagFilterStrip activeTag={activeTag} onTagChange={setTag} />
          </div>

          {/* Snaps compose area */}
          {activeTab === 'snaps' && (
            <div style={{ padding: '10px 16px', borderBottom: '1px solid rgba(0,200,220,0.08)', flexShrink: 0, position: 'relative', zIndex: 1 }}>
              <textarea
                value={snapBody}
                onChange={e => setSnapBody(e.target.value)}
                placeholder="O que está acontecendo no Hive?"
                rows={3}
                maxLength={512}
                style={{
                  width: '100%', boxSizing: 'border-box',
                  background: 'rgba(0,30,70,0.6)',
                  border: '1px solid rgba(0,200,220,0.2)',
                  borderRadius: 10,
                  color: 'var(--text)',
                  fontFamily: 'Raleway, sans-serif',
                  fontSize: '0.85rem',
                  padding: '10px 12px',
                  resize: 'none',
                }}
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 6 }}>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-dim)' }}>{snapBody.length}/512</span>
                <button
                  onClick={handlePublishSnap}
                  disabled={publishingSnap || !snapBody.trim() || !snaps.containerPermlink}
                  style={{
                    padding: '5px 18px',
                    background: 'rgba(0,180,220,0.2)',
                    border: '1px solid var(--glow)',
                    borderRadius: 10,
                    color: 'var(--glow)',
                    fontFamily: 'Raleway, sans-serif',
                    fontSize: '0.82rem',
                    cursor: publishingSnap ? 'wait' : 'pointer',
                    transition: 'background 0.2s',
                  }}
                >
                  {publishingSnap ? 'Publicando...' : 'Snap'}
                </button>
              </div>
            </div>
          )}

          {/* Content */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '12px 16px', position: 'relative', zIndex: 1 }}>
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
                  {activeTab === 'posts' ? 'Siga pessoas no Hive para ver o feed aqui.' : 'Nenhum snap por enquanto.'}
                </p>
                {activeTab === 'posts' && (
                  <a
                    href="https://peakd.com"
                    target="_blank"
                    rel="noreferrer"
                    style={{ color: 'var(--glow)', fontSize: '0.8rem', marginTop: 8, display: 'inline-block' }}
                  >
                    Explorar no PeakD →
                  </a>
                )}
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
                  border: '1px solid rgba(0,200,220,0.15)',
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
    </>
  )
}
