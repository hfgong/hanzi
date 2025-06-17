import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  base: '/hanzi/',  // 注意：必须是你的仓库名
  plugins: [
    vue(),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: '漢字部件字典',
        short_name: 'HanziDict',
        start_url: '/hanzi/',  // PWA 这里也最好写全路径
        display: 'standalone',
        background_color: '#ffffff',
        theme_color: '#2c3e50',
        icons: [
          {
            src: '/hanzi/icon-192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: '/hanzi/icon-512.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      }
    })
  ],
  build: {
    outDir: 'dist'
  }
});
