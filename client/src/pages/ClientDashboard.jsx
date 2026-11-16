import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Mail,
  LogOut,
  Check,
  UserCheck,
  Clock,
  AlertCircle,
  PartyPopper,
  CheckCircle2,
} from 'lucide-react'
import { getUser, logout } from '../utils/auth.js'
import { useEmails, updateEmail } from '../store/emailStore.js'
import { formatDate, initials } from '../utils/emailHelpers.js'
import ServerBanner from '../components/ServerBanner.jsx'
import '../styles/landing.css'
import '../styles/dashboard.css'
import '../styles/client.css'

export default function ClientDashboard() {
  const navigate = useNavigate()
  const user = getUser()
  const allEmails = useEmails()

  const [leaving, setLeaving] = useState(null) // id of the card animating out
  const [toast, setToast] = useState('')

  // Only emails that need the client: Client to Reply, still open, not archived
  const emails = useMemo(
    () =>
      allEmails
        .filter(
          (e) =>
            e.classification === 'client' &&
            e.clientNeedsAttention &&
            e.status === 'open',
        )
        .sort((a, b) => new Date(b.date) - new Date(a.date)),
    [allEmails],
  )

  function showToast(message) {
    setToast(message)
    setTimeout(() => setToast(''), 2600)
  }

  // Mark as handled: fade the card out, then save the new status
  function markHandled(id) {
    setLeaving(id)
    setTimeout(() => {
      updateEmail(id, { status: 'handled', unread: false })
      setLeaving(null)
      showToast('Marked as handled')
    }, 350)
  }

  // Ask the assistant to take over: reclassify so it moves to the assistant
  function askAssistant(id) {
    setLeaving(id)
    setTimeout(() => {
      updateEmail(id, {
        classification: 'assistant',
        clientNeedsAttention: false,
        manuallyChanged: true,
        reason: 'The client asked the assistant to take over this email.',
      })
      setLeaving(null)
      showToast('Your assistant will take it from here')
    }, 350)
  }

  function handleLogout() {
    logout()
    navigate('/login')
  }

  const firstName = user.name.split(' ')[0]

  return (
    <div className="client-page">
      <header className="client-header">
        <div className="client-header-inner">
          <div className="logo">
            <div className="logo-mark">
              <Mail size={17} />
            </div>
            Inbox Pilot
          </div>
          <div className="client-user">
            <div className="who">
              <strong>{user.name}</strong>
              <small>Client</small>
            </div>
            <div className="avatar">{initials(user.name)}</div>
            <button className="icon-btn" onClick={handleLogout} title="Log out">
              <LogOut size={17} />
            </button>
          </div>
        </div>
      </header>

      <div className="client-body">
                <ServerBanner />
        <div className="client-hello fade-up">
          <h1>Hi {firstName} 👋</h1>
          <p>
            Your assistant handles everything else. These emails need you
            personally.
          </p>
        </div>

        <div className="client-summary">
          <div className="card mini-stat">
            <Clock size={20} color="var(--orange)" />
            <div>
              <strong>{emails.length}</strong>
              <br />
              <span>Waiting for you</span>
            </div>
          </div>
        </div>

        {emails.length === 0 ? (
          <div className="card empty fade-up">
            <div className="empty-icon">
              <PartyPopper size={26} />
            </div>
            <h3>You’re all caught up</h3>
            <p>Nothing needs your attention right now. Enjoy the quiet.</p>
          </div>
        ) : (
          <div className="client-list">
            {emails.map((email) => (
              <div
                key={email.id}
                className={`card client-card fade-up ${
                  leaving === email.id ? 'leaving' : ''
                }`}
              >
                <div className="cc-top">
                  <div className="avatar">{initials(email.sender)}</div>
                  <div className="meta">
                    <div className="cc-sender">{email.sender}</div>
                    <div className="cc-date">
                      Received {formatDate(email.date)}
                    </div>
                  </div>
                  {email.important && (
                    <span className="badge badge-urgent">
                      <AlertCircle size={13} /> Important
                    </span>
                  )}
                </div>

                <h3 className="cc-subject">{email.subject}</h3>
                <p className="cc-summary">{email.summary}</p>

                <div className="cc-why">
                  <b>
                    <AlertCircle size={13} /> Why you need to respond
                  </b>
                  {email.reason}
                </div>

                <div className="cc-actions">
                  <button
                    className="btn btn-primary btn-sm"
                    onClick={() => markHandled(email.id)}
                  >
                    <Check size={15} /> Mark as handled
                  </button>
                  <button
                    className="btn btn-ghost btn-sm"
                    onClick={() => askAssistant(email.id)}
                  >
                    <UserCheck size={15} /> Ask assistant to take over
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {toast && (
        <div className="toast">
          <CheckCircle2 size={16} /> {toast}
        </div>
      )}
    </div>
  )
}