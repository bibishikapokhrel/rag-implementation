import { useState } from 'react'
import { login, signup } from '../api'

export default function AuthPage({ onAuth }) {
  const [tab, setTab] = useState('login')
  const [form, setForm] = useState({ name: '', email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }))

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const { ok, data } = tab === 'login'
        ? await login(form.email, form.password)
        : await signup(form.name, form.email, form.password)
      if (ok) {
        onAuth(data.access_token, data.user_name)
      } else {
        setError(data.detail || (tab === 'login' ? 'Invalid credentials' : 'Signup failed'))
      }
    } catch {
      setError('Could not connect to server')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', background: '#0d0b18' }}>

      {/* ══════════════════════════════════════════
          LEFT  —  Hero
      ══════════════════════════════════════════ */}
      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        padding: '52px 56px',
        position: 'relative',
        overflow: 'hidden',
        background: 'linear-gradient(135deg, #120824 0%, #0e0619 60%, #0d0b18 100%)',
      }} className="hidden lg:flex">

        {/* ── Animated gradient blobs ── */}
        <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>
          <div className="blob-a" style={{
            position: 'absolute', top: '-15%', left: '-10%',
            width: 700, height: 700, borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(109,40,217,0.55) 0%, transparent 65%)',
            filter: 'blur(1px)',
          }} />
          <div className="blob-b" style={{
            position: 'absolute', bottom: '-20%', right: '-5%',
            width: 600, height: 600, borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(168,85,247,0.35) 0%, transparent 65%)',
          }} />
          <div className="blob-c" style={{
            position: 'absolute', top: '35%', left: '45%',
            width: 400, height: 400, borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(236,72,153,0.18) 0%, transparent 65%)',
          }} />
          {/* Dot grid */}
          <div style={{
            position: 'absolute', inset: 0,
            backgroundImage: 'radial-gradient(circle, rgba(167,139,250,0.5) 1px, transparent 1px)',
            backgroundSize: '30px 30px',
            opacity: 0.25,
            maskImage: 'radial-gradient(ellipse 75% 75% at 30% 40%, black 15%, transparent 80%)',
            WebkitMaskImage: 'radial-gradient(ellipse 75% 75% at 30% 40%, black 15%, transparent 80%)',
          }} />
        </div>

        {/* ── Logo ── */}
        <div style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{
            width: 38, height: 38, borderRadius: 12,
            background: 'linear-gradient(135deg, #7c3aed, #a855f7)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 4px 24px rgba(124,58,237,0.5)',
          }}>
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"/>
            </svg>
          </div>
          <span style={{ fontSize: 20, fontWeight: 800, color: '#fff', letterSpacing: '-0.5px' }}>DocMind</span>
        </div>

        {/* ── Hero text ── */}
        <div style={{ position: 'relative', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', maxWidth: 540, marginTop: 16 }}>

          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            padding: '6px 14px', borderRadius: 999,
            background: 'rgba(139,92,246,0.15)',
            border: '1px solid rgba(139,92,246,0.3)',
            marginBottom: 28, width: 'fit-content',
          }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#a78bfa', animation: 'pulse 2s infinite' }} />
            <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#c4b5fd' }}>
              Gemini Flash · Qdrant · Hybrid RAG
            </span>
          </div>

          <h1 style={{ fontSize: 68, fontWeight: 900, lineHeight: 1.0, letterSpacing: '-3px', marginBottom: 24, color: '#fff' }}>
            Talk to<br />
            <span style={{
              background: 'linear-gradient(135deg, #f0abfc 0%, #c084fc 25%, #a855f7 55%, #7c3aed 100%)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
            }}>your docs.</span>
          </h1>

          <p style={{ fontSize: 16, lineHeight: 1.7, color: '#9ca3af', maxWidth: 420, marginBottom: 40 }}>
            Upload PDFs, Word files, and text documents. Ask anything in plain English — get precise answers grounded in your material.
          </p>

          <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 48px 0', display: 'flex', flexDirection: 'column', gap: 14 }}>
            {[
              'Multi-document support — PDF, DOCX, TXT',
              'Hybrid dense + sparse retrieval for accuracy',
              'Persistent notebooks with full history',
              'Answers grounded in your sources',
            ].map(text => (
              <li key={text} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{
                  width: 20, height: 20, borderRadius: '50%', flexShrink: 0,
                  background: 'rgba(139,92,246,0.2)',
                  border: '1px solid rgba(139,92,246,0.4)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <svg width="10" height="10" viewBox="0 0 12 12" fill="none">
                    <path d="M2 6l3 3 5-5" stroke="#a78bfa" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <span style={{ fontSize: 14, color: '#d1d5db' }}>{text}</span>
              </li>
            ))}
          </ul>

          {/* ── Chat preview ── */}
          <div style={{
            borderRadius: 16,
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.1)',
            overflow: 'hidden',
            boxShadow: '0 20px 60px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.04) inset',
          }}>
            {/* Window bar */}
            <div style={{
              display: 'flex', alignItems: 'center', gap: 6,
              padding: '10px 14px',
              borderBottom: '1px solid rgba(255,255,255,0.07)',
              background: 'rgba(255,255,255,0.03)',
            }}>
              <div style={{ width: 10, height: 10, borderRadius: '50%', background: 'rgba(239,68,68,0.6)' }} />
              <div style={{ width: 10, height: 10, borderRadius: '50%', background: 'rgba(234,179,8,0.5)' }} />
              <div style={{ width: 10, height: 10, borderRadius: '50%', background: 'rgba(34,197,94,0.6)' }} />
              <div style={{ marginLeft: 10, height: 16, borderRadius: 4, width: 120, background: 'rgba(255,255,255,0.07)' }} />
            </div>

            <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>
              {/* Source file pill */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, paddingBottom: 10, borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                <div style={{ padding: '2px 8px', borderRadius: 6, background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.22)' }}>
                  <span style={{ fontSize: 9, fontWeight: 700, color: '#f87171' }}>PDF</span>
                </div>
                <span style={{ fontSize: 11, color: '#6b7280' }}>research_paper_2024.pdf</span>
                <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 5, padding: '2px 8px', borderRadius: 999, background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.2)' }}>
                  <div style={{ width: 5, height: 5, borderRadius: '50%', background: '#34d399' }} />
                  <span style={{ fontSize: 9, fontWeight: 700, color: '#34d399' }}>Indexed</span>
                </div>
              </div>

              {/* User message */}
              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <div style={{
                  maxWidth: '72%', padding: '9px 14px', borderRadius: '16px 16px 4px 16px',
                  background: 'linear-gradient(135deg, #7c3aed, #6d28d9)',
                  fontSize: 11, color: '#fff', lineHeight: 1.5,
                  boxShadow: '0 4px 12px rgba(109,40,217,0.4)',
                }}>
                  What are the key findings of this paper?
                </div>
              </div>

              {/* AI response */}
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                <div style={{
                  width: 24, height: 24, borderRadius: 8, flexShrink: 0, marginTop: 2,
                  background: 'linear-gradient(135deg, #7c3aed, #a855f7)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="white">
                    <path d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"/>
                  </svg>
                </div>
                <div style={{
                  flex: 1, padding: '10px 14px', borderRadius: '4px 16px 16px 16px',
                  background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.09)',
                  fontSize: 11, color: '#d1d5db', lineHeight: 1.6,
                }}>
                  The study presents <span style={{ color: '#c084fc', fontWeight: 600 }}>three key findings</span>: hybrid retrieval outperforms dense-only search by 23%, achieving near-perfect recall…
                </div>
              </div>

              {/* Skeleton lines */}
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, opacity: 0.35 }}>
                <div style={{ width: 24, height: 24, borderRadius: 8, flexShrink: 0, background: 'rgba(255,255,255,0.07)' }} />
                <div style={{ flex: 1, paddingTop: 4, display: 'flex', flexDirection: 'column', gap: 7 }}>
                  <div className="skeleton" style={{ height: 8, width: '88%' }} />
                  <div className="skeleton" style={{ height: 8, width: '62%' }} />
                </div>
              </div>
            </div>
          </div>
        </div>

        <p style={{ position: 'relative', fontSize: 11, color: '#374151' }}>
          © 2025 DocMind · RAG Document Research Platform
        </p>
      </div>

      {/* ══════════════════════════════════════════
          RIGHT  —  Form
      ══════════════════════════════════════════ */}
      <div style={{
        flex: 1, maxWidth: 480,
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        padding: 40, position: 'relative',
        background: '#09071a',
        borderLeft: '1px solid rgba(255,255,255,0.06)',
      }}>
        {/* Background glow */}
        <div style={{
          position: 'absolute', top: '-10%', right: '-10%',
          width: 400, height: 400, borderRadius: '50%', pointerEvents: 'none',
          background: 'radial-gradient(circle, rgba(124,58,237,0.12) 0%, transparent 70%)',
        }} />
        <div style={{
          position: 'absolute', bottom: '-10%', left: '-10%',
          width: 300, height: 300, borderRadius: '50%', pointerEvents: 'none',
          background: 'radial-gradient(circle, rgba(168,85,247,0.08) 0%, transparent 70%)',
        }} />

        {/* Mobile logo */}
        <div className="lg:hidden" style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 32 }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: 'linear-gradient(135deg, #7c3aed, #a855f7)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"/>
            </svg>
          </div>
          <span style={{ fontSize: 18, fontWeight: 800, color: '#fff' }}>DocMind</span>
        </div>

        {/* ── Glass form card ── */}
        <div style={{
          position: 'relative', width: '100%', maxWidth: 400,
          borderRadius: 20, padding: 36,
          background: 'rgba(255,255,255,0.04)',
          border: '1px solid rgba(255,255,255,0.1)',
          backdropFilter: 'blur(24px)',
          boxShadow: '0 32px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.04) inset',
        }}>
          {/* Inner top glow */}
          <div style={{
            position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)',
            width: 200, height: 1, pointerEvents: 'none',
            background: 'linear-gradient(90deg, transparent, rgba(167,139,250,0.5), transparent)',
          }} />

          {/* Heading */}
          <div style={{ marginBottom: 28 }}>
            <h2 style={{ fontSize: 26, fontWeight: 800, color: '#fff', letterSpacing: '-0.5px', marginBottom: 6 }}>
              {tab === 'login' ? 'Welcome back' : 'Create account'}
            </h2>
            <p style={{ fontSize: 13.5, color: '#6b7280' }}>
              {tab === 'login' ? 'Sign in to your research workspace' : 'Start for free — no credit card needed'}
            </p>
          </div>

          {/* Tab switcher */}
          <div style={{
            display: 'flex', padding: 4, borderRadius: 14, marginBottom: 24, gap: 4,
            background: 'rgba(255,255,255,0.05)',
            border: '1px solid rgba(255,255,255,0.08)',
          }}>
            {[['login', 'Sign In'], ['signup', 'Sign Up']].map(([t, label]) => (
              <button
                key={t}
                type="button"
                onClick={() => { setTab(t); setError('') }}
                style={{
                  flex: 1, padding: '9px 0', borderRadius: 10,
                  fontSize: 13, fontWeight: 700, cursor: 'pointer',
                  transition: 'all 0.2s',
                  ...(tab === t ? {
                    background: 'linear-gradient(135deg, #7c3aed, #9333ea)',
                    color: '#fff',
                    boxShadow: '0 2px 16px rgba(124,58,237,0.45)',
                    border: 'none',
                  } : {
                    background: 'transparent',
                    color: '#6b7280',
                    border: 'none',
                  }),
                }}
              >
                {label}
              </button>
            ))}
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {tab === 'signup' && (
              <InputField
                label="Full Name" type="text"
                value={form.name} onChange={set('name')} placeholder="Jane Smith"
                icon="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
              />
            )}
            <InputField
              label="Email address" type="email"
              value={form.email} onChange={set('email')} placeholder="you@example.com"
              icon="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
            />
            <InputField
              label="Password" type="password"
              value={form.password} onChange={set('password')} placeholder="••••••••"
              icon="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
            />

            {error && (
              <div style={{
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '12px 16px', borderRadius: 12,
                background: 'rgba(239,68,68,0.08)',
                border: '1px solid rgba(239,68,68,0.22)',
                color: '#f87171', fontSize: 13,
              }} className="animate-fadeInUp">
                <svg style={{ width: 14, height: 14, flexShrink: 0 }} fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd"/>
                </svg>
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%', padding: '13px 0', borderRadius: 12,
                fontSize: 14, fontWeight: 700, color: '#fff',
                background: loading ? 'rgba(124,58,237,0.5)' : 'linear-gradient(135deg, #7c3aed 0%, #9333ea 100%)',
                border: 'none', cursor: loading ? 'not-allowed' : 'pointer',
                boxShadow: loading ? 'none' : '0 4px 24px rgba(124,58,237,0.5)',
                transition: 'all 0.2s', marginTop: 4,
              }}
              onMouseEnter={e => { if (!loading) e.currentTarget.style.boxShadow = '0 6px 32px rgba(124,58,237,0.65)' }}
              onMouseLeave={e => { if (!loading) e.currentTarget.style.boxShadow = '0 4px 24px rgba(124,58,237,0.5)' }}
            >
              {loading ? (
                <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                  <svg style={{ width: 16, height: 16, animation: 'spin 1s linear infinite' }} fill="none" viewBox="0 0 24 24">
                    <circle style={{ opacity: 0.25 }} cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path style={{ opacity: 0.75 }} fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
                  </svg>
                  Please wait…
                </span>
              ) : tab === 'login' ? 'Sign In →' : 'Create Account →'}
            </button>
          </form>

          <p style={{ textAlign: 'center', fontSize: 13, color: '#4b5563', marginTop: 24 }}>
            {tab === 'login' ? "Don't have an account? " : 'Already have an account? '}
            <button
              type="button"
              onClick={() => { setTab(tab === 'login' ? 'signup' : 'login'); setError('') }}
              style={{ color: '#a78bfa', fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer', fontSize: 13 }}
              onMouseEnter={e => { e.target.style.color = '#c4b5fd' }}
              onMouseLeave={e => { e.target.style.color = '#a78bfa' }}
            >
              {tab === 'login' ? 'Sign up free' : 'Sign in'}
            </button>
          </p>
        </div>

        {/* Trust row */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 24, marginTop: 24, position: 'relative' }}>
          {[['🔒', 'Secure'], ['⚡', 'Sub-2s answers'], ['∞', 'Unlimited docs']].map(([icon, label]) => (
            <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ fontSize: 13 }}>{icon}</span>
              <span style={{ fontSize: 11, color: '#374151', fontWeight: 500 }}>{label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

/* ── Reusable dark input ── */
function InputField({ label, type, value, onChange, placeholder, icon }) {
  const [focused, setFocused] = useState(false)
  const [show, setShow] = useState(false)
  const isPassword = type === 'password'

  return (
    <div>
      <label style={{
        display: 'block', marginBottom: 6,
        fontSize: 10.5, fontWeight: 700, letterSpacing: '0.1em',
        textTransform: 'uppercase', color: '#4b5563',
      }}>
        {label}
      </label>
      <div style={{ position: 'relative' }}>
        {/* Left icon */}
        <svg
          style={{
            position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)',
            width: 15, height: 15, pointerEvents: 'none',
            color: focused ? '#a78bfa' : '#4b5563', transition: 'color 0.2s',
          }}
          fill="none" stroke="currentColor" viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={icon}/>
        </svg>

        <input
          type={isPassword && show ? 'text' : type}
          value={value}
          onChange={onChange}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          required
          placeholder={placeholder}
          style={{
            width: '100%',
            paddingLeft: 44,
            paddingRight: isPassword ? 44 : 16,
            paddingTop: 13, paddingBottom: 13,
            borderRadius: 12, fontSize: 14,
            color: '#f9fafb',
            background: focused ? '#1a1235' : '#130d24',
            border: `1.5px solid ${focused ? 'rgba(124,58,237,0.65)' : 'rgba(255,255,255,0.09)'}`,
            boxShadow: focused ? '0 0 0 3px rgba(124,58,237,0.2)' : '0 1px 4px rgba(0,0,0,0.4)',
            outline: 'none',
            transition: 'all 0.2s',
          }}
        />

        {/* Password toggle */}
        {isPassword && (
          <button
            type="button"
            tabIndex={-1}
            onClick={() => setShow(s => !s)}
            style={{
              position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)',
              background: 'none', border: 'none', cursor: 'pointer', padding: 0,
              color: show ? '#a78bfa' : '#4b5563', transition: 'color 0.15s',
            }}
            onMouseEnter={e => { e.currentTarget.style.color = '#a78bfa' }}
            onMouseLeave={e => { e.currentTarget.style.color = show ? '#a78bfa' : '#4b5563' }}
          >
            {show ? (
              <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"/>
              </svg>
            ) : (
              <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
              </svg>
            )}
          </button>
        )}
      </div>
    </div>
  )
}
