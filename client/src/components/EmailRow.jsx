import { Star, Paperclip } from 'lucide-react'
import ClassBadge from './ClassBadge.jsx'
import { formatDate, initials } from '../utils/emailHelpers.js'

export default function EmailRow({ email, onOpen, onToggleStar }) {
  return (
    <div
      className={`email-row ${email.unread ? 'unread' : ''}`}
      onClick={() => onOpen(email.id)}
    >
      <button
        className={`star-btn ${email.important ? 'on' : ''}`}
        title={email.important ? 'Remove from important' : 'Mark as important'}
        onClick={(e) => {
          e.stopPropagation() // do not open the email
          onToggleStar(email.id)
        }}
      >
        <Star size={17} fill={email.important ? 'currentColor' : 'none'} />
      </button>

      <div className="avatar">{initials(email.sender)}</div>

      <div className="email-main">
        <div className="email-line1">
          <span className="email-sender">{email.sender}</span>
                    {email.isNew && <span className="new-tag">NEW</span>}
          <span className={`account-chip ${email.account}`}>
            {email.account === 'gmail' ? 'Gmail' : 'Outlook'}
          </span>
        </div>
        <div className="email-subject">{email.subject}</div>
        <div className="email-summary">{email.summary}</div>
      </div>

      <div className="email-side">
        <span className="email-date">{formatDate(email.date)}</span>
        <ClassBadge email={email} />
      </div>
    </div>
  )
}