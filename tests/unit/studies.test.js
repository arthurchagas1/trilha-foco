import { describe, expect, test } from 'vitest'
import { validateStudy, StudyError, addStudy, toggleStudy, removeStudy } from '../../src/studies.js'

const math = { title: 'Revisar funções', subject: 'Matemática', minutes: 30 }
const languages = { title: 'Praticar inglês', subject: 'Idiomas', minutes: 45 }
const pending = { ...math, id: 'a', done: false }
const done = { ...languages, id: 'b', done: true }

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
  test('rejeita título de dois caracteres após aparar espaços', () => {
    expect(() => validateStudy({ ...math, title: '  JS  ' })).toThrow(StudyError)
  })
  test('rejeita título apenas com espaços', () => {
    expect(() => validateStudy({ ...math, title: '   ' })).toThrow(StudyError)
  })
  test('rejeita disciplina desconhecida', () => {
    expect(() => validateStudy({ ...math, subject: 'História' })).toThrow(/disciplina/)
  })
  test('rejeita a opção vazia de disciplina', () => {
    expect(() => validateStudy({ ...math, subject: '' })).toThrow(/disciplina/)
  })
  test('aceita a duração mínima de cinco minutos', () => {
    expect(validateStudy({ ...math, minutes: 5 }).minutes).toBe(5)
  })
  test('aceita a duração máxima de quatrocentos e oitenta minutos', () => {
    expect(validateStudy({ ...math, minutes: 480 }).minutes).toBe(480)
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
  test('rejeita duração ausente convertida para NaN pelo formulário', () => {
    expect(() => validateStudy({ ...math, minutes: NaN })).toThrow(/duração/)
  })
  test('rejeita duração enviada como texto', () => {
    expect(() => validateStudy({ ...math, minutes: '30' })).toThrow(/duração/)
  })
})

describe('addStudy', () => {
  test('cria uma sessão pendente com o identificador fornecido', () => {
    expect(addStudy([], math, 'a')).toEqual([pending])
  })
  test('mantém as sessões anteriores na ordem em que foram adicionadas', () => {
    expect(addStudy([pending], languages, 'b').map(study => study.id)).toEqual(['a', 'b'])
  })
  test('preserva a lista de entrada ao adicionar', () => {
    const studies = Object.freeze([pending])
    addStudy(studies, languages, 'b')
    expect(studies).toEqual([pending])
  })
  test('gera identificadores diferentes para cadastros com o mesmo título', () => {
    const first = addStudy([], math)[0]
    const second = addStudy([], math)[0]
    expect(first.id).toBeTruthy()
    expect(first.id).not.toBe(second.id)
  })
  test('propaga a validação de uma sessão inválida', () => {
    expect(() => addStudy([], { ...math, minutes: 1 }, 'a')).toThrow(StudyError)
  })
})

describe('toggleStudy', () => {
  test('conclui uma sessão pendente', () => {
    expect(toggleStudy([pending], 'a')).toEqual([{ ...pending, done: true }])
  })
  test('reabre uma sessão concluída', () => {
    expect(toggleStudy([done], 'b')).toEqual([{ ...done, done: false }])
  })
  test('altera somente a sessão identificada', () => {
    expect(toggleStudy([pending, done], 'a')[1]).toEqual(done)
  })
  test('preserva o estado original da sessão alternada', () => {
    const study = Object.freeze({ ...pending })
    toggleStudy([study], 'a')
    expect(study.done).toBe(false)
  })
  test('mantém todos os dados quando o identificador não existe', () => {
    expect(toggleStudy([pending, done], 'missing')).toEqual([pending, done])
  })
})

describe('removeStudy', () => {
  test('exclui somente a sessão identificada', () => {
    expect(removeStudy([pending, done], 'a')).toEqual([done])
  })
  test('mantém a lista quando o identificador não existe', () => {
    expect(removeStudy([done], 'missing')).toEqual([done])
  })
  test('preserva a lista de entrada ao excluir', () => {
    const studies = Object.freeze([pending, done])
    removeStudy(studies, 'a')
    expect(studies).toEqual([pending, done])
  })
})
