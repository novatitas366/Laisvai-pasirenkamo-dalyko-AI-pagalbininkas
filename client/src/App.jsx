import { Routes, Route, Navigate } from 'react-router-dom'
import MainLayout from './components/layout/MainLayout'
import LoginPage from './pages/LoginPage'
import RecommendationsPage from './pages/RecommendationsPage'
import SubjectsCatalogPage from './pages/SubjectsCatalogPage'
import ProfilePage from './pages/ProfilePage'
import DocumentUploadPage from './pages/DocumentUploadPage'
import HistoryPage from './pages/HistoryPage'
import ElectiveEntryPage from './pages/ElectiveEntryPage'

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/" element={<MainLayout />}>
        <Route index element={<Navigate to="/rekomendacijos" replace />} />
        <Route path="rekomendacijos" element={<RecommendationsPage />} />
        <Route path="dalykai" element={<SubjectsCatalogPage />} />
        <Route path="pasirenkami-dalykai" element={<ElectiveEntryPage />} />
        <Route path="profilis" element={<ProfilePage />} />
        <Route path="dokumentai" element={<DocumentUploadPage />} />
        <Route path="istorija" element={<HistoryPage />} />
      </Route>
    </Routes>
  )
}
