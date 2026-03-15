import * as authService from './auth.service.js'

export async function login(req, res, next) {
  try {
    const { email, password } = req.body

    if (!email || !password) {
      return res.status(400).json({ error: 'El. paštas ir slaptažodis yra privalomi' })
    }

    const user = await authService.findUserByEmail(email)

    if (!user) {
      return res.status(401).json({ error: 'Vartotojas su tokiu el. paštu nerastas' })
    }

    // Temporary plain text comparison as per task
    if (user.password !== password) {
      return res.status(401).json({ error: 'Neteisingas slaptažodis' })
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
