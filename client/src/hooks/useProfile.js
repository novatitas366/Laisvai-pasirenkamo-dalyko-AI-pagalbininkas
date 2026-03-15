import { useState, useEffect } from 'react'

export default function useProfile() {
  const [profile, setProfile] = useState({
    university: '',
    studyProgram: '',
    hobbies: '',
  })

  useEffect(() => {
    setProfile({
      university: localStorage.getItem('profile_university') || '',
      studyProgram: localStorage.getItem('profile_study_program') || '',
      hobbies: localStorage.getItem('profile_hobbies') || '',
    })
  }, [])

  const isEmpty = !profile.university && !profile.studyProgram && !profile.hobbies

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
    if (profile.hobbies) parts.push(`- Hobiai / pomėgiai: ${profile.hobbies}`)

    parts.push(
      'Remdamasis šia informacija, teik personalizuotas rekomendacijas apie pasirenkamus dalykus.',
      'Atsižvelk į vartotojo studijų programą ir pomėgius, kai siūlai dalykus.',
    )

    return parts.join('\n')
  }

  return { profile, isEmpty, buildSystemPrompt }
}
