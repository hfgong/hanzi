let indexData = {};
let t2sMap = {};
let s2tMap = {};

const $ = id => document.getElementById(id);
const IDS_OPERATORS = /[⿰-⿿]/;

document.addEventListener('DOMContentLoaded', async () => {
  $('searchForm').addEventListener('submit', e => {
    e.preventDefault();
    search();
  });

  $('searchBtn').disabled = true;
  try {
    const load = url => fetch(url).then(res => {
      if (!res.ok) throw new Error(`${url}: HTTP ${res.status}`);
      return res.json();
    });
    [indexData, t2sMap, s2tMap] = await Promise.all([
      load('data/index.json'), load('data/t2s.json'), load('data/s2t.json')
    ]);
    $('status').textContent = '';
    console.log("字典数据加载成功，共加载", Object.keys(indexData).length, "个汉字");
  } catch (err) {
    $('status').textContent = `⚠️ 數據載入失敗：${err.message}`;
    $('status').classList.add('error');
    return;
  } finally {
    $('searchBtn').disabled = false;
  }
  if ($('searchInput').value.trim()) search();
});

function lookup(ch) {
  $('searchInput').value = ch;
  search();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function charChip(ch) {
  const span = document.createElement('span');
  span.textContent = ch;
  span.className = 'char-item';
  span.addEventListener('click', () => lookup(ch));
  return span;
}

// Show IDS operators (⿰, ⿱ …) and unknown parts (？) as plain text, components as tappable chips.
function renderDecomposition(decomposition) {
  const el = $('decomposition');
  el.replaceChildren();
  if (!decomposition) {
    el.textContent = '—';
    return;
  }
  const wrap = document.createElement('div');
  wrap.className = 'decomp';
  for (const ch of Array.from(decomposition)) {
    if (IDS_OPERATORS.test(ch) || ch === '？' || ch === '?') {
      const span = document.createElement('span');
      span.className = 'ids';
      span.textContent = ch;
      wrap.appendChild(span);
    } else {
      wrap.appendChild(charChip(ch));
    }
  }
  el.appendChild(wrap);
}

function search() {
  const query = $('searchInput').value.trim();
  const simplifiedQuery = tradToSimp(query);
  const result = indexData[simplifiedQuery];
  $('status').classList.remove('error');
  if (!simplifiedQuery) {
    $('resultContainer').hidden = true;
    $('componentsContainer').hidden = true;
    $('status').textContent = '';
    return;
  }

  // 处理单字查询
  if (result) {
    $('resultContainer').hidden = false;
    const [main, variant] = buildCharDisplay(query, simplifiedQuery);
    const small = document.createElement('small');
    small.textContent = variant;
    $('char').replaceChildren(main, ...(variant ? [small] : []));
    $('pinyin').textContent = result.pinyin;
    $('definition').textContent = result.definition;
    renderDecomposition(result.decomposition);
  } else {
    $('resultContainer').hidden = true;
  }

  // 处理部件反向查询
  const components = Object.keys(indexData).filter(ch => {
    return indexData[ch].decomposition.includes(simplifiedQuery);
  });

  $('componentsList').replaceChildren(...components.map(charChip));
  $('componentsCount').textContent = components.length ? `（${components.length}）` : '';
  $('componentsContainer').hidden = !components.length;

  $('status').textContent = !result && !components.length ? `找不到「${query}」` : '';
}

function tradToSimp(str) {
  return Array.from(str).map(ch => t2sMap[ch] || ch).join('');
}

// Returns [main text, variant text or ''] for the result heading.
function buildCharDisplay(original, simplified) {
  if (original === simplified) {
    // simplified input, show traditional variants
    const tradForms = Array.from(simplified)
      .map(ch => (s2tMap[ch] ? s2tMap[ch].join('') : ch))
      .join('');
    return tradForms && tradForms !== simplified ? [simplified, `繁 ${tradForms}`] : [simplified, ''];
  } else {
    // traditional input
    return [original, `簡 ${simplified}`];
  }
}
