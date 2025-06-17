// src/components/Search.vue
<template>
  <div class="search-container">
    <div class="search-box">
      <input v-model="query" @keyup.enter="search" placeholder="輸入漢字或部件" />
      <button @click="search">查詢</button>
    </div>

    <div v-if="result" class="result-card">
      <h2 class="main-char">{{ result.character }}</h2>
      <div class="details">
        <p><span class="label">拼音：</span> {{ result.pinyin }}</p>
        <p><span class="label">釋義：</span> {{ result.definition }}</p>
        <p><span class="label">部件拆分：</span> {{ result.decomposition }}</p>
      </div>
    </div>

    <div v-if="componentResults.length" class="reverse-lookup">
      <h3>包含此部件的漢字</h3>
      <div class="char-grid">
        <span v-for="item in componentResults" :key="item" class="char-item" @click="selectChar(item)">{{ item }}</span>
      </div>
    </div>

    <div class="version-info">
      版本: {{ commitId }}
    </div>
  </div>
</template>

<script>
export default {
  inject: ['indexData'],
  data() {
    return {
      query: '',
      result: null,
      componentResults: [],
      commitId: __COMMIT_ID__
    };
  },
  methods: {
    search() {
      const q = this.query.trim();
      this.result = this.indexData[q] || null;
      this.componentResults = Object.keys(this.indexData).filter(ch => {
        const item = this.indexData[ch];
        return item.decomposition.includes(q);
      });
    },
    selectChar(char) {
      this.query = char;
      this.search();
    }
  }
};
</script>

<style scoped>
html {
  font-size: 18px;
}

.search-container {
  background: white;
  padding: 1rem;
  box-shadow: 0 8px 20px rgba(0,0,0,0.1);
  border-radius: 10px;
  margin: 1rem auto;
  max-width: 95vw;
}

@media (min-width: 600px) {
  .search-container {
    max-width: 900px;
    padding: 2rem;
    border-radius: 16px;
  }
}

@media (max-width: 599px) {
  .search-container {
    max-width: 420px;
    width: 95vw;
  }
}

.search-box {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 2rem;
}

@media (min-width: 600px) {
  .search-box {
    flex-direction: row;
    align-items: center;
  }
}

input {
  padding: 16px;
  font-size: 18px;
  border: 1px solid #ccc;
  border-radius: 10px;
  width: 100%;
  box-sizing: border-box;
}

button {
  padding: 16px;
  font-size: 18px;
  background-color: #2c3e50;
  color: white;
  border: none;
  border-radius: 10px;
  cursor: pointer;
  transition: background 0.3s;
  white-space: nowrap;
  width: 100%;
}

@media (min-width: 600px) {
  button {
    width: auto;
    padding: 16px 32px;
  }
}

button:hover {
  background-color: #34495e;
}

.result-card {
  background-color: #fafafa;
  border: 1px solid #ccc;
  padding: 1.5rem;
  border-radius: 12px;
  margin-bottom: 2rem;
  text-align: center;
}

.main-char {
  font-size: 4rem;
  margin-bottom: 1rem;
}

@media (min-width: 600px) {
  .main-char {
    font-size: 5rem;
  }
}

.details {
  text-align: left;
  font-size: 1rem;
}

@media (min-width: 600px) {
  .details {
    font-size: 1.2rem;
  }
}

.label {
  font-weight: bold;
  color: #555;
}

.reverse-lookup {
  text-align: left;
}

.char-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-top: 1rem;
  justify-content: center;
}

.char-item {
  background: #dfe6ec;
  padding: 14px;
  border-radius: 10px;
  font-size: 1.8rem;
  cursor: pointer;
  transition: transform 0.2s, background 0.2s;
}

.char-item:hover {
  transform: scale(1.1);
  background: #b0c4de;
}

.version-info {
  text-align: center;
  margin-top: 1rem;
  font-size: 0.8rem;
  color: #888;
}
</style>
