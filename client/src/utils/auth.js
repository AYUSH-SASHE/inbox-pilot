// ===========================================================
// auth.js: a simple fake login that remembers the user in the
// browser (localStorage). We replace this with the real server
// in Phase 5.
// ===========================================================

const KEY = 'inboxpilot_user'

export function getUser() {
  try {
    return JSON.parse(localStorage.getItem(KEY))
  } catch {
    return null
  }
}

export function saveUser(user) {
  localStorage.setItem(KEY, JSON.stringify(user))
}

export function logout() {
  localStorage.removeItem(KEY)
}

// Where should each role land after logging in?
export function homeFor(user) {
  if (!user) return '/login'
  if (user.role === 'client') return '/client'
  return user.onboarded ? '/app' : '/onboarding'
}