import { Link } from 'react-router-dom'

export function BottomNav() {
  return (
    <nav className="bottom-nav">
      <Link to="/prairie">草原</Link>
      <Link to="/hearth">火盆</Link>
      <Link to="/flame">火焰</Link>
    </nav>
  )
}