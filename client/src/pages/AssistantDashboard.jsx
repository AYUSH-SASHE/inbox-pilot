import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { Menu, Search, Mail, Zap, Users, Star, Inbox, SearchX, CheckCircle2, RefreshCw } from 'lucide-react'
import Sidebar from '../components/Sidebar.jsx'
import EmailRow from '../components/EmailRow.jsx'
import EmailPanel from '../components/EmailPanel.jsx'
import ServerBanner from '../components/ServerBanner.jsx'
import { getUser, logout } from '../utils/auth.js'
import { useEmails, updateEmail, addEmails, getEmails } from '../store/emailStore.js'
import { analyzeEmail } from '../utils/ai.js'
import { incomingBatch } from '../data/incoming.js'
import { inView, viewCounts, getStats, needsReview } from '../utils/emailHelpers.js'
import '../styles/dashboard.css'

const titles = {
  all: ['All emails', 'Every conversation across all connected accounts'],
  action: ['Needs action', 'Emails that still require a reply'],
  assigned: ['Assigned to me', 'Emails you are responsible for'],
  client: ['Client attention', 'Emails waiting on a client decision'],
  important: ['Important', 'Emails you have starred'],
  archived: ['Archived', 'Emails you have put away'],
}

const classFilters = [
  { id: 'all', label: 'All' },
  { id: 'assistant', label: 'Assistant' },
  { id: 'client', label: 'Client' },
  { id: 'none', label: 'No reply' },
  { id: 'review', label: 'Needs review' },
]

export default function AssistantDashboard() {
  const navigate = useNavigate()
  const user = getUser()
  const emails = useEmails()

  const [view, setView] = useState('all')
  const [menuOpen, setMenuOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [classFilter, setClassFilter] = useState('all')
  const [account, setAccount] = useState('all')
  const [unreadOnly, setUnreadOnly] = useState(false)
  const [sort, setSort] = useState('newest')
  const [openId, setOpenId] = useState(null) // which email is open in the panel
  const [toast, setToast] = useState('')
    const [syncing, setSyncing] = useState(false)

  const [title, subtitle] = titles[view]
  const counts = useMemo(() => viewCounts(emails), [emails])
  const stats = useMemo(() => getStats(emails), [emails])

  // Apply view + search + filters + sorting
  const visible = useMemo(() => {
    const q = query.trim().toLowerCase()
    let list = emails.filter((e) => inView(e, view))

    if (classFilter === 'review') list = list.filter(needsReview)
    else if (classFilter !== 'all') list = list.filter((e) => e.classification === classFilter)

    if (account !== 'all') list = list.filter((e) => e.account === account)
    if (unreadOnly) list = list.filter((e) => e.unread)

    if (q) {
      list = list.filter((e) =>
        [e.sender, e.senderEmail, e.subject, e.summary, e.body]
          .join(' ')
          .toLowerCase()
          .includes(q),
      )
    }

    list = [...list].sort((a, b) =>
      sort === 'newest'
        ? new Date(b.date) - new Date(a.date)
        : new Date(a.date) - new Date(b.date),
    )
    return list
  }, [emails, view, query, classFilter, account, unreadOnly, sort])

  function handleLogout() {
    logout()
    navigate('/login')
  }

  function handleSelect(id) {
    setView(id)
    setMenuOpen(false)
  }

  function toggleStar(id) {
    const email = emails.find((e) => e.id === id)
    updateEmail(id, { important: !email.important })
  }

  function openEmail(id) {
    updateEmail(id, { unread: false })
    setOpenId(id)
  }

  function showToast(message) {
    setToast(message)
    setTimeout(() => setToast(''), 2400)
  }

  // Always read the freshest copy of the open email from the store
  const openEmailData = emails.find((e) => e.id === openId) || null

    // Simulated sync: new emails arrive, the server classifies each one
  async function syncNew() {
    setSyncing(true)
    try {
      const existing = getEmails()
      // Only add demo emails that are not in the inbox yet
      const fresh = incomingBatch.filter(
        (m) => !existing.some((e) => e.subject === m.subject),
      )
      if (fresh.length === 0) {
        showToast('Inbox is up to date. No new emails.')
        return
      }
      let nextId = Math.max(...existing.map((e) => e.id)) + 1
      const results = []
      for (const m of fresh) {
        const r = await analyzeEmail(m)
        results.push({
          id: nextId++,
          ...m,
          date: new Date().toISOString(),
          unread: true,
          important: false,
          status: 'open',
          manuallyChanged: false,
          isNew: true,
          classification: r.classification,
          confidence: r.confidence,
          summary: r.summary,
          reason: r.reason,
          engine: r.engine,
          clientNeedsAttention: r.classification === 'client',
        })
      }
      addEmails(results)
      showToast(`${results.length} new emails synced and classified`)
    } catch {
      showToast('Could not reach the AI server. Is it running?')
    } finally {
      setSyncing(false)
    }
  }

  function clearFilters() {
    setQuery('')
    setClassFilter('all')
    setAccount('all')
    setUnreadOnly(false)
  }

  const statCards = [
    { label: 'Unread emails', value: stats.unread, icon: Mail, color: 'var(--accent)', bg: 'var(--accent-soft)' },
    { label: 'Need action', value: stats.action, icon: Zap, color: 'var(--green)', bg: 'var(--green-soft)' },
    { label: 'Waiting on client', value: stats.waiting, icon: Users, color: 'var(--orange)', bg: 'var(--orange-soft)' },
    { label: 'Important', value: stats.important, icon: Star, color: 'var(--red)', bg: 'var(--red-soft)' },
  ]

  return (
    <div className="shell">
      <Sidebar
        user={user}
        active={view}
        counts={counts}
        onSelect={handleSelect}
        open={menuOpen}
        onLogout={handleLogout}
      />
      <div
        className={`overlay ${menuOpen ? 'show' : ''}`}
        onClick={() => setMenuOpen(false)}
      />

      <main className="main">
                <ServerBanner />
        <div className="topbar">
          <button
            className="icon-btn menu-btn"
            onClick={() => setMenuOpen(true)}
            title="Open menu"
          >
            <Menu size={20} />
          </button>
          <div>
            <h1>{title}</h1>
            <p>{subtitle}</p>
          </div>
          <div className="topbar-actions search-wrap" style={{ marginLeft: 'auto' }}>
            <button className="btn btn-accent btn-sm" onClick={syncNew} disabled={syncing}>
              <RefreshCw size={14} className={syncing ? 'spin' : ''} />
              {syncing ? 'Syncing…' : 'Sync new emails'}
            </button>
            <div className="search" style={{ marginLeft: 0 }}>
              <Search size={16} />
              <input
                className="input"
                placeholder="Search emails…"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </div>
          </div>
        </div>

        <div className="stats">
          {statCards.map((s) => (
            <div className="card stat" key={s.label}>
              <div className="stat-icon" style={{ background: s.bg, color: s.color }}>
                <s.icon size={20} />
              </div>
              <div>
                <strong>{s.value}</strong>
                <span>{s.label}</span>
              </div>
            </div>
          ))}
        </div>

        <div className="toolbar">
          {classFilters.map((f) => (
            <button
              key={f.id}
              className={`chip ${classFilter === f.id ? 'active' : ''}`}
              onClick={() => setClassFilter(f.id)}
            >
              {f.label}
            </button>
          ))}
          <button
            className={`chip ${unreadOnly ? 'active' : ''}`}
            onClick={() => setUnreadOnly(!unreadOnly)}
          >
            Unread only
          </button>
          <select value={account} onChange={(e) => setAccount(e.target.value)}>
            <option value="all">All accounts</option>
            <option value="gmail">Gmail</option>
            <option value="outlook">Outlook</option>
          </select>
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            style={{ marginLeft: 0 }}
          >
            <option value="newest">Newest first</option>
            <option value="oldest">Oldest first</option>
          </select>
        </div>

        {visible.length === 0 ? (
          <div className="card empty">
            <div className="empty-icon">
              {query ? <SearchX size={26} /> : <Inbox size={26} />}
            </div>
            <h3>{query ? 'No emails match your search' : 'Nothing here'}</h3>
            <p>
              {query
                ? 'Try different words, or clear your filters.'
                : 'There are no emails in this view with the current filters.'}
            </p>
            <button className="btn btn-ghost btn-sm" style={{ marginTop: 16 }} onClick={clearFilters}>
              Clear search and filters
            </button>
          </div>
        ) : (
          <div className="card email-list">
            {visible.map((email) => (
              <EmailRow
                key={email.id}
                email={email}
                onOpen={openEmail}
                onToggleStar={toggleStar}
              />
            ))}
          </div>
        )}
      </main>

      {openEmailData && (
        <EmailPanel
          email={openEmailData}
          onClose={() => setOpenId(null)}
          onChange={updateEmail}
          onToast={showToast}
        />
      )}

      {toast && (
        <div className="toast">
          <CheckCircle2 size={16} /> {toast}
        </div>
      )}
    </div>
  )
}