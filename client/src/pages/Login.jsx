import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Mail, Sparkles, ShieldCheck, Users } from 'lucide-react'
import { saveUser, homeFor } from '../utils/auth.js'
import '../styles/auth.css'

// Two ready-made demo accounts so evaluators can log in instantly
const DEMO = {
  assistant: {
    name: 'Alex Morgan',
    email: 'alex@inboxpilot.demo',
    role: 'assistant',
    onboarded: true,
  },
  client: {
    name: 'Sarah Mitchell',
    email: 'sarah@inboxpilot.demo',
    role: 'client',
    onboarded: true,
  },
}

export default function Login() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  function enter(user) {
    saveUser(user)
    navigate(homeFor(user))
  }

  function handleSubmit(e) {
    e.preventDefault()
    if (!email.includes('@') || password.length < 4) {
      setError('Enter a valid email and a password of at least 4 characters.')
      return
    }
    // Prototype: any valid-looking login works. Role is guessed from the email.
    const role = email.toLowerCase().startsWith('client') ? 'client' : 'assistant'
    enter({
      name: email.split('@')[0],
      email,
      role,
      onboarded: true,
    })
  }

  return (
    <div className="auth-page">
      <div className="auth-side">
        <div className="auth-box fade-up">
          <Link to="/" className="logo">
            <div className="logo-mark">
              <Mail size={17} />
            </div>
            Inbox Pilot
          </Link>

          <h1>Welcome back</h1>
          <p className="auth-sub">Log in to manage your inbox.</p>

          {error && <div className="form-error">{error}</div>}

          <form onSubmit={handleSubmit}>
            <div className="field">
              <label>Email</label>
              <input
                className="input"
                type="email"
                placeholder="you@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="field">
              <label>Password</label>
              <input
                className="input"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <button type="submit" className="btn btn-primary btn-block">
              Log in
            </button>
          </form>

          <div className="demo-box">
            <strong>Try the demo instantly</strong>
            <div className="demo-actions">
              <button
                className="btn btn-ghost btn-sm"
                onClick={() => enter(DEMO.assistant)}
              >
                <ShieldCheck size={14} /> As assistant
              </button>
              <button
                className="btn btn-ghost btn-sm"
                onClick={() => enter(DEMO.client)}
              >
                <Users size={14} /> As client
              </button>
            </div>
          </div>

          <p className="auth-switch">
            New here? <Link to="/signup">Create an account</Link>
          </p>
        </div>
      </div>

      <div className="auth-brand">
        <h2>Spend less time on email. Miss nothing important.</h2>
        <p>
          AI tells you who should reply to every message, so nothing slips
          through the cracks.
        </p>
        <div className="brand-points">
          <div className="brand-point">
            <Sparkles size={18} /> Automatic AI classification
          </div>
          <div className="brand-point">
            <Users size={18} /> A simple view for your clients
          </div>
          <div className="brand-point">
            <ShieldCheck size={18} /> Every reply reviewed before sending
          </div>
        </div>
      </div>
    </div>
  )
}