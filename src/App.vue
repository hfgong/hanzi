<template>
  <div id="app">
    <header>
      <h1>漢字部件字典</h1>
    </header>
    <main class="container">
      <Search />
    </main>
  </div>
</template>

<script>
import Search from './components/Search.vue';

export default {
  name: 'App',
  components: {
    Search
  }
}
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
</style>