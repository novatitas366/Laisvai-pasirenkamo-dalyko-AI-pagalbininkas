// Grynosios dalykų katalogo funkcijos – be React, todėl testuojamos atskirai.

export function groupBySemester(subjects) {
  const grouped = {}
  subjects.forEach((subject) => {
    if (!grouped[subject.semester]) grouped[subject.semester] = []
    grouped[subject.semester].push(subject)
  })
  return grouped
}

export function sortSemesters(semesters) {
  return [...semesters].sort((a, b) => Number(a) - Number(b))
}

export function filterSubjects(subjects, query) {
  const q = query.trim().toLowerCase()
  if (!q) return subjects
  return subjects.filter(
    (s) => s.name.toLowerCase().includes(q) || (s.code && s.code.toLowerCase().includes(q))
  )
}
