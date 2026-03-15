import jwt from 'jsonwebtoken'

export function authenticate(req, res, next) {
  const header = req.headers.authorization
  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Neprisijungęs' })
  }

  const token = header.slice(7)
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET)
    req.user = { id: payload.userId }
    next()
  } catch {
    return res.status(401).json({ error: 'Neteisingas arba pasibaigęs prieigos raktas' })
  }
}
