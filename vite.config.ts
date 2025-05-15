import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  define: {
    // Asegurarse de que process.env está disponible en el cliente
    'process.env': {}
  },
  server: {
    port: 5173,
    proxy: {
      '/.netlify/functions': {
        target: 'http://localhost:9999',
        changeOrigin: true,
        secure: false,
      }
    }
  },
  build: {
    outDir: 'dist',
    // Optimizaciones para producción
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,  // Eliminar console.log en producción
        drop_debugger: true  // Eliminar debugger en producción
      }
    },
    rollupOptions: {
      output: {
        manualChunks: undefined
      }
    },
    // Generar prefetch para mejorar la velocidad de carga
    modulePreload: {
      polyfill: true,
    },
    // Optimizar el tamaño del bundle
    target: 'es2018',
    // Habilitar análisis de código muerto
    sourcemap: false,
  }
})
