# 數據文件與授權

由 `preprocess/prepare_data.py` 生成，請勿手動編輯。不同授權的數據分文件存放。

| 文件 | 內容 | 來源 | 授權 |
|---|---|---|---|
| `chars.json` | 單字詞條（拼音、釋義） | [CC-CEDICT](https://cc-cedict.org/wiki/) | [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/) |
| `words.json` | 多字詞語 | CC-CEDICT | CC BY-SA 4.0 |
| `t2s.json` / `s2t.json` | 繁簡單字對照（由 CC-CEDICT 單字詞條生成） | CC-CEDICT | CC BY-SA 4.0 |
| `decomp.json` | 部件拆分（IDS） | [Make Me a Hanzi](https://github.com/skishore/makemeahanzi) `dictionary.txt`（源自 Unihan 與 CJKlib） | [LGPL-3.0 或更新版本](https://www.gnu.org/licenses/lgpl-3.0.html)，另見 `LICENSE-makemeahanzi.txt`（含 Unicode 授權聲明） |

以上文件均為對原始數據的修改版本：只保留所需欄位並轉為緊凑 JSON；`decomp.json` 去掉了完全未知（「？」）的拆分。

CHISE IDS（`preprocess/data/ids.txt`，GPLv2）目前**未**使用，見 `prepare_data.py` 中的 `USE_CHISE_IDS`。
