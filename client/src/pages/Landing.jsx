import { Link } from 'react-router-dom'
import {
  Mail,
  Sparkles,
  Users,
  ShieldCheck,
  Zap,
  Inbox,
  ArrowRight,
  Bot,
} from 'lucide-react'
import '../styles/landing.css'

const features = [
  {
    icon: Sparkles,
    color: 'var(--accent)',
    bg: 'var(--accent-soft)',
    title: 'AI email classification',
    text: 'Every email is sorted into Assistant to Reply, Client to Reply, or No Reply Needed, with a confidence score and a clear reason.',
  },
  {
    icon: Bot,
    color: 'var(--green)',
    bg: 'var(--green-soft)',
    title: 'Summaries and reply drafts',
    text: 'Get a short summary of each conversation and a ready-to-edit reply draft. Nothing is ever sent without review.',
  },
  {
    icon: Users,
    color: 'var(--orange)',
    bg: 'var(--orange-soft)',
    title: 'A simple client view',
    text: 'Clients only see what truly needs them. They can mark items handled or hand them back to you in one click.',
  },
  {
    icon: ShieldCheck,
    color: 'var(--red)',
    bg: 'var(--red-soft)',
    title: 'You stay in control',
    text: 'Low-confidence results are flagged as Needs Review, and you can correct any classification manually.',
  },
  {
    icon: Inbox,
    color: 'var(--accent)',
    bg: 'var(--accent-soft)',
    title: 'Every inbox in one place',
    text: 'Manage the email accounts of multiple clients from one dashboard, with powerful search and filters.',
  },
  {
    icon: Zap,
    color: 'var(--grey)',
    bg: 'var(--grey-soft)',
    title: 'Always in sync',
    text: 'When a client marks something handled, your dashboard updates straight away. No extra messages needed.',
  },
]

const previewRows = [
  {
    initials: 'SM',
    name: 'Sarah Mitchell',
    subject: 'Board meeting: please confirm your attendance',
    label: 'Client to Reply',
    badge: 'badge-orange',
  },
  {
    initials: 'DK',
    name: 'Daniel Kim',
    subject: 'Reschedule Thursday’s call to Friday?',
    label: 'Assistant to Reply',
    badge: 'badge-green',
  },
  {
    initials: 'PN',
    name: 'Product Weekly',
    subject: 'This week in product: 5 stories worth reading',
    label: 'No Reply Needed',
    badge: 'badge-grey',
  },
]

export default function Landing() {
  return (
    <div className="landing">
      {/* ---------- Navbar ---------- */}
      <header className="nav">
        <div className="nav-inner">
          <div className="logo">
            <div className="logo-mark">
              <Mail size={17} />
            </div>
            Inbox Pilot
          </div>
          <div className="nav-links">
            <Link to="/login" className="btn btn-ghost btn-sm">
              Log in
            </Link>
            <Link to="/signup" className="btn btn-primary btn-sm">
              Get started
            </Link>
          </div>
        </div>
      </header>

      {/* ---------- Hero ---------- */}
      <section className="hero fade-up">
        <div className="pill">
          <Sparkles size={14} />
          AI-powered email management for personal assistants
        </div>
        <h1>
          Know exactly <span>who needs to reply</span> to every email
        </h1>
        <p>
          Inbox Pilot reads your clients’ emails, decides who should respond,
          summarises the conversation and drafts the reply. You review, and you
          stay in control.
        </p>
        <div className="hero-actions">
          <Link to="/signup" className="btn btn-primary btn-lg">
            Start free <ArrowRight size={16} />
          </Link>
          <Link to="/login" className="btn btn-ghost btn-lg">
            Log in
          </Link>
        </div>
        <div className="hero-note">
          Prototype demo using simulated Gmail and Outlook connections.
        </div>
      </section>

      {/* ---------- Product preview ---------- */}
      <section className="preview fade-up">
        <div className="preview-window">
          <div className="preview-bar">
            <span className="dot" />
            <span className="dot" />
            <span className="dot" />
          </div>
          <div className="preview-body">
            {previewRows.map((row) => (
              <div className="preview-row" key={row.name}>
                <div className="avatar">{row.initials}</div>
                <div className="preview-text">
                  <strong>{row.name}</strong>
                  <span>{row.subject}</span>
                </div>
                <span className={`badge ${row.badge}`}>{row.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ---------- Features ---------- */}
      <section className="section">
        <h2 className="section-title">Everything an assistant needs</h2>
        <p className="section-sub">
          Built around one question: who should reply to this email?
        </p>
        <div className="grid-3">
          {features.map((f) => (
            <div className="card feature" key={f.title}>
              <div
                className="feature-icon"
                style={{ background: f.bg, color: f.color }}
              >
                <f.icon size={20} />
              </div>
              <h3>{f.title}</h3>
              <p>{f.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ---------- Call to action ---------- */}
      <section className="cta">
        <h2>Ready to clear the inbox?</h2>
        <p>Create a free account and see the AI classify a demo inbox in seconds.</p>
        <Link to="/signup" className="btn btn-accent btn-lg">
          Get started <ArrowRight size={16} />
        </Link>
      </section>

      <footer className="footer">
        © 2026 Inbox Pilot. Internship prototype. Email connections are simulated.
      </footer>
    </div>
  )
}