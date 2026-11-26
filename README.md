# Trilha Foco

Organizador de sessões de estudo com testes automatizados e publicação contínua.

## Integrantes

- Arthur Chagas

## Sobre o sistema

O Trilha Foco permite planejar sessões com título, disciplina e duração. É possível concluir, reabrir, excluir e filtrar sessões. O painel exibe o total planejado, o número de sessões concluídas, os minutos estudados e o percentual de conclusão. Os dados ficam no armazenamento local do navegador usado.

## Tecnologias

- **HTML, CSS e JavaScript** implementam a interface, as regras e a persistência com `localStorage`.
- **Node.js 24, npm e Vite** instalam as dependências, servem o projeto localmente e geram a versão estática em `dist/`.
- **Vitest, Happy DOM e V8** testam as regras, o armazenamento e a interface em DOM simulado e medem a cobertura do JavaScript.
- **Playwright** valida fluxos completos no Chromium, com contextos isolados para os testes.
- **GitHub Actions, GitHub Pages e Codecov** executam a matriz de testes, publicam o site e recebem o relatório LCOV.

## Uso de IA

Usei o OpenAI Codex para planejar a estrutura do projeto, gerar e revisar o código, formular casos de teste, investigar falhas, configurar CI/CD e preparar os materiais de apresentação. Os números de cobertura vêm dos relatórios gerados pelo V8. Os cenários end-to-end foram executados pelo Playwright em Chromium.

## Execução dos testes

Use Node.js 24, npm e Git. Clone o repositório e execute:

```bash
npm ci
npx playwright install chromium
npm test
npm run test:coverage
npm run test:e2e
```

No Linux, caso faltem bibliotecas de sistema para o Chromium, execute `npx playwright install --with-deps chromium`. O Playwright compila a aplicação e abre a versão de produção antes dos cenários. Use `npx playwright show-report` para consultar o relatório E2E.

O relatório HTML de cobertura fica em `coverage/index.html` e o LCOV em `coverage/lcov.info`. A suíte exige pelo menos 80% de cobertura global em linhas, instruções, funções e ramos. O conjunto medido inclui todos os arquivos JavaScript de `src/`.

Para usar o aplicativo localmente, execute `npm run dev` e abra o endereço exibido. Para compilar a aplicação sem executar os testes, use `npm run build`.

## Integração e publicação

O workflow [Testes e entrega](.github/workflows/ci.yml) roda nos pushes e pull requests para validar Linux, macOS e Windows. Cada sistema roda unitários, cobertura e end-to-end. A automação guarda os relatórios como artefatos e usa a cobertura produzida no Linux para o envio ao Codecov.

Para ativar a entrega em uma cópia do repositório:

1. Em **Settings → Pages → Build and deployment**, selecione **GitHub Actions**.
2. Em **Settings → Secrets and variables → Actions → Variables**, adicione `ENABLE_PAGES` com valor `true`.
3. Entre no Codecov com sua conta do GitHub, conceda acesso ao repositório e habilite o projeto no painel do Codecov.
4. Adicione a variável `ENABLE_CODECOV` com valor `true`. A action usa OIDC para autenticar o upload.
5. Em **Actions → Testes e entrega → Run workflow**, execute o fluxo na branch `main`.

A publicação depende dos testes nos três sistemas. Cada evento de push do GitHub executa o workflow para o commit no topo daquele push. Para registrar uma execução por commit publicado, envie um commit por push.

Referências: [GitHub Actions](https://docs.github.com/pt/actions), [GitHub Pages com workflows personalizados](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages), [Codecov GitHub Action](https://github.com/marketplace/actions/codecov).
