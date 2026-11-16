// ===========================================================
// emailRoutes.js: stores emails in a JSON file (db.json).
// Every change from either dashboard is saved here.
// ===========================================================
const fs = require('fs')
const path = require('path')
const express = require('express')

const FILE = path.join(__dirname, 'db.json')
const router = express.Router()

function readAll() {
  try {
    return JSON.parse(fs.readFileSync(FILE, 'utf8'))
  } catch {
    return [] // no file yet
  }
}

function writeAll(list) {
  fs.writeFileSync(FILE, JSON.stringify(list, null, 2))
}

// Get every email
router.get('/', (req, res) => {
  res.json(readAll())
})

// First run only: fill the empty database with the demo emails
router.post('/seed', (req, res) => {
  if (readAll().length === 0 && Array.isArray(req.body.emails)) {
    writeAll(req.body.emails)
  }
  res.json({ ok: true })
})

// Replace everything with fresh demo data (the "reset" action)
router.post('/reset', (req, res) => {
  if (!Array.isArray(req.body.emails)) {
    return res.status(400).json({ error: 'emails array required' })
  }
  writeAll(req.body.emails)
  res.json({ ok: true })
})

// Add new emails to the top (used by "Sync new emails")
router.post('/', (req, res) => {
  if (!Array.isArray(req.body.emails)) {
    return res.status(400).json({ error: 'emails array required' })
  }
  writeAll([...req.body.emails, ...readAll()])
  res.json({ ok: true })
})

// Change one email (star, archive, classification, handled, ...)
router.patch('/:id', (req, res) => {
  const id = Number(req.params.id)
  const list = readAll()
  const index = list.findIndex((e) => e.id === id)
  if (index === -1) return res.status(404).json({ error: 'Email not found' })
  list[index] = { ...list[index], ...req.body }
  writeAll(list)
  res.json(list[index])
})

module.exports = router