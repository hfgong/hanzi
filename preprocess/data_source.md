# 数据来源说明

本项目中的数据文件为本人使用以下开源项目整合整理而成：

- **CC-CEDICT**  
  - 项目地址: https://cc-cedict.org/wiki/  
  - 授权协议: Creative Commons Attribution-ShareAlike 4.0（CC BY-SA 4.0）

- **Make Me A Hanzi**（仅使用 dictionary.txt）  
  - 项目地址: https://github.com/skishore/makemeahanzi  
  - 授权协议: dictionary.txt 为 LGPL-3.0 或更新版本（源自 Unihan 与 CJKlib）；graphics.txt 为 Arphic Public License（未使用）

- **CHISE IDS**（目前未用于生成数据，见 prepare_data.py 的 USE_CHISE_IDS）  
  - 项目地址: https://github.com/cjkvi/cjkvi-ids  
  - 授权协议: GPLv2（ids.txt 源自 CHISE 项目）

生成的数据文件及授权见 ../data/README.md。使用时请遵循各数据源的原始协议。

整合工具链及代码由本项目自建完成，欢迎参考使用。
