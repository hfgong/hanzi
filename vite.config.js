import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import { VitePWA } from 'vite-plugin-pwa';
import { execSync } from 'child_process';

const commitId = execSync('git rev-parse --short HEAD').toString().trim();

export default defineConfig({
  base: './',  // 核心修复：使用相对路径适配 GitHub Pages
  plugins: [
    vue(),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: '漢字部件字典',
        short_name: 'HanziDict',
        start_url: './',
        display: 'standalone',
        background_color: '#ffffff',
        theme_color: '#2c3e50',
        icons: [
          { src: './icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: './icon-512.png', sizes: '512x512', type: 'image/png' }
        ]
      }
    })
  ],
  define: {
    __COMMIT_ID__: JSON.stringify(commitId)
  }
});
