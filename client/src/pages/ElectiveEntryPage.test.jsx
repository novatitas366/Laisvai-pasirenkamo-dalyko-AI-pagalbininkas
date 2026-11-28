import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import ElectiveEntryPage from './ElectiveEntryPage'
import api from '../services/api'

jest.mock('../services/api')

const nameInputs = () => screen.getAllByPlaceholderText('Pvz.: Dirbtinis intelektas')
const creditsInputs = () => screen.getAllByPlaceholderText('6')
const descriptionInputs = () =>
  screen.getAllByPlaceholderText('Trumpai apibūdinkite dalyko temas, tikslus ar reikalavimus...')

const typeName = (value, index = 0) => fireEvent.change(nameInputs()[index], { target: { value } })
const typeCredits = (value, index = 0) => fireEvent.change(creditsInputs()[index], { target: { value } })
const typeDescription = (value, index = 0) =>
  fireEvent.change(descriptionInputs()[index], { target: { value } })

const addEntry = () => fireEvent.click(screen.getByRole('button', { name: /Pridėti kitą/ }))
const submit = () => fireEvent.click(screen.getByRole('button', { name: 'Išsaugoti visus' }))

describe('ElectiveEntryPage', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    api.post.mockResolvedValue({ data: {} })
    let now = 1000
    jest.spyOn(Date, 'now').mockImplementation(() => now++)
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  describe('validate – ND1 3.4 atvejai', () => {
    test('1. kai sąrašas tuščias – rodoma bendra klaida, duomenys nesiunčiami', () => {
      render(<ElectiveEntryPage />)

      typeName('   ')
      submit()

      expect(
        screen.getByText('Sąrašas negali būti tuščias. Įveskite bent vieno dalyko pavadinimą.')
      ).toBeInTheDocument()
      expect(api.post).not.toHaveBeenCalled()
    })

    test('2. kai pavadinimas tuščias – „Pavadinimas privalomas“', () => {
      render(<ElectiveEntryPage />)

      typeName('Dirbtinis intelektas')
      typeCredits('6')
      addEntry()
      submit()

      expect(screen.getByText('Pavadinimas privalomas')).toBeInTheDocument()
      expect(api.post).not.toHaveBeenCalled()
    })

    test('3. kai pavadinimas ilgesnis nei 50 simbolių – „Pavadinimas per ilgas (maks. 50)“', () => {
      render(<ElectiveEntryPage />)

      typeName('a'.repeat(51))
      typeCredits('6')
      submit()

      expect(screen.getByText('Pavadinimas per ilgas (maks. 50)')).toBeInTheDocument()
      expect(api.post).not.toHaveBeenCalled()
    })

    test('4. kai aprašymas ilgesnis nei 2000 simbolių – „Aprašymas per ilgas (maks. 2000)“', () => {
      render(<ElectiveEntryPage />)

      typeName('Dirbtinis intelektas')
      typeCredits('6')
      typeDescription('a'.repeat(2001))
      submit()

      expect(screen.getByText('Aprašymas per ilgas (maks. 2000)')).toBeInTheDocument()
      expect(api.post).not.toHaveBeenCalled()
    })

    test('5. kai neįvesti kreditai – „Kreditai privalomi“', () => {
      render(<ElectiveEntryPage />)

      typeName('Dirbtinis intelektas')
      submit()

      expect(screen.getByText('Kreditai privalomi')).toBeInTheDocument()
      expect(api.post).not.toHaveBeenCalled()
    })

    test('6. kai kreditai neigiami – „Kreditai turi būti teigiamas skaičius“', () => {
      render(<ElectiveEntryPage />)

      typeName('Dirbtinis intelektas')
      typeCredits('-1')
      submit()

      expect(screen.getByText('Kreditai turi būti teigiamas skaičius')).toBeInTheDocument()
      expect(api.post).not.toHaveBeenCalled()
    })

    test('7. kai pavadinimas kartojasi (be didžiųjų raidžių ir tarpų skirtumo) – klaida tik antram įrašui', () => {
      render(<ElectiveEntryPage />)

      typeName('Dirbtinis intelektas')
      typeCredits('6')
      addEntry()
      typeName('  dirbtinis INTELEKTAS ', 1)
      typeCredits('5', 1)
      submit()

      const errors = screen.getAllByText('Šis pavadinimas jau naudojamas sąraše')
      expect(errors).toHaveLength(1)
      expect(nameInputs()[1].closest('.relative')).toContainElement(errors[0])
      expect(api.post).not.toHaveBeenCalled()
    })

    test('8. kai visi duomenys teisingi – duomenys išsiunčiami, rodomas pranešimas, forma išvaloma', async () => {
      render(<ElectiveEntryPage />)

      typeName('Dirbtinis intelektas')
      typeCredits('6')
      typeDescription('Neuroniniai tinklai')
      submit()

      await waitFor(() => expect(screen.getByText('Dalykai sėkmingai išsaugoti!')).toBeInTheDocument())
      expect(api.post).toHaveBeenCalledTimes(1)
      expect(api.post).toHaveBeenCalledWith('/elective-courses', {
        entries: [
          expect.objectContaining({
            name: 'Dirbtinis intelektas',
            credits: '6',
            description: 'Neuroniniai tinklai',
            error: '',
          }),
        ],
      })
      expect(nameInputs()).toHaveLength(1)
      expect(nameInputs()[0]).toHaveValue('')
    })
  })

  describe('handleUpdate – tikrinimas rašant', () => {
    test('pavadinimas iš 50 simbolių priimamas, iš 51 – rodoma klaida', () => {
      render(<ElectiveEntryPage />)

      typeName('a'.repeat(50))
      expect(screen.queryByText('Pavadinimas negali viršyti 50 simbolių')).not.toBeInTheDocument()

      typeName('a'.repeat(51))
      expect(screen.getByText('Pavadinimas negali viršyti 50 simbolių')).toBeInTheDocument()
    })

    test('aprašymas iš 2000 simbolių priimamas, iš 2001 – rodoma klaida', () => {
      render(<ElectiveEntryPage />)

      typeDescription('a'.repeat(2000))
      expect(screen.queryByText('Aprašymas negali viršyti 2000 simbolių')).not.toBeInTheDocument()

      typeDescription('a'.repeat(2001))
      expect(screen.getByText('Aprašymas negali viršyti 2000 simbolių')).toBeInTheDocument()
    })

    test('kreditai 0 – rodoma klaida; ištrynus kreditus klaida dingsta', () => {
      render(<ElectiveEntryPage />)

      typeCredits('0')
      expect(screen.getByText('Kreditai turi būti teigiamas skaičius')).toBeInTheDocument()

      typeCredits('')
      expect(screen.queryByText('Kreditai turi būti teigiamas skaičius')).not.toBeInTheDocument()
    })

    test('ištaisius lauką klaida dingsta', () => {
      render(<ElectiveEntryPage />)

      typeName('a'.repeat(51))
      expect(screen.getByText('Pavadinimas negali viršyti 50 simbolių')).toBeInTheDocument()

      typeName('a'.repeat(50))
      expect(screen.queryByText('Pavadinimas negali viršyti 50 simbolių')).not.toBeInTheDocument()
    })

    test('rašant paslepiama bendra formos klaida', () => {
      render(<ElectiveEntryPage />)

      submit()
      expect(
        screen.getByText('Sąrašas negali būti tuščias. Įveskite bent vieno dalyko pavadinimą.')
      ).toBeInTheDocument()

      typeName('D')
      expect(
        screen.queryByText('Sąrašas negali būti tuščias. Įveskite bent vieno dalyko pavadinimą.')
      ).not.toBeInTheDocument()
    })

    test('rašant paslepiamas sėkmės pranešimas', async () => {
      render(<ElectiveEntryPage />)

      typeName('Dirbtinis intelektas')
      typeCredits('6')
      submit()
      await waitFor(() => expect(screen.getByText('Dalykai sėkmingai išsaugoti!')).toBeInTheDocument())

      typeName('D')
      expect(screen.queryByText('Dalykai sėkmingai išsaugoti!')).not.toBeInTheDocument()
    })
  })

  describe('validate – tikrinimo tvarka ir kraštiniai atvejai', () => {
    test('kai įraše kelios klaidos, rodoma tik pirmoji pagal tvarką (pavadinimas prieš kreditus)', () => {
      render(<ElectiveEntryPage />)

      typeName('a'.repeat(51))
      submit()

      expect(screen.getByText('Pavadinimas per ilgas (maks. 50)')).toBeInTheDocument()
      expect(screen.queryByText('Kreditai privalomi')).not.toBeInTheDocument()
    })

    test('tikrinimas nesustoja ties pirmu klaidingu įrašu – klaidą gauna kiekvienas', () => {
      render(<ElectiveEntryPage />)

      typeName('Dirbtinis intelektas')
      addEntry()
      typeName('Kompiuterių tinklai', 1)
      typeCredits('0', 1)
      submit()

      expect(screen.getByText('Kreditai privalomi')).toBeInTheDocument()
      expect(screen.getByText('Kreditai turi būti teigiamas skaičius')).toBeInTheDocument()
      expect(api.post).not.toHaveBeenCalled()
    })

    test('įrašas, kliuvęs ankstesnei taisyklei, neįtraukiamas į dublikatų tikrinimą', () => {
      render(<ElectiveEntryPage />)

      typeName('Dirbtinis intelektas')
      addEntry()
      typeName('Dirbtinis intelektas', 1)
      typeCredits('5', 1)
      submit()

      expect(screen.getByText('Kreditai privalomi')).toBeInTheDocument()
      expect(screen.queryByText('Šis pavadinimas jau naudojamas sąraše')).not.toBeInTheDocument()
    })

    test('pavadinimo ilgis skaičiuojamas be trim: 50 simbolių su tarpais kraštuose – per ilgas (F3)', () => {
      render(<ElectiveEntryPage />)

      typeName(` ${'a'.repeat(50)} `)
      typeCredits('6')
      submit()

      expect(screen.getByText('Pavadinimas per ilgas (maks. 50)')).toBeInTheDocument()
      expect(api.post).not.toHaveBeenCalled()
    })
  })

  describe('pateikimas – serverio klaidos', () => {
    test('rodomas serverio grąžintas klaidos tekstas', async () => {
      api.post.mockRejectedValueOnce({ response: { data: { error: 'Dalykas jau yra išsaugotas' } } })
      render(<ElectiveEntryPage />)

      typeName('Dirbtinis intelektas')
      typeCredits('6')
      submit()

      await waitFor(() => expect(screen.getByText('Dalykas jau yra išsaugotas')).toBeInTheDocument())
      expect(nameInputs()[0]).toHaveValue('Dirbtinis intelektas')
    })

    test('kai serveris klaidos teksto negrąžina, rodomas numatytasis pranešimas', async () => {
      api.post.mockRejectedValueOnce(new Error('Network Error'))
      render(<ElectiveEntryPage />)

      typeName('Dirbtinis intelektas')
      typeCredits('6')
      submit()

      await waitFor(() =>
        expect(screen.getByText('Nepavyko išsaugoti duomenų. Bandykite dar kartą.')).toBeInTheDocument()
      )
    })
  })
})
