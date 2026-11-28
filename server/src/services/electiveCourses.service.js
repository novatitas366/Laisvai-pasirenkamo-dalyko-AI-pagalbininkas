import pool from '../config/database.js'

export const NAME_MAX = 50
const NAME_PREVIEW_LENGTH = 20

const FIND_DUPLICATE_SQL =
  'SELECT id FROM user_elective_courses WHERE user_id = ? AND LOWER(name) = LOWER(?) AND credits = ?'
const INSERT_SQL = 'INSERT INTO user_elective_courses (user_id, name, credits, description) VALUES ?'

function parseCredits(value) {
  return Number.parseInt(value, 10)
}

function findNameLengthError(entries) {
  const tooLong = entries.find(e => e.name.trim().length > NAME_MAX)
  if (!tooLong) return null
  const preview = tooLong.name.trim().substring(0, NAME_PREVIEW_LENGTH)
  return `Pavadinimas per ilgas (maks. ${NAME_MAX} simbolių): "${preview}..."`
}

function getCreditsError(entry) {
  if (entry.credits === '' || entry.credits == null) {
    return `Kreditai privalomi: "${entry.name}"`
  }
  const credits = parseCredits(entry.credits)
  if (Number.isNaN(credits) || credits <= 0) {
    return `Kreditai turi būti teigiamas skaičius: "${entry.name}"`
  }
  return null
}

function findCreditsError(entries) {
  for (const entry of entries) {
    const error = getCreditsError(entry)
    if (error) return error
  }
  return null
}

export function validateElectives(entries) {
  if (!entries || !Array.isArray(entries) || entries.length === 0) {
    return { error: 'Nėra duomenų išsaugojimui' }
  }

  const validEntries = entries.filter(e => e.name.trim().length > 0)
  if (validEntries.length === 0) {
    return { error: 'Nėra galiojančių duomenų išsaugojimui' }
  }

  const error = findNameLengthError(validEntries) || findCreditsError(validEntries)
  return error ? { error } : { entries: validEntries }
}

export async function findExistingElective(userId, entries) {
  for (const entry of entries) {
    const credits = parseCredits(entry.credits)
    const [existing] = await pool.query(FIND_DUPLICATE_SQL, [userId, entry.name.trim(), credits])
    if (existing.length > 0) return { name: entry.name, credits }
  }
  return null
}

function toRow(userId, entry) {
  const credits = parseCredits(entry.credits)
  return [
    userId,
    entry.name.trim(),
    !Number.isNaN(credits) && credits > 0 ? credits : null,
    entry.description?.trim() || null,
  ]
}

export async function insertElectives(userId, entries) {
  const values = entries.map(entry => toRow(userId, entry))
  const [result] = await pool.query(INSERT_SQL, [values])
  return result.affectedRows
}
