export const NAME_MAX = 50
export const DESC_MAX = 2000

const CREDITS_NOT_POSITIVE = 'Kreditai turi būti teigiamas skaičius'

function isNotPositiveNumber(value) {
  return Number.isNaN(Number(value)) || Number(value) <= 0
}

export function normalizeName(name) {
  return name.trim().toLowerCase()
}

export function validateField(field, value) {
  if (field === 'name' && value.length > NAME_MAX) {
    return `Pavadinimas negali viršyti ${NAME_MAX} simbolių`
  }
  if (field === 'description' && value.length > DESC_MAX) {
    return `Aprašymas negali viršyti ${DESC_MAX} simbolių`
  }
  if (field === 'credits' && value !== '' && isNotPositiveNumber(value)) {
    return CREDITS_NOT_POSITIVE
  }
  return ''
}

export function validateEntry(entry, seenNames) {
  if (!entry.name.trim()) return 'Pavadinimas privalomas'
  if (entry.name.length > NAME_MAX) return `Pavadinimas per ilgas (maks. ${NAME_MAX})`
  if (entry.description.length > DESC_MAX) return `Aprašymas per ilgas (maks. ${DESC_MAX})`
  if (entry.credits === '' || entry.credits == null) return 'Kreditai privalomi'
  if (isNotPositiveNumber(entry.credits)) return CREDITS_NOT_POSITIVE
  if (seenNames.has(normalizeName(entry.name))) return 'Šis pavadinimas jau naudojamas sąraše'
  return ''
}
