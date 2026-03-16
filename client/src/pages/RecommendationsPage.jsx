import ChatWindow from '../components/chat/ChatWindow'
import RecommendationResult from '../components/recommendations/RecommendationResult'

// TODO: replace with real API response from SCRUM-70 once AI integration is complete
const mockRecommendation = {
  recommendedSubject: 'Dirbtinis intelektas',
  explanation: 'Šis dalykas rekomenduojamas, nes atitinka jūsų pomėgius technologijoms, duomenų analizei ir programavimui.',
}

export default function RecommendationsPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900 mb-1">Rekomendacijos</h1>
      <p className="text-sm text-slate-400 mb-6">Gauti AI pasiūlymus pasirenkimiems dalykams</p>

      <div className="max-w-xl mb-6">
        <RecommendationResult recommendation={mockRecommendation} />
      </div>

      <ChatWindow />
    </div>
  )
}
