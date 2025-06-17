<template>
  <div id="app">
    <header>
      <h1>漢字部件字典</h1>
    </header>
    <main class="container">
      <Search v-if="ready" />
      <div v-else class="loading">
        <p>正在加载字典数据...</p>
        <p v-if="error" style="color:red;">数据加载失败: {{ error }}</p>
      </div>
    </main>
  </div>
</template>

<script>
import axios from 'axios';
import Search from './components/Search.vue';
import { provide, ref, onMounted } from 'vue';

export default {
  name: 'App',
  components: { Search },
  setup() {
    const indexData = ref({});
    const ready = ref(false);
    const error = ref("");

    provide('indexData', indexData);

    onMounted(async () => {
      try {
        const path = `${import.meta.env.BASE_URL}data/index.json`;
        console.log('[调试] 正在请求:', path);
        const res = await axios.get(path);
        indexData.value = res.data;
        ready.value = true;
        console.log('[调试] index.json 加载成功，共加载汉字数量:', Object.keys(res.data).length);
      } catch (err) {
        console.error('[调试] index.json 加载失败:', err);
        error.value = err.message;
      }
    });

    return { ready, error };
  }
};
</script>

<style>
@import url('https://fonts.googleapis.com/css2?family=Noto+Sans+SC&display=swap');

body {
  margin: 0;
  font-family: 'Noto Sans SC', sans-serif;
  background-color: #f2f4f7;
}

header {
  background-color: #2c3e50;
  color: white;
  padding: 1rem;
  text-align: center;
  font-size: 2rem;
  letter-spacing: 2px;
}

.container {
  display: flex;
  justify-content: center;
  padding: 3rem;
}

.loading {
  font-size: 1.2rem;
  color: #555;
  text-align: center;
}
</style>
