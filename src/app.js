import { addStudy, removeStudy, StudyError, studySummary, toggleStudy, visibleStudies } from './studies.js'
import { readStudies, writeStudies } from './storage.js'
import { renderLayout, renderStudyList } from './view.js'

export function mountApp(root, { getStorage, createId }) {
  renderLayout(root)
  const find = selector => root.querySelector(selector)
  const form = find('form')
  const formError = find('[data-form-error]')
  const storageError = find('[data-storage-error]')
  const statusFilter = find('#filter-status')
  const subjectFilter = find('#filter-subject')
  const list = find('ul')
  const title = form.elements.namedItem('title')
  const subject = form.elements.namedItem('subject')
  const minutes = form.elements.namedItem('minutes')
  let studies = []

  try {
    studies = readStudies(getStorage())
  } catch {
    storageError.textContent = 'Não foi possível carregar os dados salvos neste navegador.'
  }

  function render() {
    const summary = studySummary(studies)
    find('[data-total]').textContent = String(summary.total)
    find('[data-completed]').textContent = String(summary.completed)
    find('[data-minutes]').textContent = String(summary.minutes)
    find('[data-progress]').textContent = `${summary.progress}%`
    find('progress').value = summary.progress
    find('[data-progress-description]').textContent =
      `${summary.completed} de ${summary.total} sessões concluídas`

    const visible = visibleStudies(studies, statusFilter.value, subjectFilter.value)
    const empty = find('[data-empty]')
    empty.hidden = visible.length > 0
    empty.textContent = studies.length
      ? 'Nenhuma sessão corresponde aos filtros.'
      : 'Sua lista está vazia. Adicione uma sessão para começar.'
    renderStudyList(list, visible, toggle, remove)
  }

  function update(next) {
    try {
      writeStudies(getStorage(), next)
      storageError.textContent = ''
    } catch {
      storageError.textContent = 'Não foi possível salvar a alteração neste navegador.'
      return false
    }
    studies = next
    render()
    return true
  }

  function toggle(id) {
    if (update(toggleStudy(studies, id))) {
      const row = [...list.children].find(item => item.dataset.studyId === id)
      const nextFocus = row?.querySelector('button') ?? statusFilter
      nextFocus.focus()
    }
  }

  function remove(id) {
    if (update(removeStudy(studies, id))) {
      const nextFocus = list.querySelector('button') ?? title
      nextFocus.focus()
    }
  }

  form.addEventListener('submit', event => {
    event.preventDefault()
    formError.textContent = ''
    try {
      const next = addStudy(studies, {
        title: title.value,
        subject: subject.value,
        minutes: minutes.valueAsNumber,
      }, createId())
      if (update(next)) {
        form.reset()
        title.focus()
      }
    } catch (error) {
      if (!(error instanceof StudyError)) throw error
      formError.textContent = error.message
    }
  })
  statusFilter.addEventListener('change', render)
  subjectFilter.addEventListener('change', render)
  render()
}
