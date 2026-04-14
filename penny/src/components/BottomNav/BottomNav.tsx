import { NavLink } from 'react-router-dom'

const TABS = [
  { path: '/', icon: 'grid_view', label: 'Home', exact: true },
  { path: '/wishlist', icon: 'auto_awesome', label: 'Wishlist', exact: false },
  { path: '/stash', icon: 'database', label: 'Stash', exact: false },
  { path: '/profile', icon: 'person', label: 'Profile', exact: false },
] as const

export function BottomNav() {
  return (
    <nav
      aria-label="Main navigation"
      className="shrink-0 bg-surface-container-low border-t border-outline-variant/10"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      <div className="flex justify-around items-center px-2 py-2 max-w-md mx-auto">
        {TABS.map((tab) => (
          <NavLink
            key={tab.path}
            to={tab.path}
            end={tab.exact}
            className={({ isActive }) =>
              `flex flex-col items-center justify-center min-w-[44px] min-h-[44px] px-3 py-1 text-[9px] font-bold uppercase tracking-wider transition-colors ${
                isActive
                  ? 'bg-violet-100 text-violet-700 rounded-2xl active-nav-fill'
                  : 'text-slate-400'
              }`
            }
          >
            <span className="material-symbols-outlined text-xl">{tab.icon}</span>
            <span className="mt-0.5">{tab.label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  )
}
