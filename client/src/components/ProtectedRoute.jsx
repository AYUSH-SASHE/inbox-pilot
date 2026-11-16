import { Navigate } from 'react-router-dom'
import { getUser, homeFor } from '../utils/auth.js'

// Wrap a page with this to control who may open it.
//   <ProtectedRoute role="assistant"> ... </ProtectedRoute>
export default function ProtectedRoute({ role, children }) {
  const user = getUser()

  // 1. Not logged in -> login page
  if (!user) return <Navigate to="/login" replace />

  // 2. Wrong role (e.g. a client opening /app) -> their own home
  if (role && user.role !== role) return <Navigate to={homeFor(user)} replace />

  // 3. Assistant who has not finished onboarding -> onboarding
  if (role === 'assistant' && !user.onboarded) {
    return <Navigate to="/onboarding" replace />
  }

  return children
}