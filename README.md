# Portfólio (Gustavo)

## 📌 Objetivo

Page estática em HTML/CSS/JS com:
- Fundo ASCII animado (`ascii-effect.js`)
- Gráfico de linguagens GitHub (`github-languages.js`)
- Carrossel de repositórios GitHub (`github-repos.js`)
- Navegação fixa com indicador ativo (`main.js`)

## 🧱 Estrutura dos arquivos

- `index.html`: markup de `navbar`, `hero`, `about`, `contact`
- `style.css`: layout geral, camadas (`@layer`), componentes e utilitários
- `main.js`: inicialização, evento `DOMContentLoaded`, navbar responsiva
- `ascii-effect.js`: efeito de caracteres em canvas + otimizações de FPS
- `github-languages.js`: busca API GitHub, gera donut Chart (Chart.js CDN)
- `github-repos.js`: busca API GitHub, renderiza carrossel infinito de cards
- `vite.config.js`: base './' para deploy em GitHub Pages, host true para dev

## ▶️ Como rodar

1. Instalar (se necessário): `npm install`
2. Rodar localmente: `npm run dev` (Vite)
3. Abrir `http://localhost:5173` ou similar
