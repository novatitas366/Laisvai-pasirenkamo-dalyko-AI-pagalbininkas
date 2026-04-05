import * as hobbiesService from './hobbies.service.js'

const MAX_HOBBIES = 10

export async function list(req, res, next) {
  try {
    const hobbies = await hobbiesService.getHobbies(req.user.id)
    res.json(hobbies)
  } catch (err) {
    next(err)
  }
}

export async function save(req, res, next) {
  try {
    const { hobbies } = req.body
    if (!Array.isArray(hobbies)) {
      return res.status(400).json({ error: 'hobbies turi būti masyvas' })
    }
    if (hobbies.length > MAX_HOBBIES) {
      return res.status(400).json({ error: `Hobių skaičius negali viršyti ${MAX_HOBBIES}` })
    }
    const result = await hobbiesService.replaceHobbies(req.user.id, hobbies)
    res.json(result)
  } catch (err) {
    next(err)
  }
}
