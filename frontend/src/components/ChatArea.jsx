import { useEffect, useRef, useState } from 'react'
import { getMessages, sendMessage, updateConversationTitle } from '../api'
import MarkdownRenderer from './MarkdownRenderer'

const SUGGESTIONS = [
  { icon: '📋', text: 'Summarize the key points of this document' },
  { icon: '🔍', text: 'What are the main conclusions or findings?' },
  { icon: '📊', text: 'List the most important facts and figures' },
  { icon: '❓', text: 'What questions remain unanswered?' },
  { icon: '🔗', text: 'Explain the methodology used' },
  { icon: '⚡', text: 'What are the key takeaways?' },
]

function CopyBtn({ text }) {
  const [copied, setCopied] = useState(false)
  function copy() {
    navigator.clipboard.writeText(text).then(() => { setCopied(true); setTimeout(() => setCopied(false), 2000) })
  }
  return (
    <button onClick={copy} title="Copy" style={{
      display: 'flex', alignItems: 'center', gap: 5,
      padding: '4px 10px', borderRadius: 8, cursor: 'pointer',
      fontSize: 11, fontWeight: 600,
      color: copied ? '#34d399' : '#6b7280',
      background: copied ? 'rgba(52,211,153,0.1)' : 'transparent',
      border: copied ? '1px solid rgba(52,211,153,0.2)' : '1px solid transparent',
      transition: 'all 0.15s',
    }}
      onMouseEnter={e => { if (!copied) { e.currentTarget.style.color = '#d1d5db'; e.currentTarget.style.background = 'rgba(255,255,255,0.06)' } }}
      onMouseLeave={e => { if (!copied) { e.currentTarget.style.color = '#6b7280'; e.currentTarget.style.background = 'transparent' } }}
    >
      {copied ? (
        <><svg width="11" height="11" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7"/></svg>Copied!</>
      ) : (
        <><svg width="11" height="11" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"/></svg>Copy</>
      )}
    </button>
  )
}

function WelcomeScreen({ onNewChat, error }) {
  const [creating, setCreating] = useState(false)
  async function go() { setCreating(true); await onNewChat(); setCreating(false) }

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px 32px', background: '#0d0b18', position: 'relative', overflow: 'hidden' }}>
      {/* Background glow */}
      <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
        <div style={{ position: 'absolute', top: '20%', left: '50%', transform: 'translateX(-50%)', width: 600, height: 500, borderRadius: '50%', background: 'radial-gradient(circle, rgba(109,40,217,0.1) 0%, transparent 65%)' }} />
      </div>

      <div className="animate-fadeInUp" style={{ position: 'relative', maxWidth: 520, width: '100%', textAlign: 'center' }}>
        {/* Icon */}
        <div style={{
          width: 72, height: 72, borderRadius: 20, margin: '0 auto 24px',
          background: 'linear-gradient(135deg, rgba(124,58,237,0.2), rgba(168,85,247,0.2))',
          border: '1px solid rgba(139,92,246,0.25)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 16px 40px rgba(109,40,217,0.2)',
          position: 'relative',
        }}>
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="rgba(167,139,250,0.9)" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"/>
          </svg>
          <div style={{ position: 'absolute', bottom: -4, right: -4, width: 20, height: 20, borderRadius: '50%', background: '#10b981', border: '2px solid #0d0b18', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 12px rgba(16,185,129,0.5)' }}>
            <svg width="10" height="10" viewBox="0 0 12 12" fill="none">
              <path d="M2.5 6l2.5 2.5 5-5" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
        </div>

        <h2 style={{ fontSize: 28, fontWeight: 800, color: '#fff', letterSpacing: '-0.5px', marginBottom: 10 }}>Welcome to DocMind</h2>
        <p style={{ fontSize: 15, color: '#9ca3af', lineHeight: 1.65, maxWidth: 380, margin: '0 auto 32px' }}>
          Your AI research assistant. Create a notebook, upload documents, and start asking questions.
        </p>

        {error && (
          <div className="animate-fadeInUp" style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 16px', borderRadius: 12, background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', color: '#f87171', fontSize: 13, marginBottom: 20, textAlign: 'left' }}>
            <svg style={{ width: 14, height: 14, flexShrink: 0 }} fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd"/>
            </svg>
            {error}
          </div>
        )}

        <button
          onClick={go}
          disabled={creating}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 10,
            padding: '13px 28px', borderRadius: 14,
            background: creating ? 'rgba(124,58,237,0.5)' : 'linear-gradient(135deg, #7c3aed, #9333ea)',
            color: '#fff', fontSize: 14, fontWeight: 700,
            border: 'none', cursor: creating ? 'not-allowed' : 'pointer',
            boxShadow: creating ? 'none' : '0 6px 28px rgba(124,58,237,0.5)',
            transition: 'all 0.2s',
          }}
          onMouseEnter={e => { if (!creating) { e.currentTarget.style.transform = 'scale(1.03)'; e.currentTarget.style.boxShadow = '0 8px 36px rgba(124,58,237,0.65)' } }}
          onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.boxShadow = creating ? 'none' : '0 6px 28px rgba(124,58,237,0.5)' }}
        >
          {creating ? (
            <><svg style={{ width: 16, height: 16, animation: 'spin 1s linear infinite' }} fill="none" viewBox="0 0 24 24"><circle style={{ opacity: 0.25 }} cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path style={{ opacity: 0.75 }} fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/></svg>Creating…</>
          ) : (
            <><svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4"/></svg>Create your first notebook</>
          )}
        </button>

        {/* Feature grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, marginTop: 36 }}>
          {[['📄', 'Upload docs', 'PDF, DOCX, TXT'], ['🧠', 'Hybrid RAG', 'Dense + sparse'], ['💬', 'Chat naturally', 'Ask anything']].map(([icon, title, desc], i) => (
            <div key={title} className="animate-fadeInUp" style={{
              padding: '16px 12px', borderRadius: 14, textAlign: 'center',
              background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.07)',
              transition: 'all 0.2s', animationDelay: `${(i + 1) * 80}ms`,
            }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(139,92,246,0.08)'; e.currentTarget.style.borderColor = 'rgba(139,92,246,0.2)' }}
              onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.025)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.07)' }}
            >
              <div style={{ fontSize: 22, marginBottom: 6 }}>{icon}</div>
              <p style={{ fontSize: 12, fontWeight: 600, color: '#d1d5db', marginBottom: 2 }}>{title}</p>
              <p style={{ fontSize: 11, color: '#4b5563' }}>{desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function TypingIndicator() {
  return (
    <div className="animate-fadeInUp" style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
      <div style={{ width: 32, height: 32, borderRadius: 10, flexShrink: 0, marginTop: 2, background: 'linear-gradient(135deg, #7c3aed, #a855f7)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 12px rgba(124,58,237,0.35)' }}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="white">
          <path d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"/>
        </svg>
      </div>
      <div style={{ padding: '14px 18px', borderRadius: '4px 16px 16px 16px', background: '#1a1530', border: '1px solid rgba(139,92,246,0.15)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          {[0, 1, 2].map(i => <span key={i} className="typing-dot" style={{ width: 7, height: 7, borderRadius: '50%', background: 'rgba(167,139,250,0.7)', display: 'inline-block' }} />)}
        </div>
      </div>
    </div>
  )
}

export default function ChatArea({ token, convId, sources, onTitleUpdate, onToggleSources, showSources, onNewChat, newChatError }) {
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [notebookTitle, setNotebookTitle] = useState('Untitled Notebook')
  const [editingTitle, setEditingTitle] = useState(false)
  const bottomRef = useRef(null)
  const textareaRef = useRef(null)
  const titleRef = useRef(null)

  const hasReadySources = sources.some(s => s.status === 'ready')
  const canChat = hasReadySources || messages.length > 0

  useEffect(() => {
    if (!convId) return
    setMessages([])
    setNotebookTitle('Untitled Notebook')
    getMessages(token, convId).then(msgs => {
      setMessages(msgs)
      if (msgs.length > 0) setNotebookTitle(msgs[0].user_message.slice(0, 50))
    })
  }, [convId, token])

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages, loading])

  useEffect(() => {
    const el = textareaRef.current
    if (!el) return
    el.style.height = 'auto'
    el.style.height = Math.min(el.scrollHeight, 180) + 'px'
  }, [input])

  async function handleSend(e) {
    e?.preventDefault()
    if (!input.trim() || loading || !canChat) return
    const query = input.trim()
    setInput('')
    setLoading(true)
    const optimistic = { id: Date.now(), user_message: query, ai_reply: null }
    setMessages(m => [...m, optimistic])
    const { ok, data } = await sendMessage(token, query, convId)
    const reply = ok ? data.response : 'Sorry, something went wrong. Please try again.'
    setMessages(m => m.map(msg => msg.id === optimistic.id ? { ...msg, ai_reply: reply } : msg))
    setLoading(false)
    if (ok && messages.length === 0) {
      const title = query.slice(0, 50)
      setNotebookTitle(title)
      await updateConversationTitle(token, convId, title)
      onTitleUpdate()
    }
  }

  if (!convId) return <WelcomeScreen onNewChat={onNewChat} error={newChatError} />

  const readyCount = sources.filter(s => s.status === 'ready').length

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: '#0d0b18', minWidth: 0, overflow: 'hidden' }}>

      {/* Top bar */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 12,
        padding: '12px 20px',
        borderBottom: '1px solid rgba(255,255,255,0.07)',
        background: 'rgba(13,11,24,0.9)', backdropFilter: 'blur(12px)',
        flexShrink: 0,
      }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          {editingTitle ? (
            <input
              ref={titleRef} autoFocus value={notebookTitle}
              onChange={e => setNotebookTitle(e.target.value)}
              onBlur={() => setEditingTitle(false)}
              onKeyDown={e => { if (e.key === 'Enter' || e.key === 'Escape') { setEditingTitle(false); titleRef.current?.blur() } }}
              style={{ background: 'rgba(139,92,246,0.1)', border: '1px solid rgba(139,92,246,0.4)', borderRadius: 8, padding: '4px 10px', fontSize: 14, fontWeight: 700, color: '#fff', outline: 'none', width: '100%', maxWidth: 340 }}
            />
          ) : (
            <button
              onClick={() => setEditingTitle(true)}
              style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: 'none', cursor: 'pointer', padding: 0, maxWidth: 340 }}
            >
              <span style={{ fontSize: 14, fontWeight: 700, color: '#e5e7eb', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{notebookTitle}</span>
              <svg style={{ width: 12, height: 12, color: '#4b5563', flexShrink: 0 }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"/>
              </svg>
            </button>
          )}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
          {hasReadySources && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '5px 10px', borderRadius: 8, background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.2)', fontSize: 11.5, fontWeight: 700, color: '#34d399' }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#34d399', animation: 'pulse 2s infinite' }} />
              {readyCount} source{readyCount !== 1 ? 's' : ''} ready
            </div>
          )}
          <button
            onClick={onToggleSources}
            style={{
              display: 'flex', alignItems: 'center', gap: 6, padding: '6px 12px', borderRadius: 8,
              fontSize: 13, fontWeight: 600, cursor: 'pointer', transition: 'all 0.15s',
              background: showSources ? 'rgba(139,92,246,0.15)' : 'rgba(255,255,255,0.05)',
              border: showSources ? '1px solid rgba(139,92,246,0.3)' : '1px solid rgba(255,255,255,0.08)',
              color: showSources ? '#c4b5fd' : '#9ca3af',
            }}
          >
            <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
            </svg>
            Sources
            {sources.length > 0 && (
              <span style={{ padding: '1px 6px', borderRadius: 999, fontSize: 10, fontWeight: 700, background: 'rgba(139,92,246,0.3)', color: '#c4b5fd' }}>{sources.length}</span>
            )}
          </button>
        </div>
      </div>

      {/* Messages */}
      <div style={{ flex: 1, overflowY: 'auto' }}>
        <div style={{ maxWidth: 760, margin: '0 auto', padding: '32px 20px', display: 'flex', flexDirection: 'column', gap: 28 }}>

          {messages.length === 0 && !loading && (
            <div className="animate-fadeInUp">
              {canChat ? (
                <div style={{ textAlign: 'center' }}>
                  <div style={{ width: 48, height: 48, borderRadius: 14, margin: '0 auto 16px', background: 'rgba(139,92,246,0.15)', border: '1px solid rgba(139,92,246,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <svg width="20" height="20" fill="none" stroke="rgba(167,139,250,0.9)" strokeWidth="1.8" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/>
                    </svg>
                  </div>
                  <p style={{ fontSize: 14, color: '#9ca3af', fontWeight: 500, marginBottom: 20 }}>Ready! Pick a suggestion or type your own question</p>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8 }}>
                    {SUGGESTIONS.map(s => (
                      <button key={s.text} onClick={() => { setInput(s.text); textareaRef.current?.focus() }}
                        style={{
                          display: 'flex', alignItems: 'flex-start', gap: 10, padding: '12px 14px',
                          borderRadius: 12, textAlign: 'left', cursor: 'pointer',
                          background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)',
                          color: '#9ca3af', fontSize: 13, lineHeight: 1.45,
                          transition: 'all 0.15s',
                        }}
                        onMouseEnter={e => { e.currentTarget.style.background = 'rgba(139,92,246,0.1)'; e.currentTarget.style.borderColor = 'rgba(139,92,246,0.28)'; e.currentTarget.style.color = '#e9d5ff' }}
                        onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.03)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'; e.currentTarget.style.color = '#9ca3af' }}
                      >
                        <span style={{ fontSize: 15, flexShrink: 0 }}>{s.icon}</span>
                        <span>{s.text}</span>
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <div style={{ textAlign: 'center', padding: '32px 0' }}>
                  <div style={{ width: 52, height: 52, borderRadius: 16, margin: '0 auto 16px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <svg width="22" height="22" fill="none" stroke="#4b5563" strokeWidth="1.6" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"/>
                    </svg>
                  </div>
                  <p style={{ fontSize: 15, fontWeight: 600, color: '#6b7280', marginBottom: 6 }}>No sources added yet</p>
                  <p style={{ fontSize: 13, color: '#4b5563', lineHeight: 1.6 }}>
                    Open the <span style={{ color: '#a78bfa', fontWeight: 600 }}>Sources</span> panel and upload a document to begin.
                  </p>
                  {!showSources && (
                    <button onClick={onToggleSources}
                      style={{
                        display: 'inline-flex', alignItems: 'center', gap: 8,
                        marginTop: 20, padding: '10px 20px', borderRadius: 10,
                        background: 'rgba(139,92,246,0.12)', border: '1px solid rgba(139,92,246,0.25)',
                        color: '#c4b5fd', fontSize: 13, fontWeight: 600, cursor: 'pointer',
                        transition: 'all 0.15s',
                      }}
                      onMouseEnter={e => { e.currentTarget.style.background = 'rgba(139,92,246,0.2)' }}
                      onMouseLeave={e => { e.currentTarget.style.background = 'rgba(139,92,246,0.12)' }}
                    >
                      Open Sources panel
                      <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7"/></svg>
                    </button>
                  )}
                </div>
              )}
            </div>
          )}

          {messages.map(msg => (
            <div key={msg.id} className="animate-messageIn" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {/* User bubble */}
              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <div style={{
                  maxWidth: '75%', padding: '12px 18px', borderRadius: '18px 18px 4px 18px',
                  background: 'linear-gradient(135deg, #7c3aed, #6d28d9)',
                  color: '#fff', fontSize: 14, lineHeight: 1.6,
                  boxShadow: '0 4px 20px rgba(109,40,217,0.4)',
                }}>
                  {msg.user_message}
                </div>
              </div>

              {/* AI reply */}
              {msg.ai_reply !== null && (
                <div className="animate-slideInLeft" style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                  <div style={{
                    width: 32, height: 32, borderRadius: 10, flexShrink: 0, marginTop: 2,
                    background: 'linear-gradient(135deg, #7c3aed, #a855f7)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    boxShadow: '0 4px 12px rgba(124,58,237,0.35)',
                  }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="white">
                      <path d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"/>
                    </svg>
                  </div>
                  <div style={{
                    flex: 1, minWidth: 0, borderRadius: '4px 18px 18px 18px',
                    background: '#1a1530', border: '1px solid rgba(139,92,246,0.15)',
                    overflow: 'hidden',
                    boxShadow: '0 2px 12px rgba(0,0,0,0.3)',
                  }}>
                    <div style={{ padding: '14px 18px' }}>
                      <MarkdownRenderer content={msg.ai_reply} />
                    </div>
                    <div style={{
                      display: 'flex', justifyContent: 'flex-end',
                      padding: '6px 12px 10px',
                      borderTop: '1px solid rgba(255,255,255,0.05)',
                    }}>
                      <CopyBtn text={msg.ai_reply} />
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}

          {loading && <TypingIndicator />}
          <div ref={bottomRef} />
        </div>
      </div>

      {/* Input */}
      <div style={{ padding: '12px 20px 20px', flexShrink: 0, background: '#0d0b18' }}>
        <div style={{ maxWidth: 760, margin: '0 auto' }}>
          <form onSubmit={handleSend} style={{
            display: 'flex', alignItems: 'flex-end', gap: 12,
            padding: '12px 14px', borderRadius: 18,
            background: '#1a1530',
            border: `1.5px solid ${canChat ? 'rgba(139,92,246,0.2)' : 'rgba(255,255,255,0.06)'}`,
            boxShadow: '0 4px 24px rgba(0,0,0,0.4)',
            opacity: canChat ? 1 : 0.55,
            transition: 'border-color 0.2s, box-shadow 0.2s',
          }}
            onFocus={() => { }}
          >
            <textarea
              ref={textareaRef}
              rows={1}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend() } }}
              placeholder={canChat ? 'Ask anything about your documents…' : 'Add a source to start chatting…'}
              disabled={!canChat}
              style={{
                flex: 1, background: 'transparent', border: 'none', outline: 'none',
                fontSize: 14, color: '#f9fafb', resize: 'none',
                lineHeight: 1.6, minHeight: 24, maxHeight: 180,
                cursor: canChat ? 'text' : 'not-allowed',
              }}
              className="placeholder-zinc-600"
            />
            <button
              type="submit"
              disabled={!input.trim() || loading || !canChat}
              style={{
                width: 38, height: 38, borderRadius: 12, flexShrink: 0,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: (!input.trim() || loading || !canChat) ? 'rgba(124,58,237,0.2)' : 'linear-gradient(135deg, #7c3aed, #9333ea)',
                border: 'none', cursor: (!input.trim() || loading || !canChat) ? 'not-allowed' : 'pointer',
                boxShadow: (!input.trim() || loading || !canChat) ? 'none' : '0 4px 16px rgba(124,58,237,0.45)',
                transition: 'all 0.2s',
              }}
              onMouseEnter={e => { if (input.trim() && !loading && canChat) e.currentTarget.style.transform = 'scale(1.08)' }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)' }}
            >
              {loading ? (
                <svg style={{ width: 15, height: 15, animation: 'spin 1s linear infinite' }} fill="none" viewBox="0 0 24 24"><circle style={{ opacity: 0.25 }} cx="12" cy="12" r="10" stroke="white" strokeWidth="4"/><path style={{ opacity: 0.75 }} fill="white" d="M4 12a8 8 0 018-8v8H4z"/></svg>
              ) : (
                <svg width="15" height="15" fill="white" viewBox="0 0 24 24"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/></svg>
              )}
            </button>
          </form>
          <p style={{ textAlign: 'center', fontSize: 11, color: '#374151', fontWeight: 500, marginTop: 8 }}>
            Enter to send · Shift+Enter for new line
          </p>
        </div>
      </div>
    </div>
  )
}
