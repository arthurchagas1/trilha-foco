// @vitest-environment happy-dom
import { beforeEach, describe, expect, test } from 'vitest'
import { mountApp } from '../../src/app.js'
import { readStudies, writeStudies } from '../../src/storage.js'

const session = { id: 'a', title: 'Revisar álgebra', subject: 'Matemática', minutes: 30, done: false }
let root
let nextId

beforeEach(() => {
  document.body.innerHTML = '<div id="app"></div>'
  localStorage.clear()
  root = document.querySelector('#app')
  nextId = 0
})

function start(getStorage = () => localStorage) {
  mountApp(root, { getStorage, createId: () => String(++nextId) })
}

function submit({ title = session.title, subject = session.subject, minutes = session.minutes } = {}) {
  root.querySelector('#study-title').value = title
  root.querySelector('#study-subject').value = subject
  root.querySelector('#study-minutes').value = minutes
  root.querySelector('form').dispatchEvent(new Event('submit', { cancelable: true }))
}

function select(id, value) {
  const field = root.querySelector(id)
  field.value = value
  field.dispatchEvent(new Event('change'))
}

describe('mountApp', () => {
  test('mostra uma mensagem ao abrir uma lista de sessões vazia', () => {
    start()
    expect(root.querySelector('[data-empty]').textContent).toContain('lista está vazia')
  })
  test('apresenta sessões previamente salvas', () => {
    writeStudies(localStorage, [session])
    start()
    expect(root.querySelector('li').textContent).toContain(session.title)
  })
  test('registra uma sessão válida como pendente', () => {
    start()
    submit()
    expect(readStudies(localStorage)).toEqual([{ ...session, id: '1' }])
  })
  test('limpa o formulário depois de salvar', () => {
    start()
    submit()
    expect(root.querySelector('#study-title').value).toBe('')
  })
  test('mostra o erro de validação e conserva o título para correção', () => {
    start()
    submit({ title: 'X' })
    expect(root.querySelector('[data-form-error]').textContent).toContain('entre 3 e 60')
    expect(root.querySelector('#study-title').value).toBe('X')
  })
  test('trata marcação digitada no título como texto', () => {
    start()
    submit({ title: '<b>Aula</b>' })
    expect(root.querySelector('li strong').textContent).toBe('<b>Aula</b>')
    expect(root.querySelector('li b')).toBeNull()
  })
  test('atualiza o progresso e o tempo estudado ao concluir a sessão', () => {
    writeStudies(localStorage, [session])
    start()
    root.querySelector('li button').click()
    expect(root.querySelector('progress').value).toBe(100)
    expect(root.querySelector('[data-minutes]').textContent).toBe('30')
  })
  test('mantém o foco sobre a mesma sessão após concluir um título repetido', () => {
    writeStudies(localStorage, [session, { ...session, id: 'b' }])
    start()
    root.querySelectorAll('li')[1].querySelector('button').click()
    expect(document.activeElement.textContent).toBe('Reabrir')
    expect(document.activeElement.closest('li')).toBe(root.querySelectorAll('li')[1])
  })
  test('desloca o foco ao filtro se a sessão concluída sair da lista de pendentes', () => {
    writeStudies(localStorage, [session])
    start()
    select('#filter-status', 'pending')
    root.querySelector('li button').click()
    expect(document.activeElement.id).toBe('filter-status')
  })
  test('permite excluir uma sessão e atualizar o total', () => {
    writeStudies(localStorage, [session])
    start()
    root.querySelector('li .remove').click()
    expect(readStudies(localStorage)).toEqual([])
    expect(root.querySelector('[data-total]').textContent).toBe('0')
  })
  test('mantém o foco na lista se houver outra sessão após a exclusão', () => {
    writeStudies(localStorage, [session, { ...session, id: 'b', title: 'Estudar matrizes' }])
    start()
    root.querySelector('li .remove').click()
    expect(document.activeElement.getAttribute('aria-label')).toBe('Concluir Estudar matrizes')
  })
  test('mostra o estado vazio quando o filtro por disciplina não encontra sessões', () => {
    writeStudies(localStorage, [session])
    start()
    select('#filter-subject', 'Idiomas')
    expect(root.querySelector('[data-empty]').textContent).toContain('corresponde aos filtros')
  })
  test('avisa quando o navegador bloqueia a leitura do armazenamento', () => {
    start(() => { throw new Error('Armazenamento bloqueado') })
    expect(root.querySelector('[data-storage-error]').textContent).toContain('carregar os dados')
  })
  test('preserva o formulário e a lista quando a sessão não pode ser salva', () => {
    start(() => ({
      getItem: () => null,
      setItem: () => { throw new Error('Cota excedida') },
    }))
    submit()
    expect(root.querySelector('[data-storage-error]').textContent).toContain('salvar a alteração')
    expect(root.querySelector('#study-title').value).toBe(session.title)
    expect(root.querySelector('li')).toBeNull()
  })
  test('limpa o aviso de armazenamento após uma gravação funcionar', () => {
    let firstAccess = true
    start(() => {
      if (firstAccess) {
        firstAccess = false
        throw new Error('Armazenamento temporariamente indisponível')
      }
      return localStorage
    })
    submit()
    expect(root.querySelector('[data-storage-error]').textContent).toBe('')
  })
})
