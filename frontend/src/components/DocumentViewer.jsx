import { useState } from 'react'

const VIEWABLE = ['pdf', 'txt']

export default function DocumentViewer({ url, filename, type, onClose }) {
  const [loaded, setLoaded] = useState(false)
  const canEmbed = VIEWABLE.includes(type)

  return (
    <div
      className="animate-slideInRight"
      style={{
        width: 520, flexShrink: 0,
        background: 'linear-gradient(180deg, #0e0b1e 0%, #0b0918 100%)',
        borderLeft: '1px solid rgba(255,255,255,0.07)',
        display: 'flex', flexDirection: 'column', height: '100vh',
      }}
    >
      {/* Header */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 12,
        padding: '14px 18px',
        borderBottom: '1px solid rgba(255,255,255,0.07)',
        flexShrink: 0,
      }}>
        {/* File type chip */}
        <div style={{
          padding: '3px 8px', borderRadius: 6, fontSize: 9, fontWeight: 800,
          letterSpacing: '0.06em', flexShrink: 0,
          ...(type === 'pdf'  ? { background: 'rgba(239,68,68,0.12)',  border: '1px solid rgba(239,68,68,0.25)',  color: '#f87171' } :
             type === 'txt'  ? { background: 'rgba(16,185,129,0.12)', border: '1px solid rgba(16,185,129,0.25)', color: '#34d399' } :
                               { background: 'rgba(59,130,246,0.12)', border: '1px solid rgba(59,130,246,0.25)', color: '#60a5fa' }),
        }}>
          {type?.toUpperCase()}
        </div>

        {/* Filename */}
        <span style={{
          flex: 1, fontSize: 13, fontWeight: 600, color: '#e5e7eb',
          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
        }} title={filename}>
          {filename}
        </span>

        <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
          {/* Open in new tab */}
          <a
            href={url}
            target="_blank"
            rel="noreferrer"
            title="Open in new tab"
            style={{
              width: 28, height: 28, borderRadius: 8, display: 'flex', alignItems: 'center',
              justifyContent: 'center', color: '#6b7280', textDecoration: 'none', transition: 'all 0.15s',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.07)'; e.currentTarget.style.color = '#d1d5db' }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#6b7280' }}
          >
            <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"/>
            </svg>
          </a>

          {/* Download */}
          <a
            href={url}
            download={filename}
            title="Download"
            style={{
              width: 28, height: 28, borderRadius: 8, display: 'flex', alignItems: 'center',
              justifyContent: 'center', color: '#6b7280', textDecoration: 'none', transition: 'all 0.15s',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.07)'; e.currentTarget.style.color = '#d1d5db' }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#6b7280' }}
          >
            <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/>
            </svg>
          </a>

          {/* Close */}
          <button
            onClick={onClose}
            title="Close viewer"
            style={{
              width: 28, height: 28, borderRadius: 8, background: 'none', border: 'none',
              cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#6b7280', transition: 'all 0.15s',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.1)'; e.currentTarget.style.color = '#f87171' }}
            onMouseLeave={e => { e.currentTarget.style.background = 'none'; e.currentTarget.style.color = '#6b7280' }}
          >
            <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>
        </div>
      </div>

      {/* Body */}
      <div style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
        {canEmbed ? (
          <>
            {/* Loading skeleton */}
            {!loaded && (
              <div style={{
                position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column',
                alignItems: 'center', justifyContent: 'center', gap: 16,
                background: '#0d0b18',
              }}>
                <div style={{
                  width: 44, height: 44, borderRadius: 12,
                  background: 'rgba(139,92,246,0.15)', border: '1px solid rgba(139,92,246,0.2)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <svg style={{ width: 20, height: 20, animation: 'spin 1s linear infinite' }} fill="none" viewBox="0 0 24 24">
                    <circle style={{ opacity: 0.2 }} cx="12" cy="12" r="10" stroke="rgba(167,139,250,0.8)" strokeWidth="3"/>
                    <path style={{ opacity: 0.8 }} fill="rgba(167,139,250,0.8)" d="M4 12a8 8 0 018-8v8H4z"/>
                  </svg>
                </div>
                <p style={{ fontSize: 13, color: '#6b7280' }}>Loading document…</p>
              </div>
            )}

            <iframe
              src={url}
              title={filename}
              onLoad={() => setLoaded(true)}
              style={{
                width: '100%', height: '100%', border: 'none',
                opacity: loaded ? 1 : 0,
                transition: 'opacity 0.3s ease',
                background: '#fff',
              }}
            />
          </>
        ) : (
          /* DOCX / unsupported — show download card */
          <div style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center',
            justifyContent: 'center', height: '100%', gap: 20, padding: 40,
            textAlign: 'center',
          }}>
            <div style={{
              width: 64, height: 64, borderRadius: 18,
              background: 'rgba(59,130,246,0.12)', border: '1px solid rgba(59,130,246,0.2)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <svg width="28" height="28" fill="none" stroke="rgba(96,165,250,0.85)" strokeWidth="1.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
              </svg>
            </div>

            <div>
              <p style={{ fontSize: 15, fontWeight: 700, color: '#e5e7eb', marginBottom: 6 }}>
                {filename}
              </p>
              <p style={{ fontSize: 13, color: '#6b7280', lineHeight: 1.6, maxWidth: 300 }}>
                <strong style={{ color: '#9ca3af' }}>.{type?.toUpperCase()}</strong> files can't be previewed in the browser. Download it to view.
              </p>
            </div>

            <a
              href={url}
              download={filename}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 8,
                padding: '11px 22px', borderRadius: 12,
                background: 'linear-gradient(135deg, #7c3aed, #9333ea)',
                color: '#fff', fontSize: 14, fontWeight: 700,
                textDecoration: 'none',
                boxShadow: '0 4px 20px rgba(124,58,237,0.4)',
                transition: 'all 0.2s',
              }}
              onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 6px 28px rgba(124,58,237,0.6)'; e.currentTarget.style.transform = 'scale(1.02)' }}
              onMouseLeave={e => { e.currentTarget.style.boxShadow = '0 4px 20px rgba(124,58,237,0.4)'; e.currentTarget.style.transform = 'scale(1)' }}
            >
              <svg width="15" height="15" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/>
              </svg>
              Download {filename}
            </a>
          </div>
        )}
      </div>
    </div>
  )
}
