import { useRef, useState } from 'react'

function fmt(bytes) {
  if (!bytes) return ''
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

const TYPE_CFG = {
  pdf:  { bg: 'rgba(239,68,68,0.12)', border: 'rgba(239,68,68,0.25)', color: '#f87171',  label: 'PDF' },
  docx: { bg: 'rgba(59,130,246,0.12)', border: 'rgba(59,130,246,0.25)', color: '#60a5fa', label: 'DOC' },
  doc:  { bg: 'rgba(59,130,246,0.12)', border: 'rgba(59,130,246,0.25)', color: '#60a5fa', label: 'DOC' },
  txt:  { bg: 'rgba(16,185,129,0.12)', border: 'rgba(16,185,129,0.25)', color: '#34d399', label: 'TXT' },
}

function TypeChip({ type }) {
  const cfg = TYPE_CFG[type] || { bg: 'rgba(107,114,128,0.15)', border: 'rgba(107,114,128,0.25)', color: '#9ca3af', label: (type || 'FILE').toUpperCase().slice(0, 4) }
  return (
    <div style={{ width: 40, height: 40, borderRadius: 10, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: cfg.bg, border: `1px solid ${cfg.border}` }}>
      <span style={{ fontSize: 9, fontWeight: 800, color: cfg.color, letterSpacing: '0.05em' }}>{cfg.label}</span>
    </div>
  )
}

function StatusBadge({ status }) {
  if (status === 'uploading' || status === 'processing') return (
    <span style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, fontWeight: 700, color: '#fbbf24' }}>
      <svg style={{ width: 12, height: 12, animation: 'spin 1s linear infinite' }} fill="none" viewBox="0 0 24 24"><circle style={{ opacity: 0.25 }} cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path style={{ opacity: 0.75 }} fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/></svg>
      {status === 'uploading' ? 'Uploading…' : 'Processing…'}
    </span>
  )
  if (status === 'ready') return (
    <span style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, fontWeight: 700, color: '#34d399' }}>
      <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#34d399', animation: 'pulse 2s infinite' }} />
      Ready
    </span>
  )
  if (status === 'error') return (
    <span style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, fontWeight: 700, color: '#f87171' }}>
      <svg style={{ width: 12, height: 12 }} fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd"/></svg>
      Failed
    </span>
  )
  return null
}

export default function SourcesPanel({ sources, onAddSource, onRemoveSource, onClose, onViewDocument }) {
  const [dragging, setDragging] = useState(false)
  const [hovered, setHovered] = useState(null)
  const fileRef = useRef(null)
  const readyCount = sources.filter(s => s.status === 'ready').length

  function handleDrop(e) { e.preventDefault(); setDragging(false); Array.from(e.dataTransfer.files).forEach(onAddSource) }
  function handleChange(e) { Array.from(e.target.files).forEach(onAddSource); e.target.value = '' }

  return (
    <aside className="animate-slideInRight" style={{
      width: 290, flexShrink: 0,
      background: 'linear-gradient(180deg, #0e0b1e 0%, #0b0918 100%)',
      borderLeft: '1px solid rgba(255,255,255,0.07)',
      display: 'flex', flexDirection: 'column', height: '100vh',
    }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 18px', borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 28, height: 28, borderRadius: 8, background: 'rgba(139,92,246,0.15)', border: '1px solid rgba(139,92,246,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="13" height="13" fill="none" stroke="rgba(167,139,250,0.9)" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
            </svg>
          </div>
          <span style={{ fontSize: 14, fontWeight: 700, color: '#f4f4f5' }}>Sources</span>
          {sources.length > 0 && (
            <span style={{ fontSize: 11, fontWeight: 600, color: '#4b5563' }}>{readyCount}/{sources.length} ready</span>
          )}
        </div>
        <button onClick={onClose} style={{ width: 28, height: 28, borderRadius: 8, background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#4b5563', transition: 'all 0.15s' }}
          onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.07)'; e.currentTarget.style.color = '#d1d5db' }}
          onMouseLeave={e => { e.currentTarget.style.background = 'none'; e.currentTarget.style.color = '#4b5563' }}>
          <svg width="15" height="15" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7"/></svg>
        </button>
      </div>

      {/* Body */}
      <div style={{ flex: 1, overflowY: 'auto', padding: 14, display: 'flex', flexDirection: 'column', gap: 12 }}>
        {/* Drop zone */}
        <input ref={fileRef} type="file" accept=".pdf,.txt,.docx" multiple style={{ display: 'none' }} onChange={handleChange} />
        <div
          onClick={() => fileRef.current.click()}
          onDragOver={e => { e.preventDefault(); setDragging(true) }}
          onDragLeave={() => setDragging(false)}
          onDrop={handleDrop}
          style={{
            borderRadius: 16, padding: '24px 20px', textAlign: 'center', cursor: 'pointer',
            border: `2px dashed ${dragging ? 'rgba(139,92,246,0.7)' : 'rgba(255,255,255,0.1)'}`,
            background: dragging ? 'rgba(139,92,246,0.12)' : 'rgba(255,255,255,0.025)',
            transform: dragging ? 'scale(1.01)' : 'scale(1)',
            boxShadow: dragging ? '0 0 24px rgba(139,92,246,0.15)' : 'none',
            transition: 'all 0.2s',
          }}
          onMouseEnter={e => { if (!dragging) { e.currentTarget.style.borderColor = 'rgba(139,92,246,0.45)'; e.currentTarget.style.background = 'rgba(139,92,246,0.07)' } }}
          onMouseLeave={e => { if (!dragging) { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'; e.currentTarget.style.background = 'rgba(255,255,255,0.025)' } }}
        >
          <div style={{
            width: 48, height: 48, borderRadius: 14, margin: '0 auto 12px',
            background: dragging ? 'rgba(139,92,246,0.2)' : 'rgba(255,255,255,0.05)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            transition: 'all 0.2s',
          }}>
            <svg width="22" height="22" fill="none" stroke={dragging ? 'rgba(167,139,250,0.9)' : '#4b5563'} strokeWidth="1.8" viewBox="0 0 24 24" style={{ transition: 'all 0.2s' }}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"/>
            </svg>
          </div>
          <p style={{ fontSize: 13, fontWeight: 700, color: dragging ? '#c4b5fd' : '#9ca3af', marginBottom: 4, transition: 'color 0.2s' }}>
            {dragging ? 'Drop to add source' : 'Add a source'}
          </p>
          <p style={{ fontSize: 11, color: '#4b5563', fontWeight: 500 }}>PDF · DOCX · TXT · Drag & drop or click</p>
        </div>

        {/* File list */}
        {sources.length > 0 && (
          <div className="animate-fadeInUp">
            <p style={{ fontSize: 10, fontWeight: 700, color: '#374151', letterSpacing: '0.1em', textTransform: 'uppercase', padding: '0 2px', marginBottom: 8 }}>
              {sources.length === 1 ? '1 document' : `${sources.length} documents`}
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {sources.map(s => (
                <div key={s.id}
                  onMouseEnter={() => setHovered(s.id)}
                  onMouseLeave={() => setHovered(null)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', borderRadius: 12,
                    background: s.status === 'error' ? 'rgba(239,68,68,0.06)' : s.status === 'ready' && hovered === s.id ? 'rgba(139,92,246,0.1)' : '#1a1530',
                    border: `1px solid ${s.status === 'error' ? 'rgba(239,68,68,0.2)' : s.status !== 'ready' ? 'rgba(251,191,36,0.2)' : hovered === s.id ? 'rgba(139,92,246,0.25)' : 'rgba(255,255,255,0.08)'}`,
                    transition: 'all 0.15s',
                  }}
                >
                  <TypeChip type={s.type} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: 13, fontWeight: 600, color: '#e5e7eb', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={s.name}>{s.name}</p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 3 }}>
                      {s.size > 0 && <span style={{ fontSize: 11, color: '#4b5563' }}>{fmt(s.size)}</span>}
                      {s.size > 0 && <span style={{ fontSize: 10, color: '#374151' }}>·</span>}
                      <StatusBadge status={s.status} />
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4, opacity: hovered === s.id ? 1 : 0, transition: 'opacity 0.15s' }}>
                    {/* View button — only for ready docs with a documentId */}
                    {s.status === 'ready' && s.documentId && (
                      <button
                        onClick={() => onViewDocument(s.documentId)}
                        title="View document"
                        style={{ width: 26, height: 26, borderRadius: 6, background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#a78bfa', transition: 'all 0.15s' }}
                        onMouseEnter={e => { e.currentTarget.style.background = 'rgba(139,92,246,0.15)' }}
                        onMouseLeave={e => { e.currentTarget.style.background = 'none' }}
                      >
                        <svg width="13" height="13" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
                        </svg>
                      </button>
                    )}

                    {/* Remove button */}
                    <button onClick={() => onRemoveSource(s.id)}
                      title="Remove source"
                      style={{ width: 26, height: 26, borderRadius: 6, background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#4b5563', transition: 'all 0.15s' }}
                      onMouseEnter={e => { e.currentTarget.style.color = '#f87171'; e.currentTarget.style.background = 'rgba(239,68,68,0.1)' }}
                      onMouseLeave={e => { e.currentTarget.style.color = '#4b5563'; e.currentTarget.style.background = 'none' }}
                    >
                      <svg width="13" height="13" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/></svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Empty info grid */}
        {sources.length === 0 && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8 }}>
            {[['📄', 'PDFs', 'Papers, reports'], ['📝', 'Text', 'Notes, transcripts'], ['📋', 'Word docs', 'DOCX files'], ['🔍', 'Hybrid RAG', 'Best-in-class search']].map(([icon, label, desc]) => (
              <div key={label} style={{ padding: '12px', borderRadius: 12, background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', transition: 'all 0.15s' }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(139,92,246,0.18)' }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)' }}>
                <div style={{ fontSize: 18, marginBottom: 6 }}>{icon}</div>
                <p style={{ fontSize: 12, fontWeight: 600, color: '#9ca3af', marginBottom: 2 }}>{label}</p>
                <p style={{ fontSize: 11, color: '#4b5563', lineHeight: 1.4 }}>{desc}</p>
              </div>
            ))}
          </div>
        )}

        {/* Ready banner */}
        {readyCount > 0 && (
          <div style={{ padding: '12px 14px', borderRadius: 12, background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)', display: 'flex', alignItems: 'flex-start', gap: 10 }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#34d399', marginTop: 5, flexShrink: 0, animation: 'pulse 2s infinite' }} />
            <p style={{ fontSize: 12, color: 'rgba(52,211,153,0.85)', lineHeight: 1.55, fontWeight: 500 }}>
              {readyCount === 1 ? 'Your document is indexed and ready. Start asking questions!' : `${readyCount} documents indexed and ready for research.`}
            </p>
          </div>
        )}
      </div>

      {/* Footer */}
      <div style={{ padding: '12px 18px', borderTop: '1px solid rgba(255,255,255,0.05)', textAlign: 'center' }}>
        <p style={{ fontSize: 11, color: '#374151', fontWeight: 500 }}>Hybrid dense + sparse retrieval</p>
      </div>
    </aside>
  )
}
