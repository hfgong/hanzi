# Hanzi 字典

一款支持漢字部件拆分的離線字典 Web App。

## 功能
- 支持簡體輸入、繁體查詢
- 顯示拼音、釋義、部件拆分
- 反向部件查詢
- 完整離線支持（PWA + IndexedDB）

## 安裝與啟動

### 克隆項目

```bash
git clone <你的倉庫地址>
cd hanzi
```

### 安裝依賴

```bash
npm install
```

### 開發模式

```bash
npm run dev
```

### 構建生產版本

```bash
npm run build
```

### 部署到 GitHub Pages

請參考 Vite 官方 GitHub Pages 部署指南或使用 `gh-pages` 插件。

## 數據說明

完整數據位於 `public/data/` 目錄，格式為預處理好的 JSON，可自行更新。

## 預處理腳本

`preprocess/prepare_data.py` 可用於整理與更新數據源。
