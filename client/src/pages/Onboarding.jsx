import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Check, ArrowRight, Info } from 'lucide-react'
import { getUser, saveUser } from '../utils/auth.js'
import '../styles/auth.css'

const providers = [
  { id: 'gmail', name: 'Gmail', color: '#ea4335', letter: 'G' },
  { id: 'outlook', name: 'Outlook', color: '#0a64d6', letter: 'O' },
]

export default function Onboarding() {
  const navigate = useNavigate()
  const user = getUser()

  const [step, setStep] = useState(1)
  const [connected, setConnected] = useState([]) // e.g. ['gmail']
  const [syncing, setSyncing] = useState(null) // which provider is syncing

  // Simulated connection: wait 1.5 seconds, then mark it connected
  function connect(id) {
    setSyncing(id)
    setTimeout(() => {
      setConnected((list) => [...list, id])
      setSyncing(null)
    }, 1500)
  }

  function finish() {
    saveUser({ ...user, onboarded: true })
    navigate('/app')
  }

  return (
    <div className="onboard">
      <div className="card onboard-card fade-up">
        <div className="steps">
          <div className={`step-bar ${step >= 1 ? 'done' : ''}`} />
          <div className={`step-bar ${step >= 2 ? 'done' : ''}`} />
        </div>

        {step === 1 && (
          <>
            <h1>Welcome{user ? `, ${user.name.split(' ')[0]}` : ''} 👋</h1>
            <p className="auth-sub">
              Inbox Pilot reads each email, decides who should reply, and
              drafts the response for you to review. Let’s connect your first
              inbox.
            </p>
            <div className="onboard-footer">
              <span />
              <button className="btn btn-primary" onClick={() => setStep(2)}>
                Continue <ArrowRight size={16} />
              </button>
            </div>
          </>
        )}

        {step === 2 && (
          <>
            <h1>Connect an email account</h1>
            <p className="auth-sub">Choose one or both. You can add more later.</p>

            <div className="provider-list">
              {providers.map((p) => {
                const isConnected = connected.includes(p.id)
                const isSyncing = syncing === p.id
                return (
                  <div className="provider" key={p.id}>
                    <div
                      className="provider-icon"
                      style={{ background: p.color }}
                    >
                      {p.letter}
                    </div>
                    <div className="provider-info">
                      <strong>{p.name}</strong>
                      <span>
                        {isConnected
                          ? 'Demo inbox synced'
                          : isSyncing
                            ? 'Syncing demo emails…'
                            : 'Not connected'}
                      </span>
                    </div>
                    {isConnected ? (
                      <span className="connected-tag">
                        <Check size={16} /> Connected
                      </span>
                    ) : isSyncing ? (
                      <div className="spinner" />
                    ) : (
                      <button
                        className="btn btn-ghost btn-sm"
                        onClick={() => connect(p.id)}
                      >
                        Connect {p.name}
                      </button>
                    )}
                  </div>
                )
              })}
            </div>

            <div className="sim-note">
              <Info size={14} style={{ verticalAlign: '-2px' }} /> This is a
              simulated connection for the prototype. No real Gmail or Outlook
              account is accessed. Demo emails are loaded instead.
            </div>

            <div className="onboard-footer">
              <button className="btn btn-ghost" onClick={() => setStep(1)}>
                Back
              </button>
              <button
                className="btn btn-primary"
                disabled={connected.length === 0}
                onClick={finish}
                style={connected.length === 0 ? { opacity: 0.5, cursor: 'not-allowed' } : {}}
              >
                Go to dashboard <ArrowRight size={16} />
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}