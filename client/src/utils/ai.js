// ===========================================================
// ai.js: the browser's way of talking to the AI endpoints.
// If the server is off, these throw an error and the UI shows
// a friendly message instead of breaking.
// ===========================================================

import { API_URL as API } from './serverStatus.js'

async function post(path, email) {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), 20000)
  try {
    const res = await fetch(API + path, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sender: email.sender,
        senderEmail: email.senderEmail,
        subject: email.subject,
        body: email.body,
        classification: email.classification,
      }),
      signal: controller.signal,
    })
    if (!res.ok) throw new Error('Server error')
    return await res.json()
  } finally {
    clearTimeout(timer)
  }
}

export const analyzeEmail = (email) => post('/api/ai/classify', email)
export const draftReply = (email) => post('/api/ai/draft', email)

// Analyze a whole conversation (original + new messages) as one text
export const analyzeThread = (email, thread) =>
  post('/api/ai/classify', {
    ...email,
    body: `${email.body}\n\n--- New message in this conversation ---\n${thread}`,
  })