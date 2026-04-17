export default function ChatMessage({ message }) {
  const isUser = message.role === 'user'

  if (isUser) {
    const textContent = message.text || message.content
    return (
      <div className="flex justify-end">
        <div className="max-w-[75%] px-4 py-3 rounded-2xl rounded-br-md text-sm bg-brand-600 text-white shadow-sm">
          {message.image && (
            <img
              src={message.image}
              alt="Pridėta nuotrauka"
              className="max-w-full max-h-48 rounded-lg mb-2"
            />
          )}
          {textContent && <p className="whitespace-pre-wrap">{textContent}</p>}
        </div>
      </div>
    )
  }

  // DI atsakymas — struktūrizuotas arba paprastas
  const { text, content, recommendations, arguments: args, disclaimer } = message
  const assistantText = text || content

  return (
    <div className="flex justify-start">
      <div className="max-w-[80%] rounded-2xl rounded-bl-md text-sm bg-white border border-slate-200 text-slate-700 overflow-hidden shadow-sm">

        {/* Paprastas tekstas arba įžanga */}
        {assistantText && (
          <div className="px-4 py-3">
            <p className="whitespace-pre-wrap">{assistantText}</p>
          </div>
        )}

        {/* Rekomendacijos */}
        {recommendations && recommendations.length > 0 && (
          <div className="border-t border-slate-100 px-4 py-3">
            <p className="text-xs font-semibold text-brand-600 uppercase tracking-wide mb-2">
              Rekomenduojami dalykrai
            </p>
            <div className="space-y-2">
              {recommendations.map((rec, i) => (
                <div key={i} className="flex gap-2">
                  <span className="flex-shrink-0 w-5 h-5 rounded-full bg-brand-50 text-brand-700 text-xs flex items-center justify-center font-semibold">
                    {i + 1}
                  </span>
                  <div>
                    <p className="font-medium text-slate-800">{rec.name}</p>
                    {rec.reason && (
                      <p className="text-xs text-slate-500 mt-0.5">{rec.reason}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Argumentai */}
        {args && args.length > 0 && (
          <div className="border-t border-slate-100 px-4 py-3 bg-slate-50">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">
              Argumentai
            </p>
            <ul className="space-y-1">
              {args.map((arg, i) => (
                <li key={i} className="flex gap-2 text-xs text-slate-600">
                  <span className="text-brand-400 flex-shrink-0">•</span>
                  {arg}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Atsakomybės apribojimas */}
        {disclaimer && (
          <div className="border-t border-slate-100 px-4 py-2">
            <p className="text-xs text-slate-400 italic">{disclaimer}</p>
          </div>
        )}
      </div>
    </div>
  )
}
