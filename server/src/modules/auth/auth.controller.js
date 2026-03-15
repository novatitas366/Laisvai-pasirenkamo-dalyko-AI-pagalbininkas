import { register } from './auth.service.js'

export async function registerHandler(req, res, next) {
  try {
    const { email, password } = req.body
    const user = await register(email, password)
    res.status(201).json({ message: 'User registered successfully', userId: user.id })
  } catch (err) {
    next(err)
  }
}
