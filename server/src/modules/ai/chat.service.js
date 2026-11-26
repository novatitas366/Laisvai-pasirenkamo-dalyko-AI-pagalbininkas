// Grynosios pokalbio atsakymo formavimo funkcijos (be HTTP ir DB).

function formatSubjectLine(subject, explanation) {
  return `**${subject}** — ${explanation ?? ''}`
}

/**
 * Prie AI teksto prideda rekomenduojamų dalykų sąrašą.
 * Be rekomendacijos grąžina tekstą nepakeistą.
 */
export function formatRecommendation(text, recommendation) {
  if (!recommendation) return text

  const list = recommendation.subjects
    .map((subject, i) => formatSubjectLine(subject, recommendation.explanations[i]))
    .join('\n')

  return text ? `${text}\n${list}` : list
}
