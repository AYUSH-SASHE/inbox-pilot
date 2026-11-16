// ===========================================================
// rulesClassifier.js: works with no API key and no internet.
// Scores keywords, picks a class, and reports confidence.
// ===========================================================

const CLIENT_WORDS = [
  'signature', 'sign ', 'approve', 'approval', 'your decision', 'confidential',
  'settlement', 'board', 'offer', 'salary', 'results', 'personally',
  'performance review', 'investor', 'family', 'sensitive', 'contract',
]
const ASSISTANT_WORDS = [
  'reschedule', 'move ', 'call', 'meeting', 'appointment', 'confirm',
  'schedule', 'invoice', 'due', 'follow up', 'following up', 'quick question',
  'pricing', 'rates', 'book', 'booking', 'availability', 'headshot', 'logistics',
]
const NOREPLY_WORDS = [
  'newsletter', 'unsubscribe', 'receipt', 'notification', 'noreply', 'no-reply',
  'confirmed', 'statement', 'weekly', 'what’s new', 'viewed your profile',
  'recording', 'reminder', 'build passed',
]

function countHits(text, words) {
  return words.filter((w) => text.includes(w)).length
}

function firstSentence(text) {
  const clean = text.replace(/\s+/g, ' ').trim()
  const end = clean.search(/[.!?]\s/)
  const s = end > 20 ? clean.slice(0, end + 1) : clean.slice(0, 140)
  return s.length > 140 ? s.slice(0, 137) + '…' : s
}

function classifyByRules(email) {
  const text = `${email.subject} ${email.body} ${email.senderEmail}`.toLowerCase()

  const scores = {
    client: countHits(text, CLIENT_WORDS),
    assistant: countHits(text, ASSISTANT_WORDS),
    none: countHits(text, NOREPLY_WORDS),
  }

  // Automated senders are almost always "no reply"
  if (/no-?reply|notifications?@|receipts?@|alerts?@|news@/.test(email.senderEmail.toLowerCase())) {
    scores.none += 3
  }

  const ranked = Object.entries(scores).sort((a, b) => b[1] - a[1])
  const [best, top] = ranked[0]
  const second = ranked[1][1]

  let classification = best
  if (top === 0) classification = 'assistant' // unknown: safest default is a human review

  // Confidence grows with the gap between first and second place
  let confidence = top === 0 ? 0.4 : Math.min(0.55 + (top - second) * 0.12 + top * 0.03, 0.9)
  confidence = Math.round(confidence * 100) / 100

  const reasons = {
    client: 'Contains signals of a personal decision, approval or sensitive matter.',
    assistant: 'Looks like routine administrative work such as scheduling, billing or a follow-up.',
    none: 'Looks like an automated notification, newsletter or receipt with no action needed.',
  }

  return {
    classification,
    confidence,
    summary: firstSentence(email.body),
    reason: reasons[classification] + ' (Rule-based analysis)',
    engine: 'rules',
  }
}

function draftByRules(email) {
  const first = email.sender.split(' ')[0]
  if (email.classification === 'none') {
    return 'No reply is needed for this email.'
  }
  if (email.classification === 'client') {
    return `Hi ${first},\n\nThank you for your email. I have received it and will review it personally. I will get back to you shortly.\n\nBest regards,\nSarah`
  }
  return `Hi ${first},\n\nThank you for your message. I have noted the details and will follow up with you shortly to confirm next steps.\n\nBest regards,\nAlex (on behalf of Sarah)`
}

module.exports = { classifyByRules, draftByRules }