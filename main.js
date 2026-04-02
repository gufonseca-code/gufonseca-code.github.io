/* main.js: ponto de entrada que inicializa recursos da página e controla navegação. */

import './style.css';
import { initAsciiEffect } from './ascii-effect.js';
import { initGithubRepos } from './github-repos.js';
import { initLanguagesChart } from './github-languages.js';

  // Seção 1: inicialização de widgets e efeito visual
document.addEventListener('DOMContentLoaded', () => {

  const canvas = document.getElementById('ascii-canvas');
  if (canvas) {
    initAsciiEffect(canvas);
  }

  initGithubRepos();

  initLanguagesChart();

  const sections = document.querySelectorAll('section');
  const navLinks = document.querySelectorAll('.nav-links a');

  const indicator = document.querySelector('.nav-indicator');

        // Seção 2: atualização visual do indicador do menu
    function updateIndicator(activeLink) {
    if (!activeLink || !indicator) return;
    const width = activeLink.offsetWidth;
    const left = activeLink.offsetLeft;
    indicator.style.opacity = '1';
    indicator.style.width = `${width}px`;
    indicator.style.transform = `translateX(${left}px)`;
  }

  setTimeout(() => {
    updateIndicator(document.querySelector('.nav-links a.active'));
  }, 100);

      // Seção 3: listeners de resize/scroll para navegação ativa
    window.addEventListener('resize', () => {
    updateIndicator(document.querySelector('.nav-links a.active'));
  });

      // Seção 3: listeners de resize/scroll para navegação ativa
    window.addEventListener('scroll', () => {
    let current = '';

    sections.forEach(section => {
      const sectionTop = section.offsetTop;
      if (window.scrollY >= (sectionTop - 250)) {
        current = section.getAttribute('id');
      }
    });

    navLinks.forEach(link => {
      link.classList.remove('active');
      if (link.getAttribute('href') === `#${current}`) {
        link.classList.add('active');
        updateIndicator(link);
      }
    });
  });

});
