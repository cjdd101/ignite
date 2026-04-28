import { NavLink } from 'react-router-dom'
import { motion } from 'framer-motion'

interface NavItem {
  to: string
  label: string
  icon: React.ReactNode
  activeIcon: React.ReactNode
}

const navItems: NavItem[] = [
  {
    to: '/prairie',
    label: '草原',
    icon: (
      <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M12 3c-1.5 2-2.5 4.5-2.5 7 0 2.5 1.5 4.5 3.5 5.5M12 3c1.5 2 2.5 4.5 2.5 7 0 2.5-1.5 4.5-3.5 5.5" strokeLinecap="round"/>
        <path d="M12 3v18M7 8c-2-1-3-3-3-5.5M17 8c2-1 3-3 3-5.5M9 21l3-6 3 6" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
    activeIcon: (
      <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 3c-1.5 2-2.5 4.5-2.5 7 0 2.5 1.5 4.5 3.5 5.5M12 3c1.5 2 2.5 4.5 2.5 7 0 2.5-1.5 4.5-3.5 5.5"/>
        <path d="M12 3v18M7 8c-2-1-3-3-3-5.5M17 8c2-1 3-3 3-5.5M9 21l3-6 3 6"/>
      </svg>
    ),
  },
  {
    to: '/hearth',
    label: '火盆',
    icon: (
      <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M12 19c-3 0-5-2-5-5 0-2 1-4 2.5-6C11 5 12 3 14 3c.5 2 1.5 3 1.5 3s1-1 1.5-3c2 0 3 2 4.5 5C19 10 20 12 20 14c0 3-2 5-5 5h-3z" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M12 19v-3" strokeLinecap="round"/>
      </svg>
    ),
    activeIcon: (
      <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 19c-3 0-5-2-5-5 0-2 1-4 2.5-6C11 5 12 3 14 3c.5 2 1.5 3 1.5 3s1-1 1.5-3c2 0 3 2 4.5 5C19 10 20 12 20 14c0 3-2 5-5 5h-3z"/>
        <path d="M12 19v-3" fill="none" stroke="currentColor" strokeWidth="2"/>
      </svg>
    ),
  },
  {
    to: '/explore',
    label: '探索',
    icon: (
      <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <circle cx="11" cy="11" r="7" strokeLinecap="round"/>
        <path d="M21 21l-4.35-4.35" strokeLinecap="round"/>
      </svg>
    ),
    activeIcon: (
      <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
        <circle cx="11" cy="11" r="7"/>
        <path d="M21 21l-4.35-4.35" fill="none" stroke="currentColor" strokeWidth="2"/>
      </svg>
    ),
  },
  {
    to: '/settings',
    label: '设置',
    icon: (
      <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <circle cx="12" cy="12" r="3"/>
        <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/>
      </svg>
    ),
    activeIcon: (
      <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
        <circle cx="12" cy="12" r="3"/>
        <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/>
      </svg>
    ),
  },
]

const labelColors: Record<string, string> = {
  '/prairie': 'text-prairie-primary',
  '/hearth': 'text-fire-flame',
  '/explore': 'text-fire-spark',
  '/settings': 'text-text-muted',
}

export function BottomNav() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50">
      {/* 背景模糊层 */}
      <div className="absolute inset-0 bg-bg-primary/80 backdrop-blur-xl border-t border-white/[0.06]" />

      {/* 内容 */}
      <div className="relative max-w-lg mx-auto">
        <div className="flex items-center justify-around py-2 px-4">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) => `
                relative flex flex-col items-center gap-1 py-2 px-4 rounded-xl transition-all duration-300
                ${isActive ? 'scale-105' : 'hover:scale-102'}
              `}
            >
              {({ isActive }) => (
                <>
                  {/* 活跃指示器 */}
                  {isActive && (
                    <motion.div
                      layoutId="nav-indicator"
                      className="absolute inset-0 bg-white/5 rounded-xl"
                      transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                    />
                  )}

                  <div className={`relative transition-all duration-300 ${
                    isActive
                      ? `${labelColors[item.to]} drop-shadow-[0_0_8px_currentColor]`
                      : 'text-text-muted'
                  }`}>
                    {isActive ? item.activeIcon : item.icon}
                  </div>

                  <span className={`relative text-xs font-medium transition-colors duration-300 ${
                    isActive ? labelColors[item.to] : 'text-text-muted'
                  }`}>
                    {item.label}
                  </span>
                </>
              )}
            </NavLink>
          ))}
        </div>

        {/* 安全区适配 */}
        <div className="h-[env(safe-area-inset-bottom)]" />
      </div>
    </nav>
  )
}