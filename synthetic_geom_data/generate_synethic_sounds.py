import pandas as pd
from gtts import gTTS
import pickle as pk
import lorem
import json
import urllib.request
import geojson
import h3
import time
from pathlib import Path
from tqdm import tqdm


sounds = Path('./sounds')
sounds.mkdir(parents=True, exist_ok=True)

with urllib.request.urlopen('https://data.cityofnewyork.us/resource/7t3b-ywvw.geojson') as url:
    boro = json.loads(url.read().decode())
for b in boro['features']:
    for pol in b['geometry']['coordinates']:
        for segment in pol:
            for idx, point in enumerate(segment):
                segment[idx] = point[::-1]
centers = []
for b in boro['features']:
    for pol in b['geometry']['coordinates']:
        points = map(h3.h3_to_geo, h3.polyfill(dict(geojson.Polygon(pol)), 10))
        centers.extend(points)

# raw_data = pd.read_csv('open_streets_locations.csv')

# flatten = lambda t: [item for sublist in t for item in sublist]

# def parse_latlongstr(raw_str):
#     start_i = raw_str.find("((")
#     end_i = raw_str.find("))")
#     multiline_str = raw_str[start_i+2:end_i]
#     latlong_strs = multiline_str.split(",")
#     return latlong_strs


# geom_data = raw_data['the_geom']
# extracted_latlongstrs = [parse_latlongstr(raw_str) for raw_str in geom_data.tolist()]
# flattened_lat_longstrs = flatten(extracted_latlongstrs)


with open('tts.csv', 'w') as of:
    of.write('lat lng filename\n')
    for latlong in tqdm(centers):
        random_lorem_ipsum_txt = lorem.sentence()
        latlongstr = f"{latlong[0]} {latlong[1]}"
        text_for_speech = f"{random_lorem_ipsum_txt} {latlongstr}"
        filename = hash(latlongstr)
        of.write(f"{latlongstr} {filename}\n")
        if Path(sounds / f"{filename}.mp3").exists():
            continue
        tts = gTTS(text_for_speech)
        tts.save(sounds / f"{filename}.mp3")
        time.sleep(1)
        # dataset_map_key[filename] = latlongstr

# with open('fp_latlong_map.pk', 'wb+') as outfile:
#     pk.dump(dataset_map_key, outfile)
