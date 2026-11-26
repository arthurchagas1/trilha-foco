import { expect, test } from '@playwright/test'

const session = { title: 'Revisar funções', subject: 'Matemática', minutes: '30' }

async function addSession(page, { title, subject, minutes }) {
  await page.getByLabel('Título da sessão').fill(title)
  await page.getByLabel('Disciplina', { exact: true }).selectOption(subject)
  await page.getByLabel('Duração em minutos').fill(minutes)
  await page.getByRole('button', { name: 'Adicionar sessão' }).click()
}

test.beforeEach(async ({ page }) => {
  await page.goto('./')
})

test('cadastra uma sessão e conserva os dados ao recarregar a página', async ({ page }) => {
  await addSession(page, session)
  await expect(page.getByRole('listitem')).toContainText('Matemática · 30 min · Pendente')
  await page.reload()
  await expect(page.getByRole('listitem')).toContainText(session.title)
})

test('permite corrigir uma duração fora do limite', async ({ page }) => {
  await addSession(page, { ...session, minutes: '4' })
  await expect(page.getByRole('alert')).toContainText('entre 5 e 480 minutos')
  await expect(page.getByRole('listitem')).toHaveCount(0)
  await expect(page.getByLabel('Título da sessão')).toHaveValue(session.title)
  await page.getByLabel('Duração em minutos').fill('5')
  await page.getByRole('button', { name: 'Adicionar sessão' }).click()
  await expect(page.getByRole('listitem')).toContainText('5 min')
})

test('recalcula progresso e minutos ao concluir e reabrir a sessão', async ({ page }) => {
  await addSession(page, session)
  await page.getByRole('button', { name: 'Concluir Revisar funções' }).click()
  await expect(page.getByRole('progressbar')).toHaveAttribute('value', '100')
  await expect(page.getByRole('region', { name: 'Resumo dos estudos' })).toContainText('30')
  await page.getByRole('button', { name: 'Reabrir Revisar funções' }).click()
  await expect(page.getByRole('progressbar')).toHaveAttribute('value', '0')
  await expect(page.getByRole('listitem')).toContainText('Pendente')
})

test('combina filtros de status e disciplina sem ocultar o total geral', async ({ page }) => {
  await addSession(page, session)
  await addSession(page, { title: 'Praticar conversação', subject: 'Idiomas', minutes: '40' })
  await page.getByRole('button', { name: 'Concluir Revisar funções' }).click()
  await page.getByLabel('Status', { exact: true }).selectOption('done')
  await page.getByLabel('Filtrar disciplina').selectOption('Idiomas')
  await expect(page.getByText('Nenhuma sessão corresponde aos filtros.')).toBeVisible()
  await page.getByLabel('Filtrar disciplina').selectOption('Matemática')
  await expect(page.getByRole('listitem')).toHaveCount(1)
  await expect(page.getByRole('listitem')).toContainText(session.title)
  await expect(page.getByRole('progressbar')).toHaveAttribute('value', '50')
})
