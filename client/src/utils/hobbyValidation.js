export const MIN_HOBBY_NAME_LENGTH = 4

export function isValidHobby(hobby) {
  return hobby.name.trim().length >= MIN_HOBBY_NAME_LENGTH
}

export function getValidHobbies(hobbies) {
  return hobbies.filter(isValidHobby)
}

export function hasValidHobbies(hobbies) {
  return getValidHobbies(hobbies).length > 0
}

export function loadHobbies() {
  try {
    const saved = localStorage.getItem('hobbies')
    return saved ? JSON.parse(saved) : []
  } catch {
    return []
  }
}
