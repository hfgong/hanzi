let indexData = {};

window.onload = async () => {
  try {
    const res = await fetch('data/index.json');
    indexData = await res.json();
    console.log("字典数据加载成功，共加载", Object.keys(indexData).length, "个汉字");
  } catch (err) {
    alert("数据加载失败：" + err);
  }
};

function search() {
  const query = document.getElementById('searchInput').value.trim();
  if (!query) {
    document.getElementById('resultContainer').style.display = 'none';
    document.getElementById('componentsContainer').style.display = 'none';
    return;
  }
  const result = indexData[query];

  // 处理单字查询
  if (result) {
    document.getElementById('resultContainer').style.display = 'block';
    document.getElementById('char').innerText = result.character;
    document.getElementById('pinyin').innerText = result.pinyin;
    document.getElementById('definition').innerText = result.definition;
    document.getElementById('decomposition').innerText = result.decomposition;
  } else {
    document.getElementById('resultContainer').style.display = 'none';
  }

  // 处理部件反向查询
  const components = Object.keys(indexData).filter(ch => {
    return indexData[ch].decomposition.includes(query);
  });

  const componentsContainer = document.getElementById('componentsContainer');
  const componentsList = document.getElementById('componentsList');
  componentsList.innerHTML = '';

  if (components.length) {
    components.forEach(ch => {
      const span = document.createElement('span');
      span.innerText = ch;
      span.className = 'char-item';
      span.onclick = () => {
        document.getElementById('searchInput').value = ch;
        search();
      };
      componentsList.appendChild(span);
    });
    componentsContainer.style.display = 'block';
  } else {
    componentsContainer.style.display = 'none';
  }
}
