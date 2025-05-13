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
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        secure: false
      }
    }
  },
  build: {
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
        // Separar el código en chunks para mejorar el caching
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom'],
          ui: ['@syncfusion/ej2-base', '@syncfusion/ej2-react-calendars', '@syncfusion/ej2-react-charts', '@syncfusion/ej2-react-grids'],
        }
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
