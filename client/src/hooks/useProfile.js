import { useState, useEffect } from 'react'

const MIN_HOBBY_NAME_LENGTH = 4

function isValidHobby(hobby) {
  return hobby.name.trim().length >= MIN_HOBBY_NAME_LENGTH
}

function loadHobbies() {
  try {
    const saved = localStorage.getItem('hobbies')
    return saved ? JSON.parse(saved) : []
  } catch {
    return []
  }
}

export default function useProfile() {
  const [profile, setProfile] = useState({
    university: '',
    studyProgram: '',
    hobbies: [],
  })

  useEffect(() => {
    setProfile({
      university: localStorage.getItem('profile_university') || '',
      studyProgram: localStorage.getItem('profile_study_program') || '',
      hobbies: loadHobbies(),
    })
  }, [])

  const validHobbies = profile.hobbies.filter(isValidHobby)
  const hasValidHobbies = validHobbies.length > 0
  const isEmpty = !profile.university && !profile.studyProgram && !hasValidHobbies

  const buildSystemPrompt = () => {
    if (isEmpty) {
      return 'Esi universitetinio studento pasirenkamų dalykų patarėjas. Padėk studentui pasirinkti tinkamus pasirenkamus dalykus.'
    }

    const parts = [
      'Esi universitetinio studento pasirenkamų dalykų patarėjas.',
      'Štai vartotojo profilis:',
    ]

    if (profile.university) parts.push(`- Universitetas: ${profile.university}`)
    if (profile.studyProgram) parts.push(`- Studijų programa: ${profile.studyProgram}`)
    if (hasValidHobbies) {
      const hobbiesList = validHobbies.map(h => h.description ? `${h.name} (${h.description})` : h.name).join(', ')
      parts.push(`- Hobiai / pomėgiai: ${hobbiesList}`)
    }

    parts.push(
      'Remdamasis šia informacija, teik personalizuotas rekomendacijas apie pasirenkamus dalykus.',
      'Atsižvelk į vartotojo studijų programą ir pomėgius, kai siūlai dalykus.',
    )

    return parts.join('\n')
  }

  return { profile, validHobbies, hasValidHobbies, isEmpty, buildSystemPrompt }
}
