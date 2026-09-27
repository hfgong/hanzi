"""把原始数据整合为网页使用的 JSON（输出到 ../data/）。

输出文件（紧凑 JSON，无缩进）：
- chars.json   单字词条：{简体: [[繁体, 拼音, 释义], ...]}，同一简体的多个读音/词条全部保留
- words.json   多字词语，格式同上（较大，网页在后台加载）
               以上两个来源 CC-CEDICT（CC BY-SA 4.0）
- decomp.json  部件拆分：{字: IDS}，来源 Make Me a Hanzi dictionary.txt（LGPL-3.0+）
- t2s.json     繁→简单字映射；s2t.json 简→繁（可能多个）。均由 CC-CEDICT 单字词条生成

不同授权的数据分文件存放，互不混合。
"""
import json
import os
import re

HERE = os.path.dirname(os.path.abspath(__file__))
SRC = os.path.join(HERE, "data")
OUT = os.path.join(HERE, "..", "data")

# CHISE IDS（cjkvi-ids/ids.txt）为 GPLv2。开启后会用它补充 Make Me a Hanzi 缺失的拆分，
# 生成的 decomp.json 也随之受 GPLv2 约束，因此默认关闭。
USE_CHISE_IDS = False

# IDS 结构符（⿰⿱…）与未知部件「？」
NOT_COMPONENT = re.compile(r"[\u2ff0-\u2fff？]")


def load_cedict(path):
    """读取 CC-CEDICT，返回 (词条, 繁→简, 简→繁)。"""
    entries, t2s, s2t = {}, {}, {}
    pattern = re.compile(r"^(\S+) (\S+) \[(.*?)\] /(.*)/\s*$")
    with open(path, encoding="utf-8") as f:
        for line in f:
            if line.startswith("#"):
                continue
            m = pattern.match(line)
            if not m:
                continue
            trad, simp, pinyin, definition = m.groups()
            entries.setdefault(simp, []).append([trad, pinyin, definition])
            if len(trad) == 1 and len(simp) == 1:
                t2s.setdefault(trad, simp)
                forms = s2t.setdefault(simp, [])
                if trad not in forms:
                    forms.append(trad)
    return entries, t2s, s2t


def load_makemeahanzi(path):
    """读取 Make Me a Hanzi dictionary.txt（每行一个 JSON）。"""
    decomposition = {}
    with open(path, encoding="utf-8") as f:
        for line in f:
            item = json.loads(line)
            char, decomp = item.get("character"), item.get("decomposition", "")
            # 「？」表示未知部件；没有任何已知部件（如「女」→「？」、「氵」→「⿱？？」）则视为无拆分
            if char and NOT_COMPONENT.sub("", decomp):
                decomposition[char] = decomp
    return decomposition


def load_chise_ids(path):
    """读取 cjkvi-ids ids.txt：每行 `U+XXXX<TAB>字<TAB>IDS[<TAB>IDS…]`，取第一个 IDS。"""
    ids = {}
    with open(path, encoding="utf-8") as f:
        for line in f:
            if line.startswith("#") or not line.strip():
                continue
            parts = line.rstrip("\n").split("\t")
            if len(parts) < 3:
                continue
            char = parts[1]
            decomp = re.sub(r"\[[^\]]*\]$", "", parts[2])  # 去掉 [GTJK] 等地区标记
            if decomp and decomp != char:  # 独体字的 IDS 就是它本身
                ids[char] = decomp
    return ids


def dump(name, data):
    path = os.path.join(OUT, name)
    with open(path, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, separators=(",", ":"), sort_keys=True)
    print(f"{name}: {len(data)} 条, {os.path.getsize(path) / 1e6:.1f} MB")


if __name__ == "__main__":
    entries, t2s, s2t = load_cedict(os.path.join(SRC, "cedict_1_0_ts_utf-8_mdbg.txt"))
    decomposition = load_makemeahanzi(os.path.join(SRC, "dictionary.txt"))
    if USE_CHISE_IDS:
        for char, decomp in load_chise_ids(os.path.join(SRC, "ids.txt")).items():
            decomposition.setdefault(char, decomp)

    os.makedirs(OUT, exist_ok=True)
    dump("chars.json", {k: v for k, v in entries.items() if len(k) == 1})
    dump("words.json", {k: v for k, v in entries.items() if len(k) > 1})
    dump("decomp.json", decomposition)
    dump("t2s.json", t2s)
    dump("s2t.json", s2t)
