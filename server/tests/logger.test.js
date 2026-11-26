/**
 * Vienetų testai: utils/logger.js
 * ND2, Studentas 2, B2. Logger'is naudojamas vietoj tuščio .catch(() => {}).
 */
import { jest, describe, it, expect, afterEach } from '@jest/globals'
import logger from '../src/utils/logger.js'

afterEach(() => {
  jest.restoreAllMocks()
})

describe('logger', () => {
  it.each([
    ['error', 'ERROR'],
    ['warn', 'WARN'],
    ['info', 'INFO'],
  ])('%s rašo pranešimą su lygio žyma ir detalėmis', (method, level) => {
    const spy = jest.spyOn(console, method).mockImplementation(() => {})
    const err = new Error('detalės')

    logger[method]('Kažkas nutiko', err)

    expect(spy).toHaveBeenCalledWith(`[${level}] Kažkas nutiko`, err)
  })

  it('be detalių rašo tik pranešimą', () => {
    const spy = jest.spyOn(console, 'error').mockImplementation(() => {})

    logger.error('Tik tekstas')

    expect(spy).toHaveBeenCalledWith('[ERROR] Tik tekstas')
  })
})
