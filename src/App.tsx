import { Routes, Route } from 'react-router-dom'

function App() {
  return (
    <Routes>
      <Route path="/" element={<div className="p-4">点燃 - Ignite</div>} />
    </Routes>
  )
}

export default App