import { useState } from 'react'
import type { HivePost } from '../../lib/hiveApi'
import VoteSlider from './VoteSlider'
import { useInteractions } from '../../hooks/useInteractions'

interface Props { post: HivePost }

export default function SnapCard({ post }: Props) {
  const [showVote, setShowVote] = useState(false)
  const [showComment, setShowComment] = useState(false)
  const [commentBody, setCommentBody] = useState('')
  const [votes, setVotes] = useState(post.net_votes)
  const [voted, setVoted] = useState(false)
  const [sending, setSending] = useState(false)
  const { comment } = useInteractions()

  let image = ''
  try { image = JSON.parse(post.json_metadata).image?.[0] ?? '' } catch {}

  const avatarUrl = `https://images.hive.blog/u/${post.author}/avatar`

  async function handleComment() {
    if (!commentBody.trim()) return
    setSending(true)
    await comment(post.author, post.permlink, commentBody)
    setSending(false)
    setCommentBody('')
    setShowComment(false)
  }

  return (
    <div
      style={{
        background: 'rgba(0,25,60,0.55)',
        border: '1px solid rgba(0,200,220,0.12)',
        borderRadius: 12,
        padding: '12px 14px',
        marginBottom: 10,
        transition: 'border-color 0.2s',
      }}
      onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(0,212,255,0.3)' }}
      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(0,200,220,0.12)' }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
        <img src={avatarUrl} alt={post.author} style={{ width: 24, height: 24, borderRadius: '50%', border: '1.5px solid var(--glow)' }} />
        <span style={{ fontSize: '0.78rem', color: 'var(--glow)' }}>@{post.author}</span>
        <span style={{ fontSize: '0.7rem', color: 'var(--text-dim)', marginLeft: 'auto' }}>
          {new Date(post.created).toLocaleDateString('pt-BR')}
        </span>
      </div>

      <p style={{ fontSize: '0.85rem', color: 'var(--text)', lineHeight: 1.5, marginBottom: image ? 8 : 0 }}>
        {post.body.slice(0, 280)}
      </p>

      {image && (
        <img
          src={image}
          alt=""
          style={{ width: '100%', borderRadius: 8, marginTop: 4, maxHeight: 200, objectFit: 'cover' }}
          onError={e => { (e.target as HTMLImageElement).style.display = 'none' }}
        />
      )}

      <div style={{ display: 'flex', gap: 14, marginTop: 8, fontSize: '0.72rem', alignItems: 'center' }}>
        <button
          onClick={() => { setShowVote(v => !v); setShowComment(false) }}
          disabled={voted}
          style={{
            background: 'none', border: 'none', cursor: voted ? 'default' : 'pointer',
            color: voted ? 'var(--glow)' : 'var(--text-dim)',
            fontSize: '0.72rem', fontFamily: 'inherit', padding: 0,
          }}
        >
          ▲ {votes}
        </button>
        <button
          onClick={() => { setShowComment(c => !c); setShowVote(false) }}
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-dim)', fontSize: '0.72rem', fontFamily: 'inherit', padding: 0 }}
        >
          💬
        </button>
      </div>

      {showVote && (
        <VoteSlider
          author={post.author}
          permlink={post.permlink}
          onClose={() => setShowVote(false)}
          onVoted={() => { setVotes(v => v + 1); setVoted(true) }}
        />
      )}

      {showComment && (
        <div style={{ marginTop: 8 }}>
          <textarea
            value={commentBody}
            onChange={e => setCommentBody(e.target.value)}
            placeholder="Escreva um comentário..."
            rows={2}
            style={{
              width: '100%', boxSizing: 'border-box',
              background: 'rgba(0,30,70,0.7)',
              border: '1px solid rgba(0,200,220,0.2)',
              borderRadius: 8,
              color: 'var(--text)',
              fontFamily: 'Raleway, sans-serif',
              fontSize: '0.82rem',
              padding: '8px 10px',
              resize: 'vertical',
            }}
          />
          <div style={{ display: 'flex', gap: 8, marginTop: 6, justifyContent: 'flex-end' }}>
            <button
              onClick={() => { setShowComment(false); setCommentBody('') }}
              style={{ background: 'none', border: 'none', color: 'var(--text-dim)', cursor: 'pointer', fontSize: '0.78rem' }}
            >
              Cancelar
            </button>
            <button
              onClick={handleComment}
              disabled={sending || !commentBody.trim()}
              style={{
                padding: '4px 14px',
                background: 'rgba(0,180,220,0.2)',
                border: '1px solid var(--glow)',
                borderRadius: 8,
                color: 'var(--glow)',
                fontSize: '0.78rem',
                cursor: sending ? 'wait' : 'pointer',
                fontFamily: 'Raleway, sans-serif',
              }}
            >
              {sending ? 'Publicando...' : 'Publicar'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
