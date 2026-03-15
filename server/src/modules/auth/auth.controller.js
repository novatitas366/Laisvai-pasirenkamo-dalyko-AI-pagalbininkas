import * as authService from './auth.service.js'

/**
 * Handles user login with input sanitization and validation.
 */
export async function login(req, res, next) {
  try {
    // 1. Extract and sanitize input data
    let { email, password } = req.body

    // Basic sanitization: trim email and password, and lowercase email for case-insensitive lookup
    email = email?.trim()?.toLowerCase()
    // We trim password to prevent common input errors, though some systems prefer preserving spaces
    password = password?.trim()

    // 2. Validate required fields
    if (!email || !password) {
      return res.status(400).json({ error: 'El. paštas ir slaptažodis yra privalomi' })
    }

    // 3. Find user by email (using prepared statement inside service)
    const user = await authService.findUserByEmail(email)

    // 4. Check user existence and password (currently using plain-text comparison as per requirements)
    if (!user || user.password !== password) {
      // Returning a generic error message for security to not leak user existence
      return res.status(401).json({ error: 'Neteisingas el. paštas arba slaptažodis' })
    }

    // 5. Success response
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
