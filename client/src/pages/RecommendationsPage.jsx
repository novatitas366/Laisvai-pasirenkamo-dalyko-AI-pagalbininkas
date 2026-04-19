import ChatWindow from '../components/chat/ChatWindow'

export default function RecommendationsPage() {
  return (
    <div className="flex flex-col h-full">
      <div className="max-w-xl mb-4">
        <h1 className="text-2xl font-bold text-slate-900 mb-1">Rekomendacijos</h1>
        <p className="text-sm text-slate-400">Gauti AI pasiūlymus pasirenkimiems dalykams</p>
      </div>

      <div className="w-full">
        <ChatWindow />
      </div>
    </div>
  )
}
