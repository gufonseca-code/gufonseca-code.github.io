/* github-repos.js: busca repositórios GitHub e renderiza carrossel infinito. */

// Seção 1: inicialização do carrossel de repositórios
export async function initGithubRepos() {
  const container = document.getElementById('github-repos-container');
  if (!container) return;

  const username = 'gufonseca-code';

  try {
    const response = await fetch(`https://api.github.com/users/${username}/repos?sort=updated&per_page=6`);
    if (!response.ok) throw new Error('Falha ao buscar repositórios');

    const repos = await response.json();

    container.innerHTML = '';

    if (!repos || repos.length === 0) {
      container.innerHTML = `<div class="error-msg">Nenhum repositório público encontrado.</div>`;
      return;
    }

    const track = document.createElement('div');
    track.className = 'carousel-track';

      // Seção 2: helpers de formatação
    // Seção 2: helpers de formatação
  const formatDate = (dateString) => {
      const options = { year: 'numeric', month: 'short', day: 'numeric' };
      return new Date(dateString).toLocaleDateString('pt-BR', options);
    };

      // Seção 3: geração de cartão de repositório
    // Seção 3: geração de cartão de repositório
  const renderCard = (repo) => {
      const card = document.createElement('div');
      card.className = 'repo-card glass-card';

      const topicsHtml = repo.topics && repo.topics.length > 0
        ? `<div class="repo-topics">${repo.topics.slice(0, 3).map(t => `<span class="topic-badge">${t}</span>`).join('')}</div>`
        : '';

      const languageBadge = repo.language
        ? `<span class="lang-badge">${repo.language}</span>`
        : '';

      card.innerHTML = `
        <div class="repo-header">
          <h4 class="repo-name"><a href="${repo.html_url}" target="_blank" rel="noopener noreferrer">${repo.name}</a></h4>
          ${languageBadge}
        </div>
        <p class="repo-desc">${repo.description || 'Sem descrição disponível para este repositório.'}</p>
        ${topicsHtml}
        <div class="repo-footer">
          <span class="repo-date">Atualizado: ${formatDate(repo.updated_at)}</span>
        </div>
      `;
      return card;
    };

    repos.forEach(repo => track.appendChild(renderCard(repo)));

    repos.forEach(repo => {
      const clone = renderCard(repo);
      clone.setAttribute('aria-hidden', 'true');
      track.appendChild(clone);
    });

    container.appendChild(track);

    let singleSetWidth = 0;

    requestAnimationFrame(() => {

      const firstClone = track.children[repos.length];
      if (!firstClone) return;

      singleSetWidth = firstClone.offsetLeft;

      container.style.setProperty('--track-width', `${singleSetWidth}px`);

      container.scrollLeft = singleSetWidth / 2;
    });

    container.addEventListener('scroll', () => {
      if (!singleSetWidth) return;

      if (container.scrollLeft >= singleSetWidth) {

        container.scrollLeft -= singleSetWidth;
      } else if (container.scrollLeft <= 0) {

        container.scrollLeft += singleSetWidth;
      }
    }, { passive: true });

    let isDown = false;
    let startX;
    let scrollLeft;

    container.addEventListener('mousedown', (e) => {
      isDown = true;
      container.classList.add('is-dragging');
      startX = e.pageX - container.offsetLeft;
      scrollLeft = container.scrollLeft;
    });

    container.addEventListener('mouseup', () => {
      isDown = false;
      container.classList.remove('is-dragging');
    });

    container.addEventListener('mouseleave', () => {
      isDown = false;
      container.classList.remove('is-dragging');
    });

    container.addEventListener('mousemove', (e) => {
      if (!isDown) return;
      e.preventDefault();
      const x = e.pageX - container.offsetLeft;
      const walk = (x - startX) * 1.5;
      container.scrollLeft = scrollLeft - walk;
    });

    container.addEventListener('touchstart', (e) => {
      startX = e.touches[0].pageX - container.offsetLeft;
      scrollLeft = container.scrollLeft;
    }, { passive: true });

    container.addEventListener('touchmove', (e) => {
      const x = e.touches[0].pageX - container.offsetLeft;
      const walk = (x - startX) * 1.5;
      container.scrollLeft = scrollLeft - walk;
    }, { passive: true });

  } catch (error) {
    container.innerHTML = `<div class="error-msg">Erro ao carregar os repositórios do GitHub.</div>`;
    console.error('GitHub API Error:', error);
  }
}
