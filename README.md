# Hanzi 字典

一款支持漢字部件拆分的離線字典 Web App。

## 功能
- 同時支持簡體與繁體輸入，查詢結果會列出對應的轉換形式
- 顯示拼音、釋義、部件拆分
- 反向部件查詢

## 安裝與啟動

### 克隆項目

```bash
git clone <你的倉庫地址>
cd hanzi
```

## 圖標

`icon.svg` 為本項目原創（與 Mobile LaTeX、AirCopy、農曆同系列風格）；其中「漢」字形取自 Noto Sans TC（SIL Open Font License 1.1）並轉為矢量路徑。PNG 圖標由其導出。

## 數據說明

完整數據位於 `public/data/` 目錄，格式為預處理好的 JSON，可自行更新。

## 預處理腳本

`preprocess/prepare_data.py` 可用於整理與更新數據源。

## 通过GitHub Pages访问

https://hfgong.github.io/hanzi/
