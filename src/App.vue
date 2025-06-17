<template>
  <div id="app">
    <header>
      <h1>漢字部件字典</h1>
    </header>
    <main class="container">
      <Search v-if="ready" />
      <div v-else class="loading">正在加载字典数据...</div>
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
    
    provide('indexData', indexData);

    onMounted(async () => {
      try {
        const path = `${import.meta.env.BASE_URL}data/index.json`;
        console.log('Loading index.json from:', path);
        const res = await axios.get(path);
        indexData.value = res.data;
        ready.value = true;
      } catch (err) {
        console.error('Failed to load data/index.json:', err);
      }
    });

    return { ready };
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
}
</style>
