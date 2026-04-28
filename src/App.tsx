import { Routes, Route, Navigate, useParams } from 'react-router-dom'
import { HearthPage } from '@/pages/HearthPage'
import { PrairiePage } from '@/pages/PrairiePage'
import { PrairieDetailPage } from '@/pages/PrairieDetailPage'
import { ExplorePage } from '@/pages/ExplorePage'
import { SettingsPage } from '@/pages/SettingsPage'
import { KindleWizard } from '@/pages/KindleWizard'
import { RekindlePage } from '@/pages/RekindlePage'
import { OrganizePage } from '@/pages/OrganizePage'
import { FlameDetailPage } from '@/pages/FlameDetailPage'
import { CompleteBurningPage } from '@/pages/CompleteBurningPage'

// Wrapper for RekindlePage - receives flameId from route params
function RekindleWrapper() {
  const { flameId } = useParams<{ flameId: string }>()
  return <RekindlePage flameId={flameId || ''} />
}

// Wrapper for KindleWizard with sparkId from route
function KindleFromSparkWrapper() {
  const { sparkId } = useParams<{ sparkId: string }>()
  return <KindleWizard sparkId={sparkId || ''} />
}

// Wrapper for KindleWizard with prairieId from route
function KindleFromPrairieWrapper() {
  const { prairieId } = useParams<{ prairieId: string }>()
  return <KindleWizard sparkId="" prairieId={prairieId} />
}

function App() {
  return (
    <div className="max-w-app mx-auto">
      <Routes>
        <Route path="/" element={<Navigate to="/hearth" replace />} />
        <Route path="/hearth" element={<HearthPage />} />
        <Route path="/hearth/kindle/:sparkId" element={<KindleFromSparkWrapper />} />
        <Route path="/prairie" element={<PrairiePage />} />
        <Route path="/prairie/:prairieId" element={<PrairieDetailPage />} />
        <Route path="/prairie/flame/create" element={<KindleWizard sparkId="" />} />
        <Route path="/prairie/:prairieId/flame/create" element={<KindleFromPrairieWrapper />} />
        <Route path="/prairie/flame/:id" element={<FlameDetailPage />} />
        <Route path="/prairie/flame/:id/complete" element={<CompleteBurningPage />} />
        <Route path="/prairie/flame/:id/rekindle" element={<RekindleWrapper />} />
        <Route path="/explore" element={<ExplorePage />} />
        <Route path="/organize" element={<OrganizePage />} />
        <Route path="/settings" element={<SettingsPage />} />
      </Routes>
    </div>
  )
}

export default App