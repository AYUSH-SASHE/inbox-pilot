import {
  Mail,
  Inbox,
  Zap,
  UserCheck,
  Users,
  Star,
  Archive,
  LogOut,
  RotateCcw,
} from 'lucide-react'
import { resetEmails } from '../store/emailStore.js'
import { useServerStatus } from '../utils/serverStatus.js'

const views = [
  { id: 'all', label: 'All emails', icon: Inbox },
  { id: 'action', label: 'Needs action', icon: Zap },
  { id: 'assigned', label: 'Assigned to me', icon: UserCheck },
  { id: 'client', label: 'Client attention', icon: Users },
  { id: 'important', label: 'Important', icon: Star },
  { id: 'archived', label: 'Archived', icon: Archive },
]

export default function Sidebar({ user, active, counts, onSelect, open, onLogout }) {
  const { online, gemini } = useServerStatus()

  const initials = user.name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()

  function handleReset() {
    const ok = window.confirm(
      'Reset all emails to the original demo data? Your changes will be lost.',
    )
    if (ok) resetEmails()
  }

  return (
    <aside className={`sidebar ${open ? 'open' : ''}`}>
      <div className="logo">
        <div className="logo-mark">
          <Mail size={17} />
        </div>
        Inbox Pilot
      </div>

      <div className="nav-label">Inbox</div>
      {views.map((v) => (
        <button
          key={v.id}
          className={`nav-item ${active === v.id ? 'active' : ''}`}
          onClick={() => onSelect(v.id)}
        >
          <v.icon size={17} />
          {v.label}
          <span className="count">{counts[v.id] ?? 0}</span>
        </button>
      ))}

      <div className="nav-label">Connected accounts (demo)</div>
      <div className="account-row">
        <span className="status" />
        <span>sarah@gmail.com</span>
      </div>
      <div className="account-row">
        <span className="status" />
        <span>sarah@outlook.com</span>
      </div>

      <div className="sidebar-status">
        <div className="status-line">
          <span className={`status-dot ${online ? 'on' : online === false ? 'off' : ''}`} />
          {online === null ? 'Checking server…' : online ? 'Server online' : 'Server offline'}
        </div>
        <div className="status-line">
          <span className={`status-dot ${online && gemini ? 'on' : ''}`} />
          {online && gemini ? 'Gemini key found' : 'Rule-based AI fallback'}
        </div>
        <button className="reset-btn" onClick={handleReset}>
          <RotateCcw size={13} /> Reset demo data
        </button>
      </div>

      <div className="sidebar-user">
        <div className="avatar">{initials}</div>
        <div className="who">
          <strong>{user.name}</strong>
          <small>Assistant</small>
        </div>
        <button className="icon-btn" onClick={onLogout} title="Log out">
          <LogOut size={17} />
        </button>
      </div>
    </aside>
  )
}