
import os
import urllib.request
import zipfile
import tarfile
import subprocess

# 创建数据目录
data_dir = "data"
os.makedirs(data_dir, exist_ok=True)

# 下载函数
def download_file(url, dest):
    print(f"下載中: {url}")
    urllib.request.urlretrieve(url, dest)
    print(f"已保存到: {dest}")

# 下载 CC-CEDICT
cedict_url = "https://www.mdbg.net/chinese/export/cedict/cedict_1_0_ts_utf-8_mdbg.txt.gz"
cedict_gz = os.path.join(data_dir, "cedict.gz")
cedict_txt = os.path.join(data_dir, "cedict_1_0_ts_utf-8_mdbg.txt")

if not os.path.exists(cedict_txt):
    download_file(cedict_url, cedict_gz)
    import gzip
    with gzip.open(cedict_gz, 'rb') as f_in:
        with open(cedict_txt, 'wb') as f_out:
            f_out.write(f_in.read())
    os.remove(cedict_gz)

# 下载 MakeMeAHanzi
hanzi_url = "https://github.com/skishore/makemeahanzi/releases/download/1.0/dictionary.txt"
hanzi_file = os.path.join(data_dir, "dictionary.txt")
if not os.path.exists(hanzi_file):
    download_file(hanzi_url, hanzi_file)

# 下载 CHISE IDS
ids_url = "https://raw.githubusercontent.com/cjkvi/cjkvi-ids/master/ids.txt"
ids_file = os.path.join(data_dir, "ids.txt")
if not os.path.exists(ids_file):
    download_file(ids_url, ids_file)

# 运行整合脚本
print("開始整合數據...")
subprocess.run(["python", "prepare_data.py"])

print("全部更新完成 ✅")
