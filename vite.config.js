/* vite.config.js: configuração mínima do Vite, base path e servidor local. */

import { defineConfig } from 'vite';

export default defineConfig({

    // Base para deploy em GitHub Pages
  base: './',
  server: {

            // Habilita acesso via IP local
      host: true,
  }
});
