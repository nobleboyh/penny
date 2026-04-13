import { useState } from 'react'
import { NavLink } from 'react-router-dom'
import { PennyAvatar } from '../PennyAvatar'
import { PennyChatInput } from '../PennyChatInput'

const TABS = [
  { path: '/stuff', icon: '📊', label: 'My Stuff' },
  { path: '/journey', icon: '📈', label: 'My Journey' },
  { path: '/penny-says', icon: '💬', label: 'Penny Says' },
  { path: '/vibe', icon: '✨', label: 'My Vibe' },
] as const

export function BottomNav() {
  const [chatOpen, setChatOpen] = useState(false)

  return (
    <>
      <nav
        aria-label="Main navigation"
        className="fixed bottom-0 left-0 right-0 flex items-end justify-around bg-surface border-t border-border px-2 pb-safe"
        style={{ paddingBottom: 'max(env(safe-area-inset-bottom), 8px)' }}
      >
        {TABS.slice(0, 2).map((tab) => (
          <NavLink
            key={tab.path}
            to={tab.path}
            className={({ isActive }) =>
              `flex flex-col items-center justify-center gap-1 min-w-[44px] min-h-[56px] py-2 text-xs font-medium transition-colors ${
                isActive ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
              }`
            }
          >
            <span className="text-xl" aria-hidden="true">{tab.icon}</span>
            <span>{tab.label}</span>
          </NavLink>
        ))}

        <button
          onClick={() => setChatOpen(true)}
          aria-label="Penny — log a transaction"
          className="flex flex-col items-center justify-center -mt-4 min-w-[44px] min-h-[44px]"
        >
          <PennyAvatar size="sm" mood="peace" />
        </button>

        {TABS.slice(2).map((tab) => (
          <NavLink
            key={tab.path}
            to={tab.path}
            className={({ isActive }) =>
              `flex flex-col items-center justify-center gap-1 min-w-[44px] min-h-[56px] py-2 text-xs font-medium transition-colors ${
                isActive ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
              }`
            }
          >
            <span className="text-xl" aria-hidden="true">{tab.icon}</span>
            <span>{tab.label}</span>
          </NavLink>
        ))}
      </nav>
      <PennyChatInput open={chatOpen} onOpenChange={setChatOpen} />
    </>
  )
}
