import { Routes, Route, Navigate } from 'react-router-dom'
import MainLayout from './components/layout/MainLayout'
import RecommendationsPage from './pages/RecommendationsPage'
import ProfilePage from './pages/ProfilePage'
import DocumentUploadPage from './pages/DocumentUploadPage'
import HistoryPage from './pages/HistoryPage'
import RegisterPage from './pages/RegisterPage'

export default function App() {
  return (
    <Routes>
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/" element={<MainLayout />}>
        <Route index element={<Navigate to="/rekomendacijos" replace />} />
        <Route path="rekomendacijos" element={<RecommendationsPage />} />
        <Route path="profilis" element={<ProfilePage />} />
        <Route path="dokumentai" element={<DocumentUploadPage />} />
        <Route path="istorija" element={<HistoryPage />} />
      </Route>
    </Routes>
  )
}
