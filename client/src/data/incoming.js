// ===========================================================
// incoming.js: demo emails that "arrive" when you press
// "Sync new emails". The AI classifies them on arrival.
// Also holds follow-up messages for "Simulate reply".
// ===========================================================

export const incomingBatch = [
  {
    sender: 'Rachel Green', senderEmail: 'rachel@greenlegal.com',
    subject: 'Please sign the NDA before Monday',
    account: 'gmail',
    body: 'Hi Sarah,\n\nAttached is the NDA for the partnership. We need your signature before Monday so we can share the confidential roadmap.\n\nThanks,\nRachel',
  },
  {
    sender: 'Ben Carter', senderEmail: 'ben@carterfitness.com',
    subject: 'Can we reschedule our meeting to next week?',
    account: 'outlook',
    body: 'Hello,\n\nI have a conflict on Wednesday. Could we reschedule our meeting to next week? Let me know your availability.\n\nBen',
  },
  {
    sender: 'Spotify', senderEmail: 'no-reply@spotify.com',
    subject: 'Your weekly playlist is ready',
    account: 'gmail',
    body: 'Your new weekly playlist is ready. Unsubscribe from these notifications anytime.',
  },
  {
    sender: 'Aisha Khan', senderEmail: 'aisha@khanventures.com',
    subject: 'Quick question',
    account: 'outlook',
    body: 'Hi Sarah, are you around this week? Would love to catch up when you have a moment.',
  },
]

// Follow-up messages used by "Simulate reply" (picked by hint)
export const followUps = {
  escalate:
    'Update: this has become urgent. We need your personal approval and signature today, and the details are confidential.',
  routine:
    'Thanks! Could you confirm the schedule and send over your availability for next week?',
  fyi: 'Just a quick note, no action needed. This is an automated notification.',
}