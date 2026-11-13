import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vite'

export default defineConfig(({ mode }) => ({
  base: mode === 'production' ? '/xujing-contract/' : '/',
  plugins: [react(), tailwindcss()],
  server: { port: 5173, host: true },
}))
