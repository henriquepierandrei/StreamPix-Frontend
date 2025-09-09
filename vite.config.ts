import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import commonjs from 'vite-plugin-commonjs';


export default defineConfig({
  plugins: [react(), commonjs()],
  build: {
    outDir: 'dist'
  },
  // base: './',
  server: {
    host: true,
    port: 5173,
    allowedHosts: [
      "6c682370c478.ngrok-free.app" // adiciona seu host do ngrok
    ]
  },
  optimizeDeps: {
    include: ['@stomp/stompjs/esm6/client', 'sockjs-client'],
  }
});


