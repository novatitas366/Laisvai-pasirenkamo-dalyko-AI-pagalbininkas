import ChatWindow from '../components/chat/ChatWindow'

export default function RecommendationsPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900 mb-1">Rekomendacijos</h1>
      <p className="text-sm text-slate-400 mb-6">Gauti AI pasiūlymus pasirenkimiems dalykams</p>

      <ChatWindow />
    </div>
  )
}
