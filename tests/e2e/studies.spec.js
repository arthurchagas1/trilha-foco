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
