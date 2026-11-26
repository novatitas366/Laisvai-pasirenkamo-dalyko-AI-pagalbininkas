/**
 * Charakterizaciniai testai: HobbyEntry komponentas (HobbiesForm.jsx)
 *
 * ND2, Studentas 2, vieta A2. Testai užfiksuoja DABARTINĘ lauko būsenos
 * logiką (rėmelio spalva, pranešimas, simbolių skaitiklis) prieš pertvarkymą;
 * po pertvarkymo jie turi praeiti nepakeisti.
 *
 * HobbyEntry neeksportuojamas, todėl testuojamas per HobbiesForm:
 * hobis įdedamas į localStorage (API mock grąžina tuščią sąrašą),
 * o laukų reikšmės keičiamos per fireEvent.change.
 *
 * Paleidimas: npm run test:s2:hobbies
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import HobbiesForm from './HobbiesForm'
import api from '../../services/api'

const NAME_PLACEHOLDER = 'Pavadinimas (min. 4 simboliai)'
const DESC_PLACEHOLDER = 'Aprašymas (min. 4 simboliai)'

async function renderWithHobby(hobby = { id: 1, name: 'Šachmatai', description: 'Žaidžiu klube' }) {
  localStorage.setItem('hobbies', JSON.stringify([hobby]))
  render(<HobbiesForm />)
  const nameInput = await screen.findByPlaceholderText(NAME_PLACEHOLDER)
  const descInput = screen.getByPlaceholderText(DESC_PLACEHOLDER)
  return { nameInput, descInput }
}

function saveButton() {
  return screen.getByRole('button', { name: 'Išsaugoti' })
}

beforeEach(() => {
  localStorage.clear()
})

describe('HobbyEntry – lauko būsena', () => {
  it('teisingi laukai: pilkas rėmelis, jokių pranešimų, saugoti galima', async () => {
    const { nameInput, descInput } = await renderWithHobby()

    expect(nameInput).toHaveClass('border-slate-200')
    expect(descInput).toHaveClass('border-slate-200')
    expect(screen.queryByText(/per trumpas/)).not.toBeInTheDocument()
    expect(screen.queryByText(/negali viršyti/)).not.toBeInTheDocument()
    expect(screen.getByText('9/20')).toHaveClass('text-slate-400')
    expect(screen.getByText('13/150')).toHaveClass('text-slate-400')
    await waitFor(() => expect(saveButton()).toBeEnabled())
  })

  it('per trumpas pavadinimas: geltonas rėmelis ir įspėjimas', async () => {
    const { nameInput } = await renderWithHobby()

    fireEvent.change(nameInput, { target: { value: 'Ab' } })

    expect(nameInput).toHaveClass('border-amber-300')
    expect(screen.getByText('Pavadinimas per trumpas (min. 4 simboliai)')).toHaveClass('text-amber-500')
    expect(screen.getByText('2/20')).toHaveClass('text-slate-400')
    expect(saveButton()).toBeDisabled()
  })

  it('per ilgas pavadinimas: raudonas rėmelis, klaida ir raudonas skaitiklis', async () => {
    const { nameInput } = await renderWithHobby()

    fireEvent.change(nameInput, { target: { value: 'a'.repeat(21) } })

    expect(nameInput).toHaveClass('border-red-400')
    expect(screen.getByText('Pavadinimas negali viršyti 20 simbolių')).toHaveClass('text-red-500')
    expect(screen.getByText('21/20')).toHaveClass('text-red-500')
    expect(screen.queryByText(/Pavadinimas per trumpas/)).not.toBeInTheDocument()
    expect(saveButton()).toBeDisabled()
  })

  it('per trumpas aprašymas: geltonas rėmelis ir įspėjimas', async () => {
    const { descInput } = await renderWithHobby()

    fireEvent.change(descInput, { target: { value: 'abc' } })

    expect(descInput).toHaveClass('border-amber-300')
    expect(screen.getByText('Aprašymas per trumpas (min. 4 simboliai)')).toHaveClass('text-amber-500')
    expect(screen.getByText('3/150')).toHaveClass('text-slate-400')
    expect(saveButton()).toBeDisabled()
  })

  it('per ilgas aprašymas: raudonas rėmelis, klaida ir raudonas skaitiklis', async () => {
    const { descInput } = await renderWithHobby()

    fireEvent.change(descInput, { target: { value: 'a'.repeat(151) } })

    expect(descInput).toHaveClass('border-red-400')
    expect(screen.getByText('Aprašymas negali viršyti 150 simbolių')).toHaveClass('text-red-500')
    expect(screen.getByText('151/150')).toHaveClass('text-red-500')
    expect(screen.queryByText(/Aprašymas per trumpas/)).not.toBeInTheDocument()
    expect(saveButton()).toBeDisabled()
  })
})

describe('HobbyEntry – ribiniai atvejai', () => {
  it('tuščias laukas nelaikomas per trumpu: pilkas rėmelis, be įspėjimo', async () => {
    const { nameInput, descInput } = await renderWithHobby({ id: 1, name: '', description: '' })

    expect(nameInput).toHaveClass('border-slate-200')
    expect(descInput).toHaveClass('border-slate-200')
    expect(screen.queryByText(/per trumpas/)).not.toBeInTheDocument()
  })

  it('tik tarpai pavadinime nelaikomi per trumpu (tikrinama po trim)', async () => {
    const { nameInput } = await renderWithHobby()

    fireEvent.change(nameInput, { target: { value: '   ' } })

    expect(nameInput).toHaveClass('border-slate-200')
    expect(screen.queryByText(/Pavadinimas per trumpas/)).not.toBeInTheDocument()
  })

  it('ribinės reikšmės: 20 simbolių pavadinimas ir 150 simbolių aprašymas dar leidžiami', async () => {
    const { nameInput, descInput } = await renderWithHobby()

    fireEvent.change(nameInput, { target: { value: 'a'.repeat(20) } })
    fireEvent.change(descInput, { target: { value: 'a'.repeat(150) } })

    expect(nameInput).toHaveClass('border-slate-200')
    expect(descInput).toHaveClass('border-slate-200')
    expect(screen.getByText('20/20')).toHaveClass('text-slate-400')
    expect(screen.getByText('150/150')).toHaveClass('text-slate-400')
    expect(saveButton()).toBeEnabled()
  })

  it('ilgis viršija ribą skaičiuojamas be trim, o trumpumas – su trim', async () => {
    const { nameInput } = await renderWithHobby()

    fireEvent.change(nameInput, { target: { value: ' ab' + ' '.repeat(18) } })

    expect(nameInput).toHaveClass('border-red-400')
    expect(screen.getByText('Pavadinimas negali viršyti 20 simbolių')).toBeInTheDocument()
  })
})

/*
 * Likusi HobbiesForm elgsena. Pertvarkoma vieta yra HobbyEntry, bet testai
 * padengia visą failą, kad padengimas siektų užduotyje rekomenduojamus
 * 80–100 % ir pertvarkymas netyčia nepaveiktų formos logikos.
 */

describe('HobbiesForm – duomenų krovimas, pridėjimas ir saugojimas', () => {
  beforeEach(() => {
    api.get.mockImplementation(() => Promise.resolve({ data: [] }))
    api.put = jest.fn(() => Promise.resolve({ data: {} }))
  })

  it('kai hobių nėra, rodoma tuščia būsena', async () => {
    render(<HobbiesForm />)

    expect(await screen.findByText('Nėra pridėtų hobių')).toBeInTheDocument()
  })

  it('hobius užkrauna iš API ir išsaugo juos localStorage', async () => {
    api.get.mockImplementation(() =>
      Promise.resolve({ data: [{ id: 7, name: 'Krepšinis', description: null }] })
    )

    render(<HobbiesForm />)

    expect(await screen.findByDisplayValue('Krepšinis')).toBeInTheDocument()
    expect(screen.getByPlaceholderText(DESC_PLACEHOLDER)).toHaveValue('')
    expect(JSON.parse(localStorage.getItem('hobbies'))).toEqual([
      { id: 7, name: 'Krepšinis', description: '' },
    ])
  })

  it('nepavykus užkrauti iš API, hobius ima iš localStorage', async () => {
    api.get.mockImplementation(() => Promise.reject(new Error('Tinklo klaida')))
    localStorage.setItem('hobbies', JSON.stringify([{ id: 1, name: 'Muzika', description: 'Groju gitara' }]))

    render(<HobbiesForm />)

    expect(await screen.findByDisplayValue('Muzika')).toBeInTheDocument()
  })

  it('mygtukas „Pridėti hobį“ prideda tuščią įrašą ir rodo skaitiklį', async () => {
    render(<HobbiesForm />)
    await screen.findByText('Nėra pridėtų hobių')

    fireEvent.click(screen.getByRole('button', { name: /Pridėti hobį/ }))

    expect(screen.getByPlaceholderText(NAME_PLACEHOLDER)).toHaveValue('')
    expect(screen.getByRole('button', { name: /Pridėti hobį \(1\/10\)/ })).toBeInTheDocument()
  })

  it('pasiekus 10 hobių, pridėti daugiau negalima', async () => {
    const hobbies = Array.from({ length: 10 }, (_, i) => ({ id: i + 1, name: `Hobis ${i}`, description: 'Aprašymas' }))
    localStorage.setItem('hobbies', JSON.stringify(hobbies))
    render(<HobbiesForm />)
    await screen.findByDisplayValue('Hobis 9')

    const addButton = screen.getByRole('button', { name: /Pridėti hobį \(10\/10\)/ })
    expect(addButton).toBeDisabled()
    fireEvent.click(addButton)

    expect(screen.getAllByPlaceholderText(NAME_PLACEHOLDER)).toHaveLength(10)
  })

  it('mygtukas „Pašalinti“ ištrina hobį', async () => {
    await renderWithHobby()

    fireEvent.click(screen.getByRole('button', { name: /Pašalinti/ }))

    expect(screen.queryByPlaceholderText(NAME_PLACEHOLDER)).not.toBeInTheDocument()
    expect(screen.getByText('Nėra pridėtų hobių')).toBeInTheDocument()
  })

  it('sėkmingai išsaugojus rodoma „Išsaugota“, po 2 s vėl „Išsaugoti“', async () => {
    await renderWithHobby()

    fireEvent.click(saveButton())

    expect(await screen.findByText('Išsaugota')).toBeInTheDocument()
    expect(api.put).toHaveBeenCalledWith('/hobbies', {
      hobbies: [{ name: 'Šachmatai', description: 'Žaidžiu klube' }],
    })
    await waitFor(() => expect(saveButton()).toBeInTheDocument(), { timeout: 3000 })
  })

  it('saugant rodoma „Saugoma...“, o nepavykus – „Nepavyko išsaugoti“', async () => {
    let rejectPut
    api.put = jest.fn(() => new Promise((_, reject) => { rejectPut = reject }))
    await renderWithHobby()

    fireEvent.click(saveButton())

    expect(await screen.findByText('Saugoma...')).toBeInTheDocument()
    rejectPut(new Error('Serverio klaida'))
    expect(await screen.findByText('Nepavyko išsaugoti')).toBeInTheDocument()
  })

  it('kai formoje yra klaidų, paspaudus „Išsaugoti“ niekas nesiunčiama', async () => {
    const { nameInput } = await renderWithHobby()
    fireEvent.change(nameInput, { target: { value: 'Ab' } })

    fireEvent.click(saveButton())

    expect(api.put).not.toHaveBeenCalled()
  })

  it('prieš sesijos pabaigą hobiai išsaugomi automatiškai', async () => {
    await renderWithHobby()

    window.dispatchEvent(new Event('beforeSessionTimeout'))

    await waitFor(() => expect(api.put).toHaveBeenCalledWith('/hobbies', {
      hobbies: [{ name: 'Šachmatai', description: 'Žaidžiu klube' }],
    }))
  })

  it('automatinio išsaugojimo klaida nutylima (dabartinė elgsena)', async () => {
    api.put = jest.fn(() => Promise.reject(new Error('Serverio klaida')))
    await renderWithHobby()

    window.dispatchEvent(new Event('beforeSessionTimeout'))

    await waitFor(() => expect(api.put).toHaveBeenCalled())
    expect(screen.getByDisplayValue('Šachmatai')).toBeInTheDocument()
  })

  it('kai hobių nėra, automatinis išsaugojimas nieko nesiunčia', async () => {
    render(<HobbiesForm />)
    await screen.findByText('Nėra pridėtų hobių')

    window.dispatchEvent(new Event('beforeSessionTimeout'))

    expect(api.put).not.toHaveBeenCalled()
  })
})
