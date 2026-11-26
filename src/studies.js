export const SUBJECTS = ['Programação', 'Matemática', 'Idiomas', 'Outros']
export const MIN_MINUTES = 5
export const MAX_MINUTES = 480

export class StudyError extends Error {}

export function validateStudy({ title, subject, minutes }) {
  const cleanTitle = title.trim()
  if (cleanTitle.length < 3 || cleanTitle.length > 60) {
    throw new StudyError('Informe um título entre 3 e 60 caracteres.')
  }
  if (!SUBJECTS.includes(subject)) {
    throw new StudyError('Escolha uma disciplina da lista.')
  }
  if (!Number.isInteger(minutes) || minutes < MIN_MINUTES || minutes > MAX_MINUTES) {
    throw new StudyError('Informe uma duração inteira entre 5 e 480 minutos.')
  }
  return { title: cleanTitle, subject, minutes }
}

export function addStudy(studies, input, id = crypto.randomUUID()) {
  return [...studies, { ...validateStudy(input), id, done: false }]
}

export function toggleStudy(studies, id) {
  return studies.map(study => study.id === id ? { ...study, done: !study.done } : study)
}

export function removeStudy(studies, id) {
  return studies.filter(study => study.id !== id)
}

export function visibleStudies(studies, status = 'all', subject = 'all') {
  return studies.filter(study => {
    const matchesStatus = status === 'all' || study.done === (status === 'done')
    return matchesStatus && (subject === 'all' || study.subject === subject)
  })
}

export function studySummary(studies) {
  const completed = studies.filter(study => study.done)
  return {
    total: studies.length,
    completed: completed.length,
    pending: studies.length - completed.length,
    minutes: completed.reduce((sum, study) => sum + study.minutes, 0),
    progress: studies.length ? Math.round(completed.length * 100 / studies.length) : 0,
  }
}
