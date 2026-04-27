import { NavLink } from 'react-router-dom'

export function BottomNav() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-bg-secondary border-t border-gray-700">
      <div className="max-w-app mx-auto flex justify-around py-2">
        <NavLink
          to="/prairie"
          className={({ isActive }) =>
            `px-4 py-2 rounded ${isActive ? 'text-fire-prairie' : 'text-gray-400'}`
          }
        >
          🌿 草原
        </NavLink>
        <NavLink
          to="/hearth"
          className={({ isActive }) =>
            `px-4 py-2 rounded ${isActive ? 'text-fire-spark' : 'text-gray-400'}`
          }
        >
          🔥 火盆
        </NavLink>
        <NavLink
          to="/explore"
          className={({ isActive }) =>
            `px-4 py-2 rounded ${isActive ? 'text-fire-flame' : 'text-gray-400'}`
          }
        >
          🔍 探索
        </NavLink>
        <NavLink
          to="/settings"
          className={({ isActive }) =>
            `px-4 py-2 rounded ${isActive ? 'text-gray-300' : 'text-gray-400'}`
          }
        >
          ⚙️ 设置
        </NavLink>
      </div>
    </nav>
  )
}