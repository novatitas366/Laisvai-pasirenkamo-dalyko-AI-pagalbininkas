import * as profileService from './profile.service.js'

export async function getProfileHandler(req, res, next) {
  try {
    const profile = await profileService.getProfile(req.user.id)
    res.json(profile || {})
  } catch (err) {
    next(err)
  }
}

export async function saveProfileHandler(req, res, next) {
  try {
    const { universityId, studyProgramId } = req.body
    const profile = await profileService.saveProfile(req.user.id, universityId, studyProgramId)
    res.json(profile)
  } catch (err) {
    next(err)
  }
}
