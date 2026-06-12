import { useState } from 'react'

function CopyCodeButton({ code }) {
  const [copied, setCopied] = useState(false)
  function copy() {
    navigator.clipboard.writeText(code).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }
  return (
    <button
      onClick={copy}
      className={`flex items-center gap-1.5 px-2 py-1 rounded text-[10px] font-semibold transition-all duration-150 ${
        copied ? 'text-emerald-400' : 'text-slate-600 hover:text-slate-300'
      }`}
    >
      {copied ? (
        <>
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
          </svg>
          Copied
        </>
      ) : (
        <>
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
          Copy
        </>
      )}
    </button>
  )
}

function renderInline(text) {
  const segments = text.split(/(\*\*(?:[^*]|\*(?!\*))+\*\*|`[^`]+`|\*(?:[^*]|\*(?!\*))+\*)/g)
  return segments.map((seg, i) => {
    if (seg.startsWith('**') && seg.endsWith('**') && seg.length > 4)
      return <strong key={i} className="font-semibold text-zinc-100">{seg.slice(2, -2)}</strong>
    if (seg.startsWith('`') && seg.endsWith('`') && seg.length > 2)
      return (
        <code key={i} className="bg-indigo-500/15 border border-indigo-500/20 px-1.5 py-0.5 rounded text-[0.82em] text-indigo-300 font-mono">
          {seg.slice(1, -1)}
        </code>
      )
    if (seg.startsWith('*') && seg.endsWith('*') && seg.length > 2 && !seg.startsWith('**'))
      return <em key={i} className="italic text-zinc-300">{seg.slice(1, -1)}</em>
    return seg
  })
}

export default function MarkdownRenderer({ content }) {
  if (!content) return null

  const blockParts = []
  const codeRe = /```(\w*)\n?([\s\S]*?)```/g
  let lastIdx = 0, m

  while ((m = codeRe.exec(content)) !== null) {
    if (m.index > lastIdx) blockParts.push({ t: 'text', v: content.slice(lastIdx, m.index) })
    blockParts.push({ t: 'code', lang: m[1], v: m[2].trimEnd() })
    lastIdx = m.index + m[0].length
  }
  if (lastIdx < content.length) blockParts.push({ t: 'text', v: content.slice(lastIdx) })

  return (
    <div className="text-[14px] leading-relaxed">
      {blockParts.map((block, bi) => {
        if (block.t === 'code') {
          return (
            <div key={bi} className="my-3 rounded-xl overflow-hidden border border-white/[0.08] bg-[#111114]">
              <div className="flex items-center justify-between px-4 py-2 border-b border-white/[0.06] bg-white/[0.02]">
                <span className="text-[10px] text-slate-600 uppercase tracking-wider font-mono font-bold">
                  {block.lang || 'code'}
                </span>
                <CopyCodeButton code={block.v} />
              </div>
              <pre className="p-4 overflow-x-auto text-[13px]">
                <code className="font-mono text-indigo-300/90 leading-relaxed">{block.v}</code>
              </pre>
            </div>
          )
        }

        const lines = block.v.split('\n')
        const elements = []
        let listItems = []
        let listType = null

        const flushList = () => {
          if (!listItems.length) return
          const Tag = listType === 'ol' ? 'ol' : 'ul'
          const cls = listType === 'ol'
            ? 'list-decimal pl-5 my-2 space-y-1 text-zinc-300'
            : 'list-disc pl-5 my-2 space-y-1 text-zinc-300'
          elements.push(
            <Tag key={`L${elements.length}`} className={cls}>
              {listItems.map((item, i) => <li key={i}>{renderInline(item)}</li>)}
            </Tag>
          )
          listItems = []
          listType = null
        }

        lines.forEach((line, li) => {
          if (/^# /.test(line)) {
            flushList()
            elements.push(
              <p key={li} className="font-bold text-zinc-100 text-[1rem] mt-4 mb-1.5 border-b border-white/[0.06] pb-1.5">
                {renderInline(line.replace(/^# /, ''))}
              </p>
            )
          } else if (/^## /.test(line)) {
            flushList()
            elements.push(
              <p key={li} className="font-semibold text-zinc-100 text-[0.95rem] mt-3.5 mb-1">
                {renderInline(line.replace(/^## /, ''))}
              </p>
            )
          } else if (/^### /.test(line)) {
            flushList()
            elements.push(
              <p key={li} className="font-semibold text-zinc-200 text-[0.9rem] mt-3 mb-0.5">
                {renderInline(line.replace(/^### /, ''))}
              </p>
            )
          } else if (/^[-*] /.test(line)) {
            if (listType === 'ol') flushList()
            listType = 'ul'
            listItems.push(line.slice(2))
          } else if (/^\d+\. /.test(line)) {
            if (listType === 'ul') flushList()
            listType = 'ol'
            listItems.push(line.replace(/^\d+\. /, ''))
          } else if (/^---+$/.test(line.trim())) {
            flushList()
            elements.push(<hr key={li} className="border-white/[0.07] my-4" />)
          } else if (line.trim() === '') {
            flushList()
            if (elements.length > 0) elements.push(<div key={li} className="h-2" />)
          } else {
            flushList()
            elements.push(<p key={li} className="text-zinc-300 leading-relaxed">{renderInline(line)}</p>)
          }
        })
        flushList()

        return <div key={bi}>{elements}</div>
      })}
    </div>
  )
}
