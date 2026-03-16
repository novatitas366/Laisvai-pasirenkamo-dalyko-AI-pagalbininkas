export default function RecommendationResult({ recommendation }) {
  if (!recommendation) return null

  const { recommendedSubject, explanation } = recommendation

  return (
    <div className="border border-brand-200 bg-brand-50 rounded-xl p-5">
      <div className="flex items-center gap-2 mb-3">
        <div className="w-8 h-8 rounded-full bg-brand-100 flex items-center justify-center flex-shrink-0">
          <svg className="w-4 h-4 text-brand-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
          </svg>
        </div>
        <p className="text-xs font-semibold text-brand-600 uppercase tracking-wide">
          DI rekomendacija
        </p>
      </div>

      <p className="text-base font-semibold text-slate-900 mb-2">
        {recommendedSubject}
      </p>

      <p className="text-sm text-slate-600 leading-relaxed">
        {explanation}
      </p>
    </div>
  )
}
