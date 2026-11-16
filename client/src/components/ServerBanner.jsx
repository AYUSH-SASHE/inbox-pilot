import { WifiOff } from 'lucide-react'
import { useServerStatus } from '../utils/serverStatus.js'

// Shows a warning only when the server is confirmed offline
export default function ServerBanner() {
  const { online } = useServerStatus()
  if (online !== false) return null

  return (
    <div className="server-banner">
      <WifiOff size={16} />
      <span>
        <b>Server offline.</b> You are viewing this browser’s copy. Changes
        made now are not saved to the server and won’t reach the other
        dashboard. AI features use no connection until it returns.
      </span>
    </div>
  )
}