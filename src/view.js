import { MAX_MINUTES, MIN_MINUTES, SUBJECTS } from './studies.js'

export function renderLayout(root) {
  root.innerHTML = `
    <header class="topbar">
      <div class="shell top-inner">
        <a class="brand" href="./"><span class="mark" aria-hidden="true">◒</span> Trilha Foco</a>
        <span class="local-label">Salvo neste navegador</span>
      </div>
    </header>
    <main class="shell">
      <section class="hero" aria-labelledby="title">
        <div>
          <p class="eyebrow">MEU PLANO DE ESTUDOS</p>
          <h1 id="title">Planeje seu estudo.<br><em>Acompanhe seu ritmo.</em></h1>
          <p>Organize suas sessões por disciplina e acompanhe o tempo que você dedicou a cada estudo.</p>
        </div>
        <div class="progress-card">
          <div><h2>Seu progresso</h2><strong data-progress>0%</strong></div>
          <progress aria-label="Progresso das sessões" max="100" value="0"></progress>
          <p data-progress-description></p>
        </div>
      </section>

      <section class="metrics" aria-label="Resumo dos estudos">
        <div><span>Sessões planejadas</span><strong data-total>0</strong></div>
        <div><span>Concluídas</span><strong data-completed>0</strong></div>
        <div><span>Minutos estudados</span><strong data-minutes>0</strong></div>
      </section>

      <div class="workspace">
        <section class="panel create" aria-labelledby="create-title">
          <h2 id="create-title">Nova sessão</h2>
          <form novalidate>
            <label for="study-title">Título da sessão</label>
            <input id="study-title" name="title" placeholder="Ex. Revisar funções" required minlength="3" maxlength="60">
            <label for="study-subject">Disciplina</label>
            <select id="study-subject" name="subject" required>
              <option value="">Selecione uma disciplina</option>
              ${SUBJECTS.map(subject => `<option>${subject}</option>`).join('')}
            </select>
            <label for="study-minutes">Duração em minutos</label>
            <input id="study-minutes" name="minutes" type="number" inputmode="numeric"
                   placeholder="Ex. 30" required min="${MIN_MINUTES}" max="${MAX_MINUTES}" step="1">
            <p class="feedback" data-form-error role="alert"></p>
            <button class="primary" type="submit">Adicionar sessão</button>
          </form>
          <p class="feedback" data-storage-error role="alert"></p>
        </section>

        <section class="panel sessions" aria-labelledby="sessions-title">
          <h2 id="sessions-title">Minhas sessões</h2>
          <div class="filters">
            <div>
              <label for="filter-status">Status</label>
              <select id="filter-status">
                <option value="all">Todos os status</option>
                <option value="pending">Pendentes</option>
                <option value="done">Concluídas</option>
              </select>
            </div>
            <div>
              <label for="filter-subject">Filtrar disciplina</label>
              <select id="filter-subject">
                <option value="all">Todas as disciplinas</option>
                ${SUBJECTS.map(subject => `<option>${subject}</option>`).join('')}
              </select>
            </div>
          </div>
          <p class="empty" data-empty></p>
          <ul class="study-list" aria-label="Sessões de estudo"></ul>
        </section>
      </div>
    </main>`
}

export function renderStudyList(list, studies, onToggle, onRemove) {
  const doc = list.ownerDocument
  list.replaceChildren(...studies.map(study => {
    const item = doc.createElement('li')
    item.dataset.studyId = study.id
    item.innerHTML = `<div><strong></strong><span></span></div><div class="actions"></div>`
    item.querySelector('strong').textContent = study.title
    item.querySelector('span').textContent =
      `${study.subject} · ${study.minutes} min · ${study.done ? 'Concluída' : 'Pendente'}`

    const toggle = doc.createElement('button')
    toggle.textContent = study.done ? 'Reabrir' : 'Concluir'
    toggle.setAttribute('aria-label', `${toggle.textContent} ${study.title}`)
    toggle.addEventListener('click', () => onToggle(study.id))

    const remove = doc.createElement('button')
    remove.className = 'remove'
    remove.textContent = 'Excluir'
    remove.setAttribute('aria-label', `Excluir ${study.title}`)
    remove.addEventListener('click', () => onRemove(study.id))

    item.querySelector('.actions').append(toggle, remove)
    return item
  }))
}
