import { NavLink } from 'react-router-dom'
import { PennyAvatar } from '../PennyAvatar'

const TABS = [
  { path: '/stuff', icon: '📊', label: 'My Stuff' },
  { path: '/journey', icon: '📈', label: 'My Journey' },
  { path: '/home', icon: null, label: null, isPenny: true },
  { path: '/penny-says', icon: '💬', label: 'Penny Says' },
  { path: '/vibe', icon: '✨', label: 'My Vibe' },
] as const

export function BottomNav() {
  return (
    <nav
      aria-label="Main navigation"
      className="fixed bottom-0 left-0 right-0 flex items-end justify-around bg-surface border-t border-border px-2 pb-safe"
      style={{ paddingBottom: 'max(env(safe-area-inset-bottom), 8px)' }}
    >
      {TABS.map((tab) =>
        'isPenny' in tab ? (
          <NavLink
            key={tab.path}
            to={tab.path}
            aria-label="Penny — home"
            className="flex flex-col items-center justify-center -mt-4 min-w-[44px] min-h-[44px]"
          >
            <PennyAvatar size="sm" mood="idle" />
          </NavLink>
        ) : (
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
        )
      )}
    </nav>
  )
}
