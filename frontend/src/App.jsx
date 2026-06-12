import { useState } from 'react'
import AuthPage from './components/AuthPage'
import Sidebar from './components/Sidebar'
import ChatArea from './components/ChatArea'
import SourcesPanel from './components/SourcesPanel'
import DocumentViewer from './components/DocumentViewer'
import { ingestFile, createConversation, getDocumentUrl, getConversationDocuments } from './api'

export default function App() {
  const [token, setToken] = useState(() => localStorage.getItem('token') || '')
  const [userName, setUserName] = useState(() => localStorage.getItem('userName') || '')
  const [activeConv, setActiveConv] = useState(null)
  const [sidebarRefresh, setSidebarRefresh] = useState(0)
  const [sourcesByConv, setSourcesByConv] = useState({})
  const [showSources, setShowSources] = useState(true)
  const [newChatError, setNewChatError] = useState('')
  const [viewerDoc, setViewerDoc] = useState(null)   // { url, filename, type }

  const sources = activeConv ? (sourcesByConv[activeConv] || []) : []

  function setConvSources(convId, updater) {
    setSourcesByConv((prev) => ({
      ...prev,
      [convId]: typeof updater === 'function' ? updater(prev[convId] || []) : updater,
    }))
  }

  function handleAuth(t, name) {
    localStorage.setItem('token', t)
    localStorage.setItem('userName', name)
    setToken(t)
    setUserName(name)
  }

  function handleLogout() {
    localStorage.removeItem('token')
    localStorage.removeItem('userName')
    setToken('')
    setUserName('')
    setActiveConv(null)
    setSourcesByConv({})
  }

  function handleTitleUpdate() {
    setSidebarRefresh((n) => n + 1)
  }

  async function handleSelectConv(id) {
    setActiveConv(id)
    if (!showSources) setShowSources(true)

    // Load persisted documents from the DB only if not already in memory this session
    if (!sourcesByConv[id]) {
      try {
        const docs = await getConversationDocuments(token, id)
        if (docs.length > 0) {
          setConvSources(id, docs.map(d => ({
            id: d.id,
            name: d.filename,
            size: d.file_size,
            type: d.file_type,
            status: 'ready',
            documentId: d.id,
          })))
        }
      } catch {
        // silently ignore — sources panel will just be empty
      }
    }
  }

  async function handleNewChat() {
    setNewChatError('')
    try {
      const { ok, status, data } = await createConversation(token)
      if (status === 401) {
        handleLogout()
        return
      }
      if (!ok || !data?.id) {
        setNewChatError(data?.detail || 'Failed to create notebook. Please try again.')
        return
      }
      setSidebarRefresh((n) => n + 1)
      handleSelectConv(data.id)
      return data.id
    } catch {
      setNewChatError('Could not reach the backend. Make sure the server is running on port 8000.')
    }
  }

  async function handleAddSource(file) {
    if (!activeConv) return
    const id = Date.now() + Math.random()
    setConvSources(activeConv, (prev) => [
      ...prev,
      { id, name: file.name, size: file.size, type: file.name.split('.').pop().toLowerCase(), status: 'uploading', documentId: null },
    ])
    const { ok, documentId } = await ingestFile(token, file, activeConv)
    setConvSources(activeConv, (prev) =>
      prev.map((s) => (s.id === id ? { ...s, status: ok ? 'ready' : 'error', documentId } : s))
    )
  }

  async function handleViewDocument(documentId) {
    const doc = await getDocumentUrl(token, documentId)
    if (doc) setViewerDoc(doc)
  }

  function handleRemoveSource(id) {
    if (!activeConv) return
    setConvSources(activeConv, (prev) => prev.filter((s) => s.id !== id))
  }

  if (!token) return <AuthPage onAuth={handleAuth} />

  return (
    <div className="flex h-screen overflow-hidden" style={{background: '#0d0b18'}}>
      <Sidebar
        token={token}
        userName={userName}
        activeId={activeConv}
        onSelect={handleSelectConv}
        onNewChat={handleSelectConv}
        onLogout={handleLogout}
        refreshTrigger={sidebarRefresh}
      />
      <main className="flex-1 flex overflow-hidden min-w-0">
        <ChatArea
          token={token}
          convId={activeConv}
          sources={sources}
          onTitleUpdate={handleTitleUpdate}
          onToggleSources={() => setShowSources((s) => !s)}
          showSources={showSources}
          onNewChat={handleNewChat}
          newChatError={newChatError}
        />
        {activeConv && showSources && (
          <SourcesPanel
            sources={sources}
            onAddSource={handleAddSource}
            onRemoveSource={handleRemoveSource}
            onClose={() => setShowSources(false)}
            onViewDocument={handleViewDocument}
          />
        )}
        {viewerDoc && (
          <DocumentViewer
            url={viewerDoc.url}
            filename={viewerDoc.filename}
            type={viewerDoc.type}
            onClose={() => setViewerDoc(null)}
          />
        )}
      </main>
    </div>
  )
}
