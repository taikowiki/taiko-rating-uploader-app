import { defineConfig } from 'vite'
import { svelte } from '@sveltejs/vite-plugin-svelte'

// https://vite.dev/config/
export default defineConfig({
  plugins: [svelte()],
  build: {
    outDir: '../www'
  },
  server: {
    proxy: {
      '/donderhiroba': {
        target: 'https://donderhiroba.jp',
        changeOrigin: true,
        secure: true,
        rewrite: path => path.replace(/^\/donderhiroba/, ''),
        configure: (proxy) => {
          proxy.on('proxyReq', (proxyReq, req, res) => {
            if (req?.url) {
              const searchParams = new URLSearchParams(req.url.split('?')[1]);
              const cookie = searchParams.get('cookie');
              if (cookie) {
                console.log(cookie);
                proxyReq.setHeader('Cookie', cookie);
              }
            }
          });
        }
      }
    }
  }
})
