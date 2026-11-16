import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Mail, Sparkles, ShieldCheck, Users } from 'lucide-react'
import { saveUser, homeFor } from '../utils/auth.js'
import '../styles/auth.css'

export default function Signup() {
  const navigate = useNavigate()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState('assistant')
  const [error, setError] = useState('')

  function handleSubmit(e) {
    e.preventDefault()
    if (name.trim().length < 2) {
      setError('Please enter your name.')
      return
    }
    if (!email.includes('@')) {
      setError('Please enter a valid email address.')
      return
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters.')
      return
    }
    // Clients skip onboarding. Assistants go through it.
    const user = {
      name: name.trim(),
      email,
      role,
      onboarded: role === 'client',
    }
    saveUser(user)
    navigate(homeFor(user))
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

          <h1>Create your account</h1>
          <p className="auth-sub">Get started in under a minute.</p>

          {error && <div className="form-error">{error}</div>}

          <form onSubmit={handleSubmit}>
            <div className="field">
              <label>I am a…</label>
              <div className="role-picker">
                <button
                  type="button"
                  className={`role-option ${role === 'assistant' ? 'active' : ''}`}
                  onClick={() => setRole('assistant')}
                >
                  <strong>Assistant</strong>
                  <span>I manage emails for clients</span>
                </button>
                <button
                  type="button"
                  className={`role-option ${role === 'client' ? 'active' : ''}`}
                  onClick={() => setRole('client')}
                >
                  <strong>Client</strong>
                  <span>I have an assistant</span>
                </button>
              </div>
            </div>
            <div className="field">
              <label>Full name</label>
              <input
                className="input"
                placeholder="Alex Morgan"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
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
                placeholder="At least 6 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <button type="submit" className="btn btn-primary btn-block">
              Create account
            </button>
          </form>

          <p className="auth-switch">
            Already have an account? <Link to="/login">Log in</Link>
          </p>
        </div>
      </div>

      <div className="auth-brand">
        <h2>Your clients’ inboxes, finally under control.</h2>
        <p>
          Connect an inbox, let the AI sort it, and review everything in one
          clean dashboard.
        </p>
        <div className="brand-points">
          <div className="brand-point">
            <Sparkles size={18} /> Summaries and reply drafts
          </div>
          <div className="brand-point">
            <Users size={18} /> Manage multiple clients
          </div>
          <div className="brand-point">
            <ShieldCheck size={18} /> You stay in control
          </div>
        </div>
      </div>
    </div>
  )
}