import { useEffect, useState } from 'react'
import {
  X,
  Star,
  Archive,
  ArchiveRestore,
  Sparkles,
  Users,
  CheckCircle2,
  RefreshCw,
  PenLine,
  Send,
  Copy,
  MessageSquarePlus,
} from 'lucide-react'
import ClassBadge from './ClassBadge.jsx'
import { CLASSES } from '../data/emails.js'
import { formatDate, initials, needsReview } from '../utils/emailHelpers.js'
import { analyzeEmail, draftReply, analyzeThread } from '../utils/ai.js'
import { followUps } from '../data/incoming.js'

const SERVER_DOWN =
  'Could not reach the AI server. Make sure it is running (npm run dev in the server folder). Your existing data is unchanged.'

export default function EmailPanel({ email, onClose, onChange, onToast }) {
  const [analyzing, setAnalyzing] = useState(false)
  const [aiError, setAiError] = useState('')
  const [drafting, setDrafting] = useState(false)
  const [draft, setDraft] = useState('')
  const [draftEngine, setDraftEngine] = useState('')
  const [reviewing, setReviewing] = useState(false)
  const [sent, setSent] = useState(false)
    const [simulating, setSimulating] = useState(false)
  const [changeNote, setChangeNote] = useState('')

  // Close with the Escape key
  useEffect(() => {
    function onKey(e) {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  // Reset the draft area when a different email is opened
  useEffect(() => {
    setDraft('')
    setDraftEngine('')
    setReviewing(false)
    setSent(false)
    setAiError('')
        setChangeNote('')
  }, [email?.id])

  if (!email) return null

  const review = needsReview(email)
  const pct = Math.round(email.confidence * 100)
  const archived = email.status === 'archived'
  const fullDate = new Date(email.date).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })

  function changeClass(next) {
    if (next === email.classification) return
    onChange(email.id, {
      classification: next,
      manuallyChanged: true,
      clientNeedsAttention: next === 'client',
      status: email.status === 'handled' ? 'open' : email.status,
    })
    onToast(`Moved to “${CLASSES[next].label}”`)
  }

  function toggleArchive() {
    onChange(email.id, { status: archived ? 'open' : 'archived' })
    onToast(archived ? 'Restored to inbox' : 'Email archived')
    if (!archived) onClose()
  }

  function toggleStar() {
    onChange(email.id, { important: !email.important })
  }

  // Ask the server to re-run the AI on this email
  async function reanalyze() {
    setAnalyzing(true)
    setAiError('')
    try {
      const r = await analyzeEmail(email)
      onChange(email.id, {
        classification: r.classification,
        confidence: r.confidence,
        summary: r.summary,
        reason: r.reason,
        engine: r.engine,
        manuallyChanged: false,
        clientNeedsAttention: r.classification === 'client',
        status: email.status === 'handled' ? 'open' : email.status,
      })
      onToast(r.engine === 'ai' ? 'Re-analyzed with Gemini AI' : 'Re-analyzed with rule-based fallback')
    } catch {
      setAiError(SERVER_DOWN)
    } finally {
      setAnalyzing(false)
    }
  }
    // Simulate a new message arriving in this conversation, then re-analyze
  async function simulateReply(kind) {
    const text = followUps[kind]
    setSimulating(true)
    setAiError('')
    setChangeNote('')
    try {
      const r = await analyzeThread(email, text)
      const before = CLASSES[email.classification].label
      const after = CLASSES[r.classification].label
      const thread = [...(email.thread || []), { text, date: new Date().toISOString() }]
      onChange(email.id, {
        thread,
        unread: true,
        classification: r.classification,
        confidence: r.confidence,
        summary: r.summary,
        reason: r.reason,
        engine: r.engine,
        manuallyChanged: false,
        clientNeedsAttention: r.classification === 'client',
        status: 'open',
      })
      setChangeNote(
        before === after
          ? `New message added. Still “${after}”.`
          : `New message changed the classification: “${before}” → “${after}”.`,
      )
    } catch {
      setAiError(SERVER_DOWN)
    } finally {
      setSimulating(false)
    }
  }

  async function generateDraft() {
    setDrafting(true)
    setAiError('')
    setReviewing(false)
    setSent(false)
    try {
      const r = await draftReply(email)
      setDraft(r.draft)
      setDraftEngine(r.engine)
    } catch {
      setAiError(SERVER_DOWN)
    } finally {
      setDrafting(false)
    }
  }

  function copyDraft() {
    navigator.clipboard?.writeText(draft)
    onToast('Draft copied')
  }

  // "Send" is simulated: we only record that it was approved
  function confirmSend() {
    setSent(true)
    setReviewing(false)
    onToast('Reply approved (simulated send)')
  }

  const engineLabel =
    email.engine === 'ai' ? 'Gemini AI' : email.engine === 'rules' ? 'Rule-based' : 'Sample data'

  return (
    <>
      <div className="panel-overlay" onClick={onClose} />
      <aside className="panel">
        <div className="panel-head">
          <button className="icon-btn" onClick={onClose} title="Close (Esc)">
            <X size={19} />
          </button>
          <div className="spacer" />
          <button
            className={`btn btn-ghost btn-sm ${email.important ? 'btn-active' : ''}`}
            onClick={toggleStar}
          >
            <Star size={15} fill={email.important ? 'currentColor' : 'none'} />
            {email.important ? 'Important' : 'Mark important'}
          </button>
          <button className="btn btn-ghost btn-sm" onClick={toggleArchive}>
            {archived ? <ArchiveRestore size={15} /> : <Archive size={15} />}
            {archived ? 'Restore' : 'Archive'}
          </button>
        </div>

        <div className="panel-body">
          <h2 className="panel-subject">{email.subject}</h2>

          <div className="panel-sender">
            <div className="avatar">{initials(email.sender)}</div>
            <div style={{ flex: 1 }}>
              <strong>{email.sender}</strong>
              <small>
                {email.senderEmail} · {fullDate} ·{' '}
                {email.account === 'gmail' ? 'Gmail' : 'Outlook'}
              </small>
            </div>
          </div>

          {email.classification === 'client' && (
            <div className={`client-flag ${email.status === 'handled' ? 'handled' : ''}`}>
              {email.status === 'handled' ? (
                <>
                  <CheckCircle2 size={16} /> The client marked this as handled.
                </>
              ) : (
                <>
                  <Users size={16} /> Visible on the client’s dashboard. Waiting
                  for their reply.
                </>
              )}
            </div>
          )}

          {/* AI insight box */}
          <div className="ai-box">
            <div className="ai-title">
              <Sparkles size={14} /> AI insight
              <span className={`engine-tag ${email.engine === 'ai' ? '' : 'rules'}`}>
                {engineLabel}
              </span>
            </div>

            {analyzing ? (
              <>
                <div className="shimmer" style={{ width: '90%' }} />
                <div className="shimmer" style={{ width: '70%' }} />
                <div className="shimmer" style={{ width: '80%' }} />
              </>
            ) : (
              <>
                <div className="ai-row">
                  <div className="ai-label">Summary</div>
                  <p>{email.summary}</p>
                </div>

                <div className="ai-row">
                  <div className="ai-label">Classification</div>
                  <ClassBadge email={email} showConfidence={false} />
                </div>

                <div className="ai-row">
                  <div className="ai-label">Why this classification</div>
                  <p>{email.reason}</p>
                </div>

                <div className="ai-row">
                  <div className="ai-label">
                    {email.manuallyChanged
                      ? 'Changed manually by you'
                      : `AI confidence: ${pct}%${review ? ' (low)' : ''}`}
                  </div>
                  {!email.manuallyChanged && (
                    <div className={`confidence-bar ${review ? 'low' : ''}`}>
                      <div style={{ width: `${pct}%` }} />
                    </div>
                  )}
                </div>
              </>
            )}

            <div className="ai-row">
              <div className="ai-label">Change classification</div>
              <select
                className="class-select"
                value={email.classification}
                onChange={(e) => changeClass(e.target.value)}
              >
                {Object.entries(CLASSES).map(([key, c]) => (
                  <option key={key} value={key}>
                    {c.label}
                  </option>
                ))}
              </select>
              <div className="hint">
                Choosing “Client to Reply” shows this email on the client’s
                dashboard.
              </div>
            </div>

            <button
              className="btn btn-ghost btn-sm"
              style={{ marginTop: 14 }}
              onClick={reanalyze}
              disabled={analyzing}
            >
              <RefreshCw size={14} className={analyzing ? 'spin' : ''} />
              {analyzing ? 'Analyzing…' : 'Re-analyze with AI'}
            </button>

            {aiError && <div className="ai-error">{aiError}</div>}
          </div>

          <div className="ai-label" style={{ marginBottom: 8 }}>
            Message · {formatDate(email.date)}
          </div>
          <div className="message-body">{email.body}</div>

          {(email.thread || []).map((m, i) => (
            <div className="thread-msg" key={i}>
              <div className="ai-label">
                New message · {new Date(m.date).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
              </div>
              {m.text}
            </div>
          ))}

          <div className="thread-box">
            <div className="ai-label">Simulate a new message in this conversation</div>
            <div className="thread-actions">
              <button className="btn btn-ghost btn-sm" disabled={simulating} onClick={() => simulateReply('escalate')}>
                <MessageSquarePlus size={14} /> Urgent approval
              </button>
              <button className="btn btn-ghost btn-sm" disabled={simulating} onClick={() => simulateReply('routine')}>
                <MessageSquarePlus size={14} /> Routine follow-up
              </button>
              <button className="btn btn-ghost btn-sm" disabled={simulating} onClick={() => simulateReply('fyi')}>
                <MessageSquarePlus size={14} /> FYI notice
              </button>
            </div>
            {simulating && <div className="shimmer" style={{ width: '60%' }} />}
            {changeNote && <div className="change-note">{changeNote}</div>}
          </div>

          {/* Reply draft */}
          <div className="draft-box">
            <div className="ai-title" style={{ color: 'var(--text)' }}>
              <PenLine size={14} /> Reply draft
              {draftEngine && (
                <span className={`engine-tag ${draftEngine === 'ai' ? '' : 'rules'}`}>
                  {draftEngine === 'ai' ? 'Gemini AI' : 'Template'}
                </span>
              )}
            </div>

            {!draft && !drafting && (
              <p className="hint" style={{ marginTop: 0 }}>
                Generate a draft you can edit. Nothing is sent without your
                review.
              </p>
            )}

            {drafting && (
              <>
                <div className="shimmer" style={{ width: '60%' }} />
                <div className="shimmer" style={{ width: '90%' }} />
                <div className="shimmer" style={{ width: '75%' }} />
              </>
            )}

            {draft && !drafting && (
              <textarea
                value={draft}
                onChange={(e) => {
                  setDraft(e.target.value)
                  setSent(false)
                }}
              />
            )}

            <div className="draft-actions">
              <button
                className="btn btn-accent btn-sm"
                onClick={generateDraft}
                disabled={drafting}
              >
                <Sparkles size={14} />
                {draft ? 'Regenerate draft' : 'Generate reply draft'}
              </button>
              {draft && !drafting && (
                <>
                  <button className="btn btn-ghost btn-sm" onClick={copyDraft}>
                    <Copy size={14} /> Copy
                  </button>
                  <button
                    className="btn btn-primary btn-sm"
                    onClick={() => setReviewing(true)}
                    disabled={!draft.trim()}
                  >
                    <Send size={14} /> Review and send
                  </button>
                </>
              )}
            </div>

            {reviewing && (
              <div className="review-box">
                <b>Review before sending.</b> Read the draft above once more.
                Email sending is simulated in this prototype, so nothing will
                leave the app.
                <div className="draft-actions">
                  <button className="btn btn-primary btn-sm" onClick={confirmSend}>
                    <CheckCircle2 size={14} /> Looks good, approve
                  </button>
                  <button className="btn btn-ghost btn-sm" onClick={() => setReviewing(false)}>
                    Keep editing
                  </button>
                </div>
              </div>
            )}

            {sent && (
              <div className="sent-note">
                <CheckCircle2 size={16} /> Reply approved. In a real
                integration it would be sent now.
              </div>
            )}
          </div>
        </div>
      </aside>
    </>
  )
}