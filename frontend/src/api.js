const BASE = 'http://localhost:8000'

const h = (token) => ({
  'Content-Type': 'application/json',
  Authorization: `Bearer ${token}`,
})

export async function login(email, password) {
  const r = await fetch(`${BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  })
  return { ok: r.ok, data: await r.json() }
}

export async function signup(name, email, password) {
  const r = await fetch(`${BASE}/auth/signup`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, email, password }),
  })
  return { ok: r.ok, data: await r.json() }
}

export async function getConversations(token) {
  const r = await fetch(`${BASE}/conversations/`, { headers: h(token) })
  return r.ok ? r.json() : []
}

export async function createConversation(token) {
  const r = await fetch(`${BASE}/conversations/`, {
    method: 'POST',
    headers: h(token),
    body: JSON.stringify({ title: 'New Chat' }),
  })
  return { ok: r.ok, status: r.status, data: await r.json() }
}

export async function updateConversationTitle(token, id, title) {
  await fetch(`${BASE}/conversations/${id}`, {
    method: 'PATCH',
    headers: h(token),
    body: JSON.stringify({ title }),
  })
}

export async function getMessages(token, convId) {
  const r = await fetch(`${BASE}/conversations/${convId}/messages`, {
    headers: h(token),
  })
  return r.ok ? r.json() : []
}

export async function sendMessage(token, query, convId) {
  const r = await fetch(`${BASE}/chat/chat`, {
    method: 'POST',
    headers: h(token),
    body: JSON.stringify({ query, conversation_id: convId }),
  })
  return { ok: r.ok, data: await r.json() }
}

export async function ingestFile(token, file, conversationId) {
  const form = new FormData()
  form.append('file', file)
  if (conversationId != null) form.append('conversation_id', conversationId)
  const r = await fetch(`${BASE}/ingest/ingest/`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: form,
  })
  const data = r.ok ? await r.json() : null
  return { ok: r.ok, documentId: data?.id ?? null }
}

export async function getDocumentUrl(token, docId) {
  const r = await fetch(`${BASE}/documents/${docId}/url`, {
    headers: { Authorization: `Bearer ${token}` },
  })
  return r.ok ? r.json() : null
}

export async function getConversationDocuments(token, conversationId) {
  const r = await fetch(`${BASE}/documents/?conversation_id=${conversationId}`, {
    headers: { Authorization: `Bearer ${token}` },
  })
  return r.ok ? r.json() : []
}
