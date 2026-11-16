// ===========================================================
// gemini.js: asks Google Gemini to classify, summarise and draft.
// Throws an error on any problem so the caller can fall back.
// ===========================================================

const VALID = ['assistant', 'client', 'none']

async function callGemini(prompt, expectJson) {
  const key = process.env.GEMINI_API_KEY
  if (!key) throw new Error('No GEMINI_API_KEY set')

  const model = process.env.GEMINI_MODEL || 'gemini-3.5-flash-lite'
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`

  const body = {
    contents: [{ parts: [{ text: prompt }] }],
    generationConfig: expectJson
      ? { responseMimeType: 'application/json', temperature: 0.2 }
      : { temperature: 0.6 },
  }

  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), 15000) // give up after 15 s

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-goog-api-key': key },
      body: JSON.stringify(body),
      signal: controller.signal,
    })
    if (!res.ok) {
      const detail = (await res.text()).slice(0, 200)
      throw new Error(`Gemini returned ${res.status}: ${detail}`)
    }
    const data = await res.json()
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text
    if (!text) throw new Error('Gemini returned no text')
    return text
  } finally {
    clearTimeout(timer)
  }
}

async function classifyWithGemini(email) {
  const prompt = `You are an assistant helping a personal assistant manage a client's inbox.
Decide WHO should reply to this email. Choose exactly one:
- "assistant": routine admin work, scheduling, general inquiries, follow-ups, invoices.
- "client": personal decisions, important approvals, sensitive or private matters needing the client personally.
- "none": newsletters, notifications, receipts, confirmations, informational emails.

Return ONLY JSON with these keys:
{"classification":"assistant|client|none","confidence":0.0-1.0,"summary":"one sentence, max 25 words","reason":"one sentence explaining the choice"}
Use a lower confidence when the email is ambiguous.

From: ${email.sender} <${email.senderEmail}>
Subject: ${email.subject}
Body:
${email.body}`

  const text = await callGemini(prompt, true)
  const parsed = JSON.parse(text.replace(/```json|```/g, '').trim())

  if (!VALID.includes(parsed.classification)) throw new Error('Invalid classification')
  const confidence = Math.max(0, Math.min(1, Number(parsed.confidence)))
  if (Number.isNaN(confidence)) throw new Error('Invalid confidence')

  return {
    classification: parsed.classification,
    confidence: Math.round(confidence * 100) / 100,
    summary: String(parsed.summary || '').slice(0, 200),
    reason: String(parsed.reason || '').slice(0, 300),
    engine: 'ai',
  }
}

async function draftWithGemini(email) {
  const prompt = `Write a short, polite, professional reply (under 90 words) to the email below.
The reply is written by a personal assistant on behalf of their client, Sarah.
Do not invent facts, dates or commitments. Where a decision is needed, say the client will confirm.
Return only the reply text, with a greeting. End with exactly: "Best regards,\nAlex, Assistant to Sarah". Never use placeholders like [Your Name].

From: ${email.sender}
Subject: ${email.subject}
Body:
${email.body}`
  return (await callGemini(prompt, false)).trim()
}

module.exports = { classifyWithGemini, draftWithGemini }