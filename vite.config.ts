import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    proxy: {
      '/api/pms': {
        target: 'https://live.ipms247.com/pmsinterface',
        changeOrigin: true,
        rewrite: path => path.replace(/^\/api\/pms/, ''),
        secure: false,
      },
      '/api/pms-inventory': {
        target: 'https://live.ipms247.com/pmsinterface/getdataAPI.php',
        changeOrigin: true,
        rewrite: path => '',
        secure: false,
      },
    },
  },
  plugins: [
    react(),
    mode === 'development' && componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
