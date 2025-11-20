import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0', // Bind to all network interfaces
    port: 5175,       // Use a different port to avoid conflict
    cors: true        // Enable CORS for cross-origin requests
  },
  preview: {
    host: '0.0.0.0',  // For production preview
    port: 4173
  }
})
