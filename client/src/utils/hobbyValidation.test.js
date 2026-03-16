import { describe, it, expect, beforeEach } from '@jest/globals'
import {
  MIN_HOBBY_NAME_LENGTH,
  isValidHobby,
  getValidHobbies,
  hasValidHobbies,
  loadHobbies,
} from './hobbyValidation.js'

// --- isValidHobby ---

describe('isValidHobby', () => {
  it('priima hobį kurio pavadinimas lygiai 4 simboliai', () => {
    expect(isValidHobby({ name: 'kino' })).toBe(true)
  })

  it('priima hobį kurio pavadinimas ilgesnis nei 4 simboliai', () => {
    expect(isValidHobby({ name: 'skaitymas' })).toBe(true)
  })

  it('atmeta hobį kurio pavadinimas 3 simboliai', () => {
    expect(isValidHobby({ name: 'abc' })).toBe(false)
  })

  it('atmeta hobį kurio pavadinimas 1 simbolis', () => {
    expect(isValidHobby({ name: 'x' })).toBe(false)
  })

  it('atmeta tuščią pavadinimą', () => {
    expect(isValidHobby({ name: '' })).toBe(false)
  })

  it('naudoja trim — tarpai neskaičiuojami', () => {
    expect(isValidHobby({ name: '  ab  ' })).toBe(false)
  })

  it('priima pavadinimą kuris po trim yra >= 4 simbolių', () => {
    expect(isValidHobby({ name: '  kinas  ' })).toBe(true)
  })
})

// --- getValidHobbies ---

describe('getValidHobbies', () => {
  it('grąžina tik tinkamus hobius', () => {
    const hobbies = [
      { name: 'skaitymas' },
      { name: 'abc' },
      { name: 'kinas' },
      { name: 'x' },
    ]
    expect(getValidHobbies(hobbies)).toEqual([
      { name: 'skaitymas' },
      { name: 'kinas' },
    ])
  })

  it('grąžina tuščią masyvą kai visi netinkami', () => {
    expect(getValidHobbies([{ name: 'x' }, { name: 'ab' }])).toEqual([])
  })

  it('grąžina tuščią masyvą kai įvestis tuščia', () => {
    expect(getValidHobbies([])).toEqual([])
  })
})

// --- hasValidHobbies ---

describe('hasValidHobbies', () => {
  it('grąžina true kai yra bent vienas tinkamas hobis', () => {
    expect(hasValidHobbies([{ name: 'skaitymas' }])).toBe(true)
  })

  it('grąžina false kai nėra tinkamų hobių', () => {
    expect(hasValidHobbies([{ name: 'x' }, { name: 'abc' }])).toBe(false)
  })

  it('grąžina false kai sąrašas tuščias', () => {
    expect(hasValidHobbies([])).toBe(false)
  })
})

// --- loadHobbies ---

describe('loadHobbies', () => {
  beforeEach(() => {
    global.localStorage = {
      _store: {},
      getItem(key) { return this._store[key] ?? null },
      setItem(key, val) { this._store[key] = val },
      removeItem(key) { delete this._store[key] },
      clear() { this._store = {} },
    }
  })

  it('grąžina tuščią masyvą kai localStorage tuščias', () => {
    expect(loadHobbies()).toEqual([])
  })

  it('grąžina išsaugotus hobius', () => {
    const hobbies = [{ name: 'skaitymas' }, { name: 'kinas' }]
    localStorage.setItem('hobbies', JSON.stringify(hobbies))
    expect(loadHobbies()).toEqual(hobbies)
  })

  it('grąžina tuščią masyvą kai JSON sugadintas', () => {
    localStorage.setItem('hobbies', '{invalid json}}}')
    expect(loadHobbies()).toEqual([])
  })
})

// --- MIN_HOBBY_NAME_LENGTH ---

describe('MIN_HOBBY_NAME_LENGTH', () => {
  it('yra 4', () => {
    expect(MIN_HOBBY_NAME_LENGTH).toBe(4)
  })
})
