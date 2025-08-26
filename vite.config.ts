import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import commonjs from 'vite-plugin-commonjs';


export default defineConfig({
  plugins: [react(), commonjs()],
  server: {
    host: true,
    port: 5173,
    allowedHosts: [
      "6c682370c478.ngrok-free.app" // adiciona seu host do ngrok
    ]
  },
  optimizeDeps: {
    exclude: ["@stomp/stompjs", "sockjs-client"]
  }
});


