// ===========================================================
// emailStore.js: the single source of truth for emails.
// - Changes show instantly on screen, then save to the server.
// - Every 3 seconds we check the server for changes made by
//   the other dashboard (assistant <-> client sync).
// - If the server is off, the app keeps working from the
//   browser copy (localStorage).
// ===========================================================
import { useSyncExternalStore } from 'react'
import { sampleEmails } from '../data/emails.js'

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000'
const KEY = 'inboxpilot_emails_v1'
const listeners = new Set()

function loadLocal() {
  try {
    const saved = JSON.parse(localStorage.getItem(KEY))
    if (Array.isArray(saved) && saved.length) return saved
  } catch {
    /* fall back to sample data */
  }
  return sampleEmails
}

let emails = loadLocal()
let pending = 0 // saves still travelling to the server

function notify() {
  listeners.forEach((fn) => fn())
}

function setEmails(next) {
  emails = next
  try {
    localStorage.setItem(KEY, JSON.stringify(emails))
  } catch {
    /* storage full or blocked: keep working in memory */
  }
  notify()
}

async function api(path, options) {
  const res = await fetch(API + path, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  })
  if (!res.ok) throw new Error('Server error ' + res.status)
  return res.json()
}

// Save to the server in the background. Failures are tolerated.
async function save(path, options) {
  pending++
  try {
    await api(path, options)
  } catch {
    /* server off: the browser copy still has the change */
  } finally {
    pending--
  }
}

export function updateEmail(id, changes) {
  setEmails(emails.map((e) => (e.id === id ? { ...e, ...changes } : e)))
  save(`/api/emails/${id}`, { method: 'PATCH', body: JSON.stringify(changes) })
}

export function addEmails(newEmails) {
  setEmails([...newEmails, ...emails])
  save('/api/emails', { method: 'POST', body: JSON.stringify({ emails: newEmails }) })
}

export function resetEmails() {
  setEmails(sampleEmails)
  save('/api/emails/reset', { method: 'POST', body: JSON.stringify({ emails: sampleEmails }) })
}

export function getEmails() {
  return emails
}

// Ask the server for the latest emails
async function refresh() {
  if (pending > 0) return // do not overwrite changes still being saved
  try {
    const remote = await api('/api/emails')
    if (pending > 0) return
    if (remote.length === 0) {
      // First run: put the current emails on the server
      await api('/api/emails/seed', { method: 'POST', body: JSON.stringify({ emails }) })
      return
    }
    if (JSON.stringify(remote) !== JSON.stringify(emails)) setEmails(remote)
  } catch {
    /* server off: keep using the browser copy */
  }
}

refresh()
setInterval(refresh, 3000)

// Fallback sync between tabs when the server is off
window.addEventListener('storage', (e) => {
  if (e.key === KEY) {
    emails = loadLocal()
    notify()
  }
})

function subscribe(fn) {
  listeners.add(fn)
  return () => listeners.delete(fn)
}

export function useEmails() {
  return useSyncExternalStore(subscribe, () => emails)
}