import { expect, test } from 'vitest'
import { validateStudy, StudyError } from '../../src/studies.js'

const math = { title: 'Revisar funções', subject: 'Matemática', minutes: 30 }

test('aceita uma sessão válida', () => {
  expect(validateStudy(math)).toEqual(math)
})

test('rejeita título vazio', () => {
  expect(() => validateStudy({ ...math, title: '' })).toThrow(StudyError)
})

test('rejeita disciplina desconhecida', () => {
  expect(() => validateStudy({ ...math, subject: 'História' })).toThrow(StudyError)
})

test('rejeita duração superior a 480 minutos', () => {
  expect(() => validateStudy({ ...math, minutes: 481 })).toThrow(StudyError)
})

test('rejeita duração inferior a 5 minutos', () => {
  expect(() => validateStudy({ ...math, minutes: 4 })).toThrow(StudyError)
})

test('rejeita duração fracionária', () => {
  expect(() => validateStudy({ ...math, minutes: 5.5 })).toThrow(StudyError)
})

test('rejeita título acima de 60 caracteres', () => {
  expect(() => validateStudy({ ...math, title: 'x'.repeat(61) })).toThrow(StudyError)
})
