// ===========================================================
// emailHelpers.js: small functions that work out views,
// counts and dates from the email data.
// ===========================================================
import { LOW_CONFIDENCE } from '../data/emails.js'

// Is the AI unsure about this email?
export function needsReview(email) {
  return !email.manuallyChanged && email.confidence < LOW_CONFIDENCE
}

// Does this email belong to a sidebar view?
export function inView(email, view) {
  const active = email.status !== 'archived'
  switch (view) {
    case 'all':
      return active
    case 'action':
      return active && email.status === 'open' && email.classification !== 'none'
    case 'assigned':
      return active && email.status === 'open' && email.classification === 'assistant'
    case 'client':
      return active && email.status === 'open' && email.classification === 'client'
    case 'important':
      return active && email.important
    case 'archived':
      return email.status === 'archived'
    default:
      return active
  }
}

// Count of emails in every view (for the sidebar)
export function viewCounts(emails) {
  const views = ['all', 'action', 'assigned', 'client', 'important', 'archived']
  const counts = {}
  views.forEach((v) => {
    counts[v] = emails.filter((e) => inView(e, v)).length
  })
  return counts
}

// Numbers for the four stat cards
export function getStats(emails) {
  const active = emails.filter((e) => e.status !== 'archived')
  return {
    unread: active.filter((e) => e.unread).length,
    action: emails.filter((e) => inView(e, 'action')).length,
    waiting: emails.filter((e) => inView(e, 'client')).length,
    important: emails.filter((e) => inView(e, 'important')).length,
  }
}

// "Today", "Yesterday" or "Nov 12"
export function formatDate(iso) {
  const d = new Date(iso)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const emailDay = new Date(d)
  emailDay.setHours(0, 0, 0, 0)
  const days = Math.floor((today - emailDay) / 86400000)
  if (days <= 0) return 'Today'
  if (days === 1) return 'Yesterday'
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

export function initials(name) {
  return name
    .split(' ')
    .map((p) => p[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()
}