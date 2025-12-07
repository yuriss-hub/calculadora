import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Carrega variáveis de ambiente (como a API Key configurada no Vercel)
  const env = loadEnv(mode, process.cwd(), '')

  return {
    plugins: [react()],
    define: {
      // Garante que o código 'process.env.API_KEY' continue funcionando
      'process.env.API_KEY': JSON.stringify(env.API_KEY)
    }
  }
})