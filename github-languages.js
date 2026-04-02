/* github-languages.js: busca repositórios GitHub, agrega linguagens e desenha donut chart. */

const USERNAME = 'gufonseca-code';

const PALETTE = [
  '#a78bfa',
  '#60a5fa',
  '#34d399',
  '#f472b6',
  '#fb923c',
];

const PALETTE_GLOW = [
  'rgba(167,139,250,0.25)',
  'rgba( 96,165,250,0.25)',
  'rgba( 52,211,153,0.25)',
  'rgba(244,114,182,0.25)',
  'rgba(251,146, 60,0.25)',
];

// Seção 1: carregamento dinâmico do Chart.js
function loadChartJs() {
  return new Promise((resolve, reject) => {
    if (window.Chart) { resolve(window.Chart); return; }
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/chart.js@4.4.3/dist/chart.umd.min.js';
    script.onload  = () => resolve(window.Chart);
    script.onerror = reject;
    document.head.appendChild(script);
  });
}

// Seção 2: plugin Chart.js para glow atrás do donut
const glowRingPlugin = {
  id: 'glowRing',
  beforeDraw(chart) {
    const { ctx, chartArea: { width, height, left, top } } = chart;
    const cx = left + width  / 2;
    const cy = top  + height / 2;
    const r  = Math.min(width, height) / 2;

    const grad = ctx.createRadialGradient(cx, cy, r * 0.5, cx, cy, r * 1.05);
    grad.addColorStop(0,   'rgba(139,92,246,0.00)');
    grad.addColorStop(0.7, 'rgba(139,92,246,0.08)');
    grad.addColorStop(1,   'rgba(139,92,246,0.00)');

    ctx.save();
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.fillStyle = grad;
    ctx.fill();
    ctx.restore();
  },
};

// Seção 3: função principal de inicialização do gráfico
export async function initLanguagesChart() {
  const container = document.getElementById('languages-chart-container');
  if (!container) return;

  try {

    const resp = await fetch(
      `https://api.github.com/users/${USERNAME}/repos?per_page=100`
    );
    if (!resp.ok) throw new Error('GitHub API error');
    const repos = await resp.json();

    const totals = {};
    repos.forEach(repo => {
      if (repo.language) {
        totals[repo.language] = (totals[repo.language] || 0) + 1;
      }
    });

    if (Object.keys(totals).length === 0) {
      container.innerHTML = `<p class="chart-empty">Nenhuma linguagem encontrada.</p>`;
      return;
    }

    const sorted = Object.entries(totals)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);

    const labels = sorted.map(([lang]) => lang);
    const data   = sorted.map(([, count]) => count);
    const total  = data.reduce((s, v) => s + v, 0);
    const colors = labels.map((_, i) => PALETTE[i % PALETTE.length]);

    container.innerHTML = `
      <div class="chart-wrapper">
        <canvas id="lang-donut-chart" aria-label="Top 5 linguagens mais usadas" role="img"></canvas>
        <div class="chart-center-label">
          <span class="chart-center-number">${total}</span>
          <span class="chart-center-sub">repos</span>
        </div>
      </div>
      <ul class="chart-legend" aria-label="Legenda de linguagens"></ul>
    `;

    const legendEl = container.querySelector('.chart-legend');
    labels.forEach((lang, i) => {
      const pct   = ((data[i] / total) * 100).toFixed(1);
      const color = colors[i];
      const glow  = PALETTE_GLOW[i % PALETTE_GLOW.length];

      const li = document.createElement('li');
      li.className = 'legend-item';
      li.innerHTML = `
        <div class="legend-row">
          <span class="legend-dot" style="background:${color};box-shadow:0 0 6px ${color}"></span>
          <span class="legend-lang">${lang}</span>
          <span class="legend-pct" style="color:${color}">${pct}%</span>
        </div>
        <div class="legend-bar-track">
          <div
            class="legend-bar-fill"
            style="--bar-color:${color};--bar-glow:${glow};--bar-pct:${pct}%;animation-delay:${i * 120}ms"
          ></div>
        </div>
      `;
      legendEl.appendChild(li);
    });

    const Chart = await loadChartJs();
    const canvas = document.getElementById('lang-donut-chart');

    new Chart(canvas, {
      type: 'doughnut',
      plugins: [glowRingPlugin],
      data: {
        labels,
        datasets: [{
          data,
          backgroundColor: colors,
          borderColor: 'transparent',
          borderWidth: 0,

          borderRadius: 6,
          borderAlign: 'inner',
          hoverOffset: 0,
          hoverBorderWidth: 0,
        }],
      },
      options: {
        cutout: '82%',
        animation: {
          animateRotate: true,
          animateScale: false,
          duration: 1100,
          easing: 'easeInOutQuart',
        },
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: ctx => {
                const pct = ((ctx.parsed / total) * 100).toFixed(1);
                return `  ${ctx.parsed} repo${ctx.parsed !== 1 ? 's' : ''}  ·  ${pct}%`;
              },
              title: items => ` ${items[0].label}`,
            },
            backgroundColor: 'rgba(14,14,18,0.92)',
            borderColor: 'rgba(167,139,250,0.2)',
            borderWidth: 1,
            padding: { x: 14, y: 10 },
            cornerRadius: 10,
            titleColor: '#a78bfa',
            bodyColor: '#dcddde',
            titleFont: { family: 'Inter', size: 13, weight: '600' },
            bodyFont:  { family: 'Fira Code', size: 12 },
            displayColors: false,
          },
        },
      },
    });

  } catch (err) {
    container.innerHTML = `<p class="chart-empty">Erro ao carregar linguagens.</p>`;
    console.error('Languages chart error:', err);
  }
}
