import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  define: {
    // Asegurarse de que process.env está disponible en el cliente
    'process.env': {}
  }
})
