import { Routes, Route, Navigate } from 'react-router-dom'
import { HearthPage } from '@/pages/HearthPage'
import { PrairiePage } from '@/pages/PrairiePage'
import { ExplorePage } from '@/pages/ExplorePage'
import { SettingsPage } from '@/pages/SettingsPage'
import { KindleWizard } from '@/pages/KindleWizard'
import { RekindlePage } from '@/pages/RekindlePage'
import { OrganizePage } from '@/pages/OrganizePage'

function App() {
  return (
    <div className="max-w-app mx-auto">
      <Routes>
        <Route path="/" element={<Navigate to="/hearth" replace />} />
        <Route path="/hearth" element={<HearthPage />} />
        <Route path="/prairie" element={<PrairiePage />} />
        <Route path="/prairie/flame/create" element={<KindleWizard sparkId="" />} />
        <Route path="/prairie/:flameId/kindle" element={<KindleWizard sparkId="" />} />
        <Route path="/prairie/:flameId/rekindle" element={<RekindlePage flameId="" />} />
        <Route path="/explore" element={<ExplorePage />} />
        <Route path="/organize" element={<OrganizePage />} />
        <Route path="/settings" element={<SettingsPage />} />
      </Routes>
    </div>
  )
}

export default App