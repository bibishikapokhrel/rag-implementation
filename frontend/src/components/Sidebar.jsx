import { useEffect, useState } from 'react'
import { getConversations, createConversation } from '../api'

function groupByDate(convs) {
  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const yesterday = new Date(today - 86400000)
  const weekAgo = new Date(today - 7 * 86400000)
  const groups = { Today: [], Yesterday: [], 'This Week': [], Earlier: [] }
  convs.forEach((c) => {
    const d = new Date(c.created_at)
    if (d >= today) groups['Today'].push(c)
    else if (d >= yesterday) groups['Yesterday'].push(c)
    else if (d >= weekAgo) groups['This Week'].push(c)
    else groups['Earlier'].push(c)
  })
  return Object.entries(groups).filter(([, items]) => items.length > 0)
}

export default function Sidebar({ token, userName, activeId, onSelect, onNewChat, onLogout, refreshTrigger }) {
  const [conversations, setConversations] = useState([])
  const [creating, setCreating] = useState(false)
  const [hoveredId, setHoveredId] = useState(null)

  useEffect(() => {
    getConversations(token).then(setConversations)
  }, [token, refreshTrigger])

  useEffect(() => {
    function onKey(e) {
      if ((e.metaKey || e.ctrlKey) && e.key === 'n') { e.preventDefault(); handleNewChat() }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [creating])

  async function handleNewChat() {
    if (creating) return
    setCreating(true)
    try {
      const { ok, data } = await createConversation(token)
      if (ok && data?.id) { setConversations(p => [data, ...p]); onNewChat(data.id) }
    } catch { /* ignore */ } finally { setCreating(false) }
  }

  const grouped = groupByDate(conversations)
  const initials = userName ? userName.slice(0, 2).toUpperCase() : '??'

  return (
    <aside style={{
      width: 260, flexShrink: 0,
      background: 'linear-gradient(180deg, #100d1f 0%, #0d0b1a 100%)',
      borderRight: '1px solid rgba(255,255,255,0.07)',
      display: 'flex', flexDirection: 'column', height: '100vh',
    }}>
      {/* Brand */}
      <div style={{ padding: '20px 16px 16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 18, padding: '0 4px' }}>
          <div style={{
            width: 32, height: 32, borderRadius: 10, flexShrink: 0,
            background: 'linear-gradient(135deg, #7c3aed, #a855f7)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 4px 16px rgba(124,58,237,0.4)',
          }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"/>
            </svg>
          </div>
          <span style={{ fontSize: 16, fontWeight: 800, color: '#fff', letterSpacing: '-0.3px' }}>DocMind</span>
        </div>

        {/* New Notebook button */}
        <button
          onClick={handleNewChat}
          disabled={creating}
          style={{
            width: '100%', display: 'flex', alignItems: 'center', gap: 10,
            padding: '10px 14px', borderRadius: 12, cursor: creating ? 'not-allowed' : 'pointer',
            background: 'rgba(139,92,246,0.12)',
            border: '1px solid rgba(139,92,246,0.25)',
            color: '#c4b5fd', fontSize: 13, fontWeight: 700,
            transition: 'all 0.2s',
            opacity: creating ? 0.6 : 1,
          }}
          onMouseEnter={e => {
            e.currentTarget.style.background = 'rgba(139,92,246,0.2)'
            e.currentTarget.style.borderColor = 'rgba(139,92,246,0.4)'
            e.currentTarget.style.color = '#fff'
          }}
          onMouseLeave={e => {
            e.currentTarget.style.background = 'rgba(139,92,246,0.12)'
            e.currentTarget.style.borderColor = 'rgba(139,92,246,0.25)'
            e.currentTarget.style.color = '#c4b5fd'
          }}
        >
          <div style={{
            width: 20, height: 20, borderRadius: 6, flexShrink: 0,
            background: 'linear-gradient(135deg, #7c3aed, #a855f7)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 2px 8px rgba(124,58,237,0.4)',
          }}>
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round">
              <path d="M12 4v16m8-8H4"/>
            </svg>
          </div>
          {creating ? 'Creating…' : 'New Notebook'}
          <kbd style={{
            marginLeft: 'auto', fontSize: 9, color: '#6b7280',
            background: 'rgba(255,255,255,0.06)', padding: '2px 6px',
            borderRadius: 4, fontFamily: 'monospace', fontWeight: 600,
          }}>⌘N</kbd>
        </button>
      </div>

      {/* Divider */}
      <div style={{ height: 1, background: 'rgba(255,255,255,0.05)', margin: '0 16px' }} />

      {/* Conversation list */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '8px 12px' }}>
        {conversations.length === 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '48px 16px', textAlign: 'center' }}>
            <div style={{
              width: 44, height: 44, borderRadius: 14, marginBottom: 12,
              background: 'rgba(139,92,246,0.1)',
              border: '1px solid rgba(139,92,246,0.18)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="rgba(139,92,246,0.7)" strokeWidth="1.5" strokeLinecap="round">
                <path d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/>
              </svg>
            </div>
            <p style={{ fontSize: 13, fontWeight: 600, color: '#6b7280', marginBottom: 4 }}>No notebooks yet</p>
            <p style={{ fontSize: 12, color: '#374151', lineHeight: 1.5 }}>Create your first notebook to start researching</p>
          </div>
        ) : (
          <div>
            {grouped.map(([label, items]) => (
              <div key={label} style={{ marginBottom: 20 }}>
                <p style={{ fontSize: 10, fontWeight: 700, color: '#374151', letterSpacing: '0.1em', textTransform: 'uppercase', padding: '0 8px', marginBottom: 4 }}>
                  {label}
                </p>
                {items.map(c => {
                  const isActive = activeId === c.id
                  const isHovered = hoveredId === c.id
                  return (
                    <button
                      key={c.id}
                      onClick={() => onSelect(c.id)}
                      onMouseEnter={() => setHoveredId(c.id)}
                      onMouseLeave={() => setHoveredId(null)}
                      style={{
                        width: '100%', display: 'flex', alignItems: 'center', gap: 10,
                        padding: '8px 10px', borderRadius: 10, marginBottom: 2,
                        cursor: 'pointer', position: 'relative', overflow: 'hidden',
                        background: isActive ? 'rgba(139,92,246,0.15)' : isHovered ? 'rgba(255,255,255,0.05)' : 'transparent',
                        border: isActive ? '1px solid rgba(139,92,246,0.28)' : '1px solid transparent',
                        transition: 'all 0.15s',
                        textAlign: 'left',
                      }}
                    >
                      {isActive && (
                        <div style={{
                          position: 'absolute', left: 0, top: 4, bottom: 4, width: 3,
                          borderRadius: '0 4px 4px 0',
                          background: 'linear-gradient(180deg, #a78bfa, #7c3aed)',
                        }} />
                      )}
                      <svg
                        style={{ width: 14, height: 14, flexShrink: 0, color: isActive ? '#a78bfa' : '#4b5563' }}
                        fill="none" stroke="currentColor" viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/>
                      </svg>
                      <span style={{
                        fontSize: 13, fontWeight: isActive ? 600 : 400,
                        color: isActive ? '#e9d5ff' : isHovered ? '#d1d5db' : '#6b7280',
                        overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                        transition: 'color 0.15s',
                      }}>
                        {c.title || 'Untitled Notebook'}
                      </span>
                    </button>
                  )
                })}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* User footer */}
      <div style={{ padding: '8px 12px 16px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
        <div
          style={{
            display: 'flex', alignItems: 'center', gap: 10,
            padding: '10px 10px', borderRadius: 12, cursor: 'default',
            transition: 'background 0.15s',
          }}
          onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.04)' }}
          onMouseLeave={e => { e.currentTarget.style.background = 'transparent' }}
          className="group-user"
        >
          <div style={{
            width: 32, height: 32, borderRadius: '50%', flexShrink: 0,
            background: 'linear-gradient(135deg, #7c3aed, #a855f7)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 12, fontWeight: 800, color: '#fff',
            boxShadow: '0 2px 8px rgba(124,58,237,0.3)',
          }}>
            {initials}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ fontSize: 13, fontWeight: 600, color: '#d1d5db', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{userName}</p>
            <p style={{ fontSize: 11, color: '#4b5563' }}>Free plan</p>
          </div>
          <button
            onClick={onLogout}
            title="Sign out"
            style={{
              width: 28, height: 28, borderRadius: 8, flexShrink: 0,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: 'none', border: 'none', cursor: 'pointer',
              color: '#4b5563', transition: 'all 0.15s',
            }}
            onMouseEnter={e => { e.currentTarget.style.color = '#f87171'; e.currentTarget.style.background = 'rgba(239,68,68,0.1)' }}
            onMouseLeave={e => { e.currentTarget.style.color = '#4b5563'; e.currentTarget.style.background = 'none' }}
          >
            <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/>
            </svg>
          </button>
        </div>
      </div>
    </aside>
  )
}
