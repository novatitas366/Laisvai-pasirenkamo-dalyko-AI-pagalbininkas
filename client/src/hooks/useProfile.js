import { useState, useEffect } from 'react'
import { isValidHobby, loadHobbies } from '../utils/hobbyValidation'
import dominantSubjectsList from '../data/dominantSubjects'
import api from '../services/api'

const MAX_DOC_CHARS = 3000

export default function useProfile() {
  const [profile, setProfile] = useState({
    university: '',
    studyProgram: '',
    hobbies: [],
    dominantSubjects: [],
    documents: [],
  })

  useEffect(() => {
    const base = {
      university: localStorage.getItem('profile_university') || '',
      studyProgram: localStorage.getItem('profile_study_program') || '',
      hobbies: loadHobbies(),
      dominantSubjects: [],
      documents: [],
    }

    Promise.allSettled([
      api.get('/user/dominant-subjects'),
      api.get('/documents/texts'),
    ]).then(([dominantRes, docsRes]) => {
      const names = dominantRes.status === 'fulfilled'
        ? dominantSubjectsList
            .filter(s => dominantRes.value.data.subjects.includes(s.id))
            .map(s => s.name)
        : []

      const documents = docsRes.status === 'fulfilled'
        ? docsRes.value.data.documents ?? []
        : []

      setProfile({ ...base, dominantSubjects: names, documents })
    })
  }, [])

  const validHobbies = profile.hobbies.filter(isValidHobby)
  const hasValidHobbies = validHobbies.length > 0
  const isEmpty = !profile.university && !profile.studyProgram && !hasValidHobbies
    && profile.dominantSubjects.length === 0 && profile.documents.length === 0

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
    if (profile.dominantSubjects.length > 0) {
      parts.push(`- Dominantys studijų dalykai (prioritetai): ${profile.dominantSubjects.join(', ')}`)
    }
    if (profile.documents.length > 0) {
      parts.push('- Vartotojo pateikti dokumentai (tekstas gali būti sutrumpintas):')
      profile.documents.forEach(doc => {
        const preview = doc.text.length > MAX_DOC_CHARS
          ? doc.text.slice(0, MAX_DOC_CHARS) + '... [tekstas sutrumpintas]'
          : doc.text
        parts.push(`  [${doc.name}]: ${preview}`)
      })
    }

    parts.push(
      'Svarbu: studentas gali pasirinkti TIK VIENĄ laisvai pasirenkamą dalyką — ne daugiau.',
      'Remdamasis šia informacija, rekomenduok vieną tinkamiausią pasirenkamą dalyką.',
      'Atsižvelk į vartotojo studijų programą, pomėgius, dominančius dalykus ir pateiktus dokumentus.',
    )

    return parts.join('\n')
  }

  return { profile, validHobbies, hasValidHobbies, isEmpty, buildSystemPrompt }
}
