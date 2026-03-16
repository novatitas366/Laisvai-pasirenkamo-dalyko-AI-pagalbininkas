import argon2 from 'argon2'
import * as authService from './auth.service.js'

/**
 * Handles user login with input sanitization and validation.
 */
export async function login(req, res, next) {
  try {
    let { email, password } = req.body

    email = email?.trim()?.toLowerCase()
    password = password?.trim()

    if (!email || !password) {
      return res.status(400).json({ error: 'El. paštas ir slaptažodis yra privalomi' })
    }

    const user = await authService.findUserByEmail(email)

    if (!user || !(await argon2.verify(user.password_hash, password))) {
      return res.status(401).json({ error: 'Neteisingas el. paštas arba slaptažodis' })
    }

    res.json({
      message: 'Prisijungimas sėkmingas',
      user: {
        id: user.id,
        email: user.email
      }
    })
  } catch (err) {
    next(err)
  }
}

export async function registerHandler(req, res, next) {
  try {
    const { email, password } = req.body
    const user = await authService.register(email, password)
    res.status(201).json({ message: 'User registered successfully', userId: user.id })
  } catch (err) {
    next(err)
  }
}
