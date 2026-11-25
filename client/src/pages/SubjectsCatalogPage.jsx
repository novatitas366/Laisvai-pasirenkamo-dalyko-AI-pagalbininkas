import useSubjectsCatalog from '../hooks/useSubjectsCatalog'
import NoProgramSelected from '../components/catalog/NoProgramSelected'
import ProgramSubjects from '../components/catalog/ProgramSubjects'
import { LoadingIndicator, ErrorMessage } from '../components/catalog/CatalogStatus'

export default function SubjectsCatalogPage() {
  const catalog = useSubjectsCatalog()
  const { programsLoading, programsError, selectedProgram } = catalog
  const programsReady = !programsLoading && !programsError

  return (
    <div className="max-w-3xl">
      <h1 className="text-2xl font-bold text-slate-900 mb-1">Dalykų katalogas</h1>
      <p className="text-sm text-slate-400 mb-8">Jūsų studijų programos dalykai</p>

      {programsLoading && <LoadingIndicator text="Kraunama..." padding="py-12" />}
      {programsError && <ErrorMessage message={programsError} />}
      {programsReady && !selectedProgram && <NoProgramSelected />}
      {programsReady && selectedProgram && <ProgramSubjects program={selectedProgram} catalog={catalog} />}
    </div>
  )
}
