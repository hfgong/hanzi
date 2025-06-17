#!/bin/bash

# 构建生产版本
npm run build

# 进入构建输出目录
cd dist

git init
git checkout -b gh-pages
git add .
git commit -m "deploy"
git remote add origin git@github.com:hfgong/hanzi.git
git push -f origin gh-pages

cd ..
rm -rf dist/.git

echo "已成功部署到 GitHub Pages."