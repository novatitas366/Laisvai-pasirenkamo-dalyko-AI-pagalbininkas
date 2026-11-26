import { MIN_HOBBY_NAME_LENGTH } from './hobbyValidation'

export const FIELD_STATUS = {
  ERROR: 'error',
  SHORT: 'short',
  OK: 'ok',
}

/**
 * Hobio lauko (pavadinimo ar aprašymo) būsena:
 * - 'error' – viršyta maksimali trukmė (skaičiuojama be trim);
 * - 'short' – netuščias, bet trumpesnis nei minimumas (skaičiuojama su trim);
 * - 'ok'    – visais kitais atvejais (taip pat tuščias laukas).
 */
export function getFieldStatus(value, max) {
  if (value.length > max) return FIELD_STATUS.ERROR

  const trimmedLength = value.trim().length
  if (trimmedLength > 0 && trimmedLength < MIN_HOBBY_NAME_LENGTH) return FIELD_STATUS.SHORT

  return FIELD_STATUS.OK
}
