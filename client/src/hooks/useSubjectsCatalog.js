import { useState, useEffect } from 'react'
import api from '../services/api'
import { groupBySemester, sortSemesters } from '../utils/subjects'

const STORAGE_KEY = 'profile_study_program'

// Studijų programų ir pasirinktos programos dalykų krovimas.
export default function useSubjectsCatalog() {
  const [programs, setPrograms] = useState([])
  const [programsLoading, setProgramsLoading] = useState(true)
  const [programsError, setProgramsError] = useState(null)

  const [subjectsBySemester, setSubjectsBySemester] = useState({})
  const [subjectsLoading, setSubjectsLoading] = useState(false)
  const [subjectsError, setSubjectsError] = useState(null)
  const [activeTab, setActiveTab] = useState(null)

  const storedName = localStorage.getItem(STORAGE_KEY) ?? ''

  useEffect(() => {
    api.get('/study-programs')
      .then(({ data }) => setPrograms(data))
      .catch(() => setProgramsError('Nepavyko užkrauti studijų programų'))
      .finally(() => setProgramsLoading(false))
  }, [])

  const selectedProgram = programs.find((p) => p.name === storedName) ?? null

  useEffect(() => {
    if (!selectedProgram) return

    setSubjectsLoading(true)
    setSubjectsError(null)
    setSubjectsBySemester({})
    setActiveTab(null)

    api.get(`/study-programs/${selectedProgram.id}/subjects`)
      .then(({ data }) => {
        const grouped = groupBySemester(data)
        setSubjectsBySemester(grouped)
        setActiveTab(sortSemesters(Object.keys(grouped))[0] ?? null)
      })
      .catch(() => setSubjectsError('Nepavyko užkrauti dalykų'))
      .finally(() => setSubjectsLoading(false))
  }, [selectedProgram?.id])

  return {
    programsLoading,
    programsError,
    selectedProgram,
    subjectsLoading,
    subjectsError,
    subjectsBySemester,
    semesters: sortSemesters(Object.keys(subjectsBySemester)),
    activeTab,
    setActiveTab,
  }
}
