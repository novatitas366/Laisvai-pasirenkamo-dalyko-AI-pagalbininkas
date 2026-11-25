import { useState } from 'react'
import ProgramCard from './ProgramCard'
import SemesterTabs from './SemesterTabs'
import SubjectSearch from './SubjectSearch'
import SubjectList from './SubjectList'
import { LoadingIndicator, ErrorMessage } from './CatalogStatus'

// Pasirinktos programos dalykai: semestrų skirtukai, paieška ir sąrašas.
export default function ProgramSubjects({ program, catalog }) {
  const { subjectsLoading, subjectsError, subjectsBySemester, semesters, activeTab, setActiveTab } = catalog
  const [searchQuery, setSearchQuery] = useState('')

  const showSubjects = !subjectsLoading && !subjectsError && semesters.length > 0
  const activeSubjects = activeTab ? subjectsBySemester[activeTab] : null

  return (
    <>
      <ProgramCard program={program} />

      {subjectsLoading && <LoadingIndicator text="Kraunami dalykai..." padding="py-8" />}
      {subjectsError && <ErrorMessage message={subjectsError} />}

      {showSubjects && (
        <>
          <SemesterTabs
            semesters={semesters}
            subjectsBySemester={subjectsBySemester}
            activeTab={activeTab}
            onSelect={setActiveTab}
          />
          <SubjectSearch value={searchQuery} onChange={setSearchQuery} />
          {activeSubjects && <SubjectList subjects={activeSubjects} searchQuery={searchQuery} />}
        </>
      )}
    </>
  )
}
