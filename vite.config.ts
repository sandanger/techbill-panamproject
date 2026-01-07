import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // Esto es crucial: Permite que Vite exponga las variables que empiezan por REACT_APP_
  // para mantener compatibilidad con tu código actual.
  envPrefix: 'REACT_APP_',
  build: {
    outDir: 'dist',
  },
});