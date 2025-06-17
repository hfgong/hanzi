
import json
import re

# 读取新版 CC-CEDICT 数据 (cedict_1_0_ts_utf-8_mdbg.txt)
def load_cedict(path):
    cedict = {}
    with open(path, 'r', encoding='utf-8') as f:
        for line in f:
            if line.startswith('#') or not line.strip():
                continue
            match = re.match(r'^(\S+) (\S+) \[(.*?)\] \/(.*)\/', line)
            if not match:
                continue
            trad, simp, pinyin, definition = match.groups()
            cedict[simp] = {
                "character": simp,
                "pinyin": pinyin,
                "definition": definition
            }
    return cedict

# 读取新版 MakeMeAHanzi dictionary.txt

def load_decomposition(path):
    decomposition = {}
    with open(path, 'r', encoding='utf-8') as f:
        for line in f:
            item = json.loads(line.strip())
            character = item.get("character")
            decomp = item.get("decomposition", "")
            if character and decomp:
                decomposition[character] = decomp
    return decomposition

# 读取 CHISE IDS 数据 (保持不变)
def load_ids(path):
    ids = {}
    with open(path, 'r', encoding='utf-8') as f:
        for line in f:
            if not line.strip() or line.startswith('#'):
                continue
            parts = line.strip().split(' ', 1)
            if len(parts) == 2:
                char, decomp = parts
                ids[char] = decomp
    return ids

# 整合数据
def merge_all(cedict, decomposition, ids):
    index = {}
    for char in cedict:
        index[char] = cedict[char]
        index[char]["decomposition"] = decomposition.get(char, ids.get(char, ""))
    return index

if __name__ == "__main__":
    cedict_path = "data/cedict_1_0_ts_utf-8_mdbg.txt"
    decomp_path = "data/dictionary.txt"
    ids_path = "data/ids.txt"

    cedict = load_cedict(cedict_path)
    decomposition = load_decomposition(decomp_path)
    ids = load_ids(ids_path)

    index = merge_all(cedict, decomposition, ids)

    with open("../public/data/index.json", "w", encoding="utf-8") as f:
        json.dump(index, f, ensure_ascii=False, indent=2)

    print("整合完成，共处理汉字数量：", len(index))
