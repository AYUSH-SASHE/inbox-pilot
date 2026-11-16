require('dotenv').config()
const express = require('express')
const cors = require('cors')
const { classifyByRules, draftByRules } = require('./rulesClassifier')
const { classifyWithGemini, draftWithGemini } = require('./gemini')
const emailRoutes = require('./emailRoutes')

const app = express()

// In production, set CLIENT_URL to the deployed Vercel URL.
// Local Vite development remains allowed.
const allowedOrigins = (process.env.CLIENT_URL || '')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean)

const corsOptions = {
  origin(origin, callback) {
    if (!origin) return callback(null, true) // health checks / server-to-server
    const isLocal = /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin)
    const isAllowed = allowedOrigins.includes(origin)
    if (isLocal || isAllowed) return callback(null, true)
    return callback(new Error('Origin not allowed by CORS'))
  },
}

app.use(cors(corsOptions))
app.use(express.json({ limit: '1mb' }))
app.use('/api/emails', emailRoutes)

app.get('/', (req, res) => res.json({ name: 'Inbox Pilot API', ok: true }))

app.get('/api/health', (req, res) => {
  res.json({ ok: true, geminiConfigured: Boolean(process.env.GEMINI_API_KEY) })
})

app.post('/api/ai/classify', async (req, res) => {
  const email = req.body
  if (!email || !email.subject || !email.body) {
    return res.status(400).json({ error: 'subject and body are required' })
  }
  email.sender = email.sender || 'Unknown'
  email.senderEmail = email.senderEmail || ''

  try {
    const result = await classifyWithGemini(email)
    return res.json(result)
  } catch (err) {
    console.log('Gemini unavailable, using rules:', err.message)
    return res.json(classifyByRules(email))
  }
})

app.post('/api/ai/draft', async (req, res) => {
  const email = req.body
  if (!email || !email.subject || !email.body) {
    return res.status(400).json({ error: 'subject and body are required' })
  }
  email.sender = email.sender || 'there'

  try {
    const draft = await draftWithGemini(email)
    return res.json({ draft, engine: 'ai' })
  } catch (err) {
    console.log('Gemini unavailable, using template:', err.message)
    return res.json({ draft: draftByRules(email), engine: 'rules' })
  }
})

// Keep the server alive on the port assigned by Render/Railway.
const PORT = process.env.PORT || 5000
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Inbox Pilot API listening on port ${PORT}`)
})
