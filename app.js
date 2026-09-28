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

// Navigation: every lookup is a history entry (?q=…), so the header's back button,
// the browser/phone back gesture and the home button all move between lookups.
const currentQuery = () => new URLSearchParams(location.search).get('q') || '';

function navigate(query) {
  query = query.trim();
  if (query === currentQuery()) {
    show(query);
    return;
  }
  const url = query ? `?q=${encodeURIComponent(query)}` : location.pathname;
  history.pushState({ depth: (history.state?.depth || 0) + 1 }, '', url);
  show(query);
}

function show(query) {
  $('searchInput').value = query;
  search();
  const depth = history.state?.depth || 0;
  $('backBtn').hidden = depth === 0;
  $('homeBtn').hidden = !query;
  window.scrollTo({ top: 0 });
}

document.addEventListener('DOMContentLoaded', async () => {
  history.replaceState({ depth: history.state?.depth || 0 }, '');
  $('searchForm').addEventListener('submit', e => {
    e.preventDefault();
    $('searchInput').blur(); // close the on-screen keyboard
    navigate($('searchInput').value);
  });
  // The clear (✕) button of the search field returns to the home screen.
  $('searchInput').addEventListener('search', () => {
    if (!$('searchInput').value) navigate('');
  });
  $('backBtn').addEventListener('click', () => history.back());
  $('homeBtn').addEventListener('click', () => navigate(''));
  window.addEventListener('popstate', () => show(currentQuery()));

  $('searchInput').value = currentQuery();
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
  renderRadicals();
  show(currentQuery());

  try {
    words = await loadJson('data/words.json');
  } catch (err) {
    words = {};
    console.warn('詞語數據載入失敗', err);
  }
  // Re-run a word search that was waiting for the word list.
  if (Array.from(tradToSimp(currentQuery())).length > 1) search();
});

// Radicals are hard to type with an input method, so the home screen lists them.
// COMMON: frequent radical forms that input methods rarely offer.
const COMMON_RADICALS = '亻氵扌忄艹讠钅纟饣辶阝刂冫犭礻衤宀冖疒广灬攵⺮⺼罒覀彳尸廴卩丬爫耂亠厂囗勹匚彡夂';
// All 214 Kangxi radicals by stroke count, plus common variant forms (亻, 氵, 讠 …) in their stroke group.
const RADICALS_BY_STROKE = {
  1: '一丨丶丿乙亅',
  2: '二亠人儿入八冂冖冫几凵刀力勹匕匚匸十卜卩厂厶又亻刂讠⺈⺊',
  3: '口囗土士夂夊夕大女子宀寸小尢尸屮山巛工己巾干幺广廴廾弋弓彐彡彳氵扌忄犭艹辶纟饣丬⺌',
  4: '心戈戶手支攴文斗斤方无日曰月木欠止歹殳毋比毛氏气水火爪父爻爿片牙牛犬灬爫攵礻⺼耂',
  5: '玄玉瓜瓦甘生用田疋疒癶白皮皿目矛矢石示禸禾穴立衤钅罒',
  6: '竹米糸缶网羊羽老而耒耳聿肉臣自至臼舌舛舟艮色艸虍虫血行衣襾覀⺮糹',
  7: '見角言谷豆豕豸貝赤走足身車辛辰辵邑酉釆里',
  8: '金長門阜隶隹雨靑非釒',
  9: '面革韋韭音頁風飛食首香飠',
  10: '馬骨高髟鬥鬯鬲鬼魚鳥',
  11: '鹵鹿麥麻',
  12: '黃黍黑黹',
  13: '黽鼎鼓鼠',
  14: '鼻齊',
  15: '齒',
  16: '龍龜',
  17: '龠'
};

function renderRadicals() {
  // Only list radicals that occur as a component, so every chip leads to results.
  const used = new Set();
  for (const ids of Object.values(decomp)) for (const ch of ids) used.add(ch);
  const chips = str => Array.from(new Set(str)).filter(r => used.has(r)).map(charChip);

  $('commonRadicals').replaceChildren(...chips(COMMON_RADICALS));
  $('radicalsByStroke').replaceChildren(...Object.entries(RADICALS_BY_STROKE).flatMap(([strokes, radicals]) => {
    const items = chips(radicals);
    if (!items.length) return [];
    const group = document.createElement('div');
    group.className = 'stroke-group';
    const label = document.createElement('span');
    label.textContent = `${strokes} 畫`;
    const grid = document.createElement('div');
    grid.className = 'char-grid';
    grid.replaceChildren(...items);
    group.append(label, grid);
    return [group];
  }));
}

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

const lookup = ch => navigate(ch);

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
  $('radicalsContainer').hidden = !!simplifiedQuery;
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
