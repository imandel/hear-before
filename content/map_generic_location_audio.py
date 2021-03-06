import pandas as pd
from pydub import AudioSegment
import os
from tqdm import tqdm

def export_mp3_file(in_path, out_path):
    AudioSegment.from_file(in_path).export(out_path, format="mp3", bitrate="100k")

def combine_generic_loc_audio(path, dir, cat):
    locs = pd.read_csv(path)
    lat_lngs = list(zip(locs['lat'].tolist(), locs['lng'].tolist()))
    mp3_files = [f"{dir}/{fp}" for fp in os.listdir(dir) if fp != '.DS_Store']
    files_w_hashes = [(mp3_file, f'curated_audio/{hash(mp3_file)}.mp3') for mp3_file in mp3_files]
    file_hashes = [_hash for fp, _hash in files_w_hashes]
    extend_file_hashes = file_hashes * 20
    print(len(extend_file_hashes))
    data = []
    for i, pt in enumerate(lat_lngs):
        data.append([extend_file_hashes[i], pt[0], pt[1]])
    pd.DataFrame(data, columns = ['filename', 'lat', 'lng']).to_csv(f'content/curated_audio_map_{cat}.csv',index=False)
    for in_file, out_file in tqdm(files_w_hashes):
        export_mp3_file(in_file, out_file)

pointers = [
    'content/curated_audio_map_arcade.csv',
    'content/curated_audio_map_barbershop.csv',
    'content/curated_audio_map_cemetary.csv',
    'content/curated_audio_map_mta.csv',
    'content/curated_audio_map_sea_shanty.csv',
]

dfs = [pd.read_csv(fp) for fp in pointers]
pd.concat(dfs).to_csv('content/generic_curated_content.csv',index=False)