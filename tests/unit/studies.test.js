import { describe, expect, test } from 'vitest'
import { validateStudy, StudyError } from '../../src/studies.js'

const math = { title: 'Revisar funções', subject: 'Matemática', minutes: 30 }

describe('validateStudy', () => {
  test('aceita uma sessão válida', () => {
    expect(validateStudy(math)).toEqual(math)
  })
  test('retira espaços das pontas do título', () => {
    expect(validateStudy({ ...math, title: '  Revisar funções  ' }).title).toBe(math.title)
  })
  test('preserva espaços internos do título', () => {
    expect(validateStudy({ ...math, title: 'Revisar  funções' }).title).toBe('Revisar  funções')
  })
  test('aceita título com três caracteres', () => {
    expect(validateStudy({ ...math, title: 'SQL' }).title).toBe('SQL')
  })
  test('aceita título com sessenta caracteres', () => {
    const title = 'x'.repeat(60)
    expect(validateStudy({ ...math, title }).title).toBe(title)
  })
  test('rejeita título acima de sessenta caracteres', () => {
    expect(() => validateStudy({ ...math, title: 'x'.repeat(61) })).toThrow(StudyError)
  })
  test('rejeita disciplina desconhecida', () => {
    expect(() => validateStudy({ ...math, subject: 'História' })).toThrow(/disciplina/)
  })
  test('rejeita quatro minutos', () => {
    expect(() => validateStudy({ ...math, minutes: 4 })).toThrow(/duração/)
  })
  test('rejeita quatrocentos e oitenta e um minutos', () => {
    expect(() => validateStudy({ ...math, minutes: 481 })).toThrow(/duração/)
  })
  test('rejeita duração fracionária', () => {
    expect(() => validateStudy({ ...math, minutes: 5.5 })).toThrow(/inteira/)
  })
})
