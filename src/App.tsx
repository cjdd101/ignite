import { Routes, Route, Navigate, useParams } from 'react-router-dom'
import { HearthPage } from '@/pages/HearthPage'
import { PrairiePage } from '@/pages/PrairiePage'
import { ExplorePage } from '@/pages/ExplorePage'
import { SettingsPage } from '@/pages/SettingsPage'
import { KindleWizard } from '@/pages/KindleWizard'
import { RekindlePage } from '@/pages/RekindlePage'
import { OrganizePage } from '@/pages/OrganizePage'

// Generic wrapper to extract route params
function RouteWrapper<T>(Component: (props: T) => JSX.Element) {
  return function WrappedComponent(props: T & Record<string, string>) {
    return <Component {...props} />
  }
}

function RekindleWrapper() {
  const { flameId } = useParams<{ flameId: string }>()
  return <RekindlePage flameId={flameId || ''} />
}

function KindleWrapper() {
  const { flameId } = useParams<{ flameId: string }>()
  return <KindleWizard sparkId={flameId || ''} />
}

function App() {
  return (
    <div className="max-w-app mx-auto">
      <Routes>
        <Route path="/" element={<Navigate to="/hearth" replace />} />
        <Route path="/hearth" element={<HearthPage />} />
        <Route path="/prairie" element={<PrairiePage />} />
        <Route path="/prairie/flame/create" element={<KindleWizard sparkId="" />} />
        <Route path="/prairie/:flameId/kindle" element={<KindleWrapper />} />
        <Route path="/prairie/:flameId/rekindle" element={<RekindleWrapper />} />
        <Route path="/explore" element={<ExplorePage />} />
        <Route path="/organize" element={<OrganizePage />} />
        <Route path="/settings" element={<SettingsPage />} />
      </Routes>
    </div>
  )
}

export default App