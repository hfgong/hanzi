// Data (see data/README.md): chars/words = CC-CEDICT entries {simplified: [[traditional, pinyin, definition], ...]},
// decomp = Make Me a Hanzi IDS {char: ids}, t2s/s2t = traditional <-> simplified single characters.
let chars = {};
let words = null; // multi-character words load in the background after the core data
let decomp = {};
let t2sMap = {};
let s2tMap = {};

const $ = id => document.getElementById(id);
const IDS_OPERATORS = /[⿰-⿿]/;

const loadJson = url => fetch(url).then(res => {
  if (!res.ok) throw new Error(`${url}: HTTP ${res.status}`);
  return res.json();
});

function setStatus(text, isError = false) {
  $('status').textContent = text;
  $('status').classList.toggle('error', isError);
}

document.addEventListener('DOMContentLoaded', async () => {
  $('searchForm').addEventListener('submit', e => {
    e.preventDefault();
    search();
  });

  $('searchBtn').disabled = true;
  try {
    [chars, decomp, t2sMap, s2tMap] = await Promise.all(
      ['chars', 'decomp', 't2s', 's2t'].map(name => loadJson(`data/${name}.json`))
    );
  } catch (err) {
    setStatus(`⚠️ 數據載入失敗：${err.message}`, true);
    return;
  } finally {
    $('searchBtn').disabled = false;
  }
  setStatus('');
  if ($('searchInput').value.trim()) search();

  try {
    words = await loadJson('data/words.json');
  } catch (err) {
    words = {};
    console.warn('詞語數據載入失敗', err);
  }
  // Re-run a word search that was waiting for the word list.
  if (Array.from(tradToSimp($('searchInput').value.trim())).length > 1) search();
});

// CC-CEDICT numbered pinyin ("hao3", "nu:3", "Shi2") -> tone marks ("hǎo", "nǚ", "Shí").
const TONE_MARKS = {
  a: 'āáǎà', e: 'ēéěè', i: 'īíǐì', o: 'ōóǒò', u: 'ūúǔù', 'ü': 'ǖǘǚǜ',
  A: 'ĀÁǍÀ', E: 'ĒÉĚÈ', I: 'ĪÍǏÌ', O: 'ŌÓǑÒ', U: 'ŪÚǓÙ', 'Ü': 'ǕǗǙǛ'
};
function syllableToMarks(syllable) {
  const m = /^([A-Za-zÜü:]+?)([1-5])$/.exec(syllable);
  if (!m) return syllable;
  let [, letters, tone] = m;
  letters = letters.replace(/u:|v/g, 'ü').replace(/U:|V/g, 'Ü');
  if (tone === '5') return letters;
  // Rule: a/e takes the mark; in "ou" the o does; otherwise the last vowel.
  let idx = letters.search(/[aeAE]/);
  if (idx < 0) idx = letters.search(/o(?=u)|O(?=[uU])/);
  if (idx < 0) {
    const vowels = [...letters.matchAll(/[aeiouüAEIOUÜ]/g)];
    if (!vowels.length) return syllable; // e.g. "r5", "m2" stay as-is
    idx = vowels[vowels.length - 1].index;
  }
  return letters.slice(0, idx) + TONE_MARKS[letters[idx]][tone - 1] + letters.slice(idx + 1);
}
const pinyinToMarks = pinyin => pinyin.split(' ').map(syllableToMarks).join(' ');
// Also convert pinyin inside definitions, e.g. "old variant of 汝[ru3]".
const convertBracketPinyin = text => text.replace(/\[([A-Za-z:1-5 ]+)\]/g, (_, p) => `[${pinyinToMarks(p)}]`);

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

// One block per reading: pinyin, then its senses (CC-CEDICT separates senses with "/").
function renderEntries(entries) {
  const el = $('definition');
  el.replaceChildren();
  if (!entries.length) {
    el.textContent = '—';
    $('pinyin').textContent = '—';
    return;
  }
  $('pinyin').textContent = [...new Set(entries.map(([, p]) => pinyinToMarks(p)))].join('，');
  for (const [, pinyin, definition] of entries) {
    const block = document.createElement('div');
    block.className = 'reading';
    if (entries.length > 1) {
      const head = document.createElement('div');
      head.className = 'reading-pinyin';
      head.textContent = pinyinToMarks(pinyin);
      block.appendChild(head);
    }
    const list = document.createElement('ol');
    for (const sense of definition.split('/')) {
      const li = document.createElement('li');
      li.textContent = convertBracketPinyin(sense);
      list.appendChild(li);
    }
    block.appendChild(list);
    el.appendChild(block);
  }
}

function search() {
  const query = $('searchInput').value.trim();
  const simplifiedQuery = tradToSimp(query);
  setStatus('');
  if (!simplifiedQuery) {
    $('resultContainer').hidden = true;
    $('componentsContainer').hidden = true;
    return;
  }

  const isWord = Array.from(simplifiedQuery).length > 1;
  if (isWord && !words) setStatus('⏳ 詞語數據載入中，稍候自動顯示…');
  const entries = (isWord ? words?.[simplifiedQuery] : chars[simplifiedQuery]) || [];
  const decomposition = isWord ? '' : decomp[simplifiedQuery] || '';
  const found = entries.length || decomposition;

  // 单字 / 词语结果
  if (found) {
    $('resultContainer').hidden = false;
    const [main, variant] = buildCharDisplay(query, simplifiedQuery);
    const small = document.createElement('small');
    small.textContent = variant;
    $('char').replaceChildren(main, ...(variant ? [small] : []));
    renderEntries(entries);
    renderDecomposition(decomposition);
    $('decompositionRow').hidden = isWord;
  } else {
    $('resultContainer').hidden = true;
  }

  // 部件反向查询
  const containing = isWord ? [] : Object.keys(decomp).filter(ch => ch !== simplifiedQuery && decomp[ch].includes(simplifiedQuery));
  $('componentsList').replaceChildren(...containing.map(charChip));
  $('componentsCount').textContent = containing.length ? `（${containing.length}）` : '';
  $('componentsContainer').hidden = !containing.length;

  if (!found && !containing.length && !(isWord && !words)) setStatus(`找不到「${query}」`);
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
