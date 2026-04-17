export const SYSTEM_PROMPT = `Esi studijų konsultantas, padedantis studentams pasirinkti laisvai pasirenkamą dalyką universitete.
Remiantis studento profiliu, rekomenduok VIENĄ geriausiai tinkantį laisvai pasirenkamą dalyką.

Atsakyk TIKTAI JSON formatu be jokio papildomo teksto:
{"recommendedSubject": "<dalyko pavadinimas>", "explanation": "<2-3 sakinių paaiškinimas kodėl šis dalykas tinkamas>"}

Kalba: lietuvių.`

export function buildUserMessage(context) {
  const { studyProgram, electiveInterests, hobbies, completedCourses } = context

  const lines = [`Studijų programa: ${studyProgram}`]

  if (electiveInterests?.length > 0) {
    lines.push(`Dominantys laisvai pasirenkami dalykai: ${electiveInterests.join(', ')}`)
  }

  if (hobbies?.length > 0) {
    const hobbyNames = hobbies.map(h => (typeof h === 'object' ? h.name : h)).filter(Boolean)
    if (hobbyNames.length > 0) {
      lines.push(`Pomėgiai: ${hobbyNames.join(', ')}`)
    }
  }

  if (completedCourses?.length > 0) {
    lines.push(`Jau išklausyti dalykai: ${completedCourses.join(', ')}`)
  }

  return lines.join('\n')
}
