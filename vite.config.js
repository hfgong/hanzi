import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';

export default defineConfig({
  base: '/hanzi/', // 这里请确保与你的仓库名一致
  plugins: [vue()],
  build: {
    outDir: 'dist'
  }
});