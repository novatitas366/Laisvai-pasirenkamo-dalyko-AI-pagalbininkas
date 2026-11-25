import { groupBySemester, sortSemesters, filterSubjects } from './subjects'

const SUBJECTS = [
  { id: 1, name: 'Algoritmai', code: 'ALG001', semester: 1 },
  { id: 2, name: 'Duomenų struktūros', code: 'DS001', semester: 1 },
  { id: 3, name: 'Matematinė analizė', code: null, semester: 2 },
]

describe('groupBySemester', () => {
  test('sugrupuoja dalykus pagal semestrą', () => {
    expect(groupBySemester(SUBJECTS)).toEqual({
      1: [SUBJECTS[0], SUBJECTS[1]],
      2: [SUBJECTS[2]],
    })
  })

  test('tuščias sąrašas grąžina tuščią objektą', () => {
    expect(groupBySemester([])).toEqual({})
  })
})

describe('sortSemesters', () => {
  test('rūšiuoja skaitine, o ne abėcėlės tvarka', () => {
    expect(sortSemesters(['10', '2', '1'])).toEqual(['1', '2', '10'])
  })

  test('nekeičia pradinio masyvo', () => {
    const input = ['2', '1']
    sortSemesters(input)
    expect(input).toEqual(['2', '1'])
  })
})

describe('filterSubjects', () => {
  test('tuščia paieška grąžina visus dalykus', () => {
    expect(filterSubjects(SUBJECTS, '   ')).toBe(SUBJECTS)
  })

  test('ieško pagal pavadinimą, nepaisant raidžių dydžio', () => {
    expect(filterSubjects(SUBJECTS, 'ALGO')).toEqual([SUBJECTS[0]])
  })

  test('ieško pagal kodą', () => {
    expect(filterSubjects(SUBJECTS, 'ds001')).toEqual([SUBJECTS[1]])
  })

  test('dalykas be kodo nesukelia klaidos', () => {
    expect(filterSubjects(SUBJECTS, 'analizė')).toEqual([SUBJECTS[2]])
  })

  test('neradus grąžina tuščią sąrašą', () => {
    expect(filterSubjects(SUBJECTS, 'chemija')).toEqual([])
  })
})
