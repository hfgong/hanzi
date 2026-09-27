# Hanzi 字典

一款支持漢字部件拆分的離線字典 Web App。

## 功能
- 同時支持簡體與繁體輸入，查詢結果會列出對應的轉換形式
- 顯示拼音（聲調符號）、全部讀音與釋義、部件拆分（可點擊）
- 反向部件查詢
- 離線可用（PWA，可添加到主屏幕）

## 安裝與啟動

### 克隆項目

```bash
git clone <你的倉庫地址>
cd hanzi
```

## 圖標

`icon.svg` 為本項目原創（與 Mobile LaTeX、AirCopy、農曆同系列風格）；其中「漢」字形取自 Noto Sans TC（SIL Open Font License 1.1）並轉為矢量路徑。PNG 圖標由其導出。

## 數據說明

數據位於 `data/` 目錄，為預處理好的緊凑 JSON；各文件的來源與授權見 [`data/README.md`](data/README.md)。

- 單字、部件、繁簡對照約 0.5 MB（gzip），打開即可查詢
- 多字詞語約 3.7 MB（gzip），在後台載入

## 預處理腳本

```bash
cd preprocess
python3 update_all.py      # 下載缺少的原始數據並重新生成 data/*.json
python3 prepare_data.py    # 只用現有原始數據重新生成
```

## 通过GitHub Pages访问

https://hfgong.github.io/hanzi/
