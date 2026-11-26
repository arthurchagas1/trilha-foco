import { validateStudy } from './studies.js'

export const STORAGE_KEY = 'trilha-foco/studies/v1'

function isStoredStudy(study) {
  if (!study || typeof study.id !== 'string' || !study.id ||
      typeof study.done !== 'boolean' || typeof study.title !== 'string') {
    return false
  }
  try {
    return validateStudy(study).title === study.title
  } catch {
    return false
  }
}

export function readStudies(storage) {
  const studies = JSON.parse(storage.getItem(STORAGE_KEY) ?? '[]')
  if (!Array.isArray(studies)) throw new Error('Formato inválido')
  const ids = new Set()
  return studies.filter(study => {
    if (!isStoredStudy(study) || ids.has(study.id)) return false
    ids.add(study.id)
    return true
  })
}

export function writeStudies(storage, studies) {
  storage.setItem(STORAGE_KEY, JSON.stringify(studies))
}
