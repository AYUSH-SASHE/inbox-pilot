import { AlertTriangle } from 'lucide-react'
import { CLASSES } from '../data/emails.js'
import { needsReview } from '../utils/emailHelpers.js'

// Shows the classification badge, confidence %, and "Needs review"
export default function ClassBadge({ email, showConfidence = true }) {
  const cls = CLASSES[email.classification]
  const review = needsReview(email)

  return (
    <span className="badge-group">
      <span className={`badge ${cls.badge}`}>{cls.label}</span>
      {showConfidence && !email.manuallyChanged && (
        <span className="confidence">{Math.round(email.confidence * 100)}%</span>
      )}
      {email.manuallyChanged && <span className="confidence">Manual</span>}
      {review && (
        <span className="badge badge-red">
          <AlertTriangle size={12} /> Needs review
        </span>
      )}
    </span>
  )
}