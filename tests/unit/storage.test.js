import { describe, expect, test } from 'vitest'
import { readStudies, STORAGE_KEY, writeStudies } from '../../src/storage.js'

const session = { id: 'a', title: 'Revisar álgebra', subject: 'Matemática', minutes: 30, done: false }

function storageWith(value) {
  const items = new Map(value === undefined ? [] : [[STORAGE_KEY, value]])
  return {
    getItem: key => items.get(key) ?? null,
    setItem: (key, content) => items.set(key, content),
  }
}

describe('readStudies', () => {
  test('começa com uma lista vazia quando o navegador não tem dados', () => {
    expect(readStudies(storageWith())).toEqual([])
  })
  test('recupera uma sessão salva', () => {
    expect(readStudies(storageWith(JSON.stringify([session])))).toEqual([session])
  })
  test('informa falha em vez de carregar texto JSON corrompido', () => {
    expect(() => readStudies(storageWith('{'))).toThrow(SyntaxError)
  })
  test('informa falha quando o JSON salvo não contém uma lista', () => {
    expect(() => readStudies(storageWith('{}'))).toThrow('Formato inválido')
  })
  test('descarta elementos nulos sem descartar as sessões válidas', () => {
    expect(readStudies(storageWith(JSON.stringify([null, session])))).toEqual([session])
  })
  test('descarta sessões armazenadas sem identificador', () => {
    expect(readStudies(storageWith(JSON.stringify([{ ...session, id: '' }])))).toEqual([])
  })
  test('descarta sessões armazenadas com status inválido', () => {
    expect(readStudies(storageWith(JSON.stringify([{ ...session, done: 'false' }])))).toEqual([])
  })
  test('descarta sessões armazenadas com título não textual', () => {
    expect(readStudies(storageWith(JSON.stringify([{ ...session, title: 123 }])))).toEqual([])
  })
  test('descarta sessões armazenadas com duração inválida', () => {
    expect(readStudies(storageWith(JSON.stringify([{ ...session, minutes: 2 }])))).toEqual([])
  })
  test('descarta títulos armazenados fora do formato normalizado', () => {
    expect(readStudies(storageWith(JSON.stringify([{ ...session, title: '  Revisar álgebra' }])))).toEqual([])
  })
  test('conserva a primeira entrada de cada identificador duplicado', () => {
    const duplicates = [session, { ...session, done: true }]
    expect(readStudies(storageWith(JSON.stringify(duplicates)))).toEqual([session])
  })
})

describe('writeStudies', () => {
  test('persiste o JSON na chave usada pela aplicação', () => {
    const storage = storageWith()
    writeStudies(storage, [session])
    expect(JSON.parse(storage.getItem(STORAGE_KEY))).toEqual([session])
  })
})
