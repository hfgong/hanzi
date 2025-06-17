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
  </div>
</template>

<script>
import axios from 'axios';

export default {
  data() {
    return {
      query: '',
      index: {},
      result: null,
      componentResults: []
    };
  },
  async created() {
    const res = await axios.get('data/index.json');
    this.index = res.data;
  },
  methods: {
    search() {
      const q = this.query.trim();
      this.result = this.index[q] || null;
      this.componentResults = Object.keys(this.index).filter(ch => {
        const item = this.index[ch];
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
.search-container {
  max-width: 900px;
  width: 100%;
  background: white;
  padding: 2.5rem;
  box-shadow: 0 8px 20px rgba(0,0,0,0.1);
  border-radius: 16px;
}

.search-box {
  display: flex;
  justify-content: center;
  margin-bottom: 2rem;
}

input {
  padding: 12px;
  font-size: 1.2rem;
  border: 1px solid #ccc;
  border-radius: 10px;
  width: 65%;
  margin-right: 12px;
}

button {
  padding: 12px 24px;
  font-size: 1.2rem;
  background-color: #2c3e50;
  color: white;
  border: none;
  border-radius: 10px;
  cursor: pointer;
  transition: background 0.3s;
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
  font-size: 5rem;
  margin-bottom: 1rem;
}

.details {
  text-align: left;
  font-size: 1.2rem;
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
</style>