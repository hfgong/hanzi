import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import { VitePWA } from 'vite-plugin-pwa';
import { execSync } from 'child_process';

// 自动获取当前 Git commit ID
const commitId = execSync('git rev-parse --short HEAD').toString().trim();

export default defineConfig({
  base: '/hanzi/',  // 仓库路径
  plugins: [
    vue(),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: '漢字部件字典',
        short_name: 'HanziDict',
        start_url: '/hanzi/',
        display: 'standalone',
        background_color: '#ffffff',
        theme_color: '#2c3e50',
        icons: [
          { src: '/hanzi/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: '/hanzi/icon-512.png', sizes: '512x512', type: 'image/png' }
        ]
      }
    })
  ],
  build: { outDir: 'dist' },

  // 核心：在构建时注入全局常量 __COMMIT_ID__
  define: {
    __COMMIT_ID__: JSON.stringify(commitId)
  }
});
