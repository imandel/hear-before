import pandas as pd
from gtts import gTTS
import pickle as pk
import lorem

raw_data = pd.read_csv('open_streets_locations.csv')

flatten = lambda t: [item for sublist in t for item in sublist]

def parse_latlongstr(raw_str):
    start_i = raw_str.find("((")
    end_i = raw_str.find("))")
    multiline_str = raw_str[start_i+2:end_i]
    latlong_strs = multiline_str.split(",")
    return latlong_strs


geom_data = raw_data['the_geom']
extracted_latlongstrs = [parse_latlongstr(raw_str) for raw_str in geom_data.tolist()]
flattened_lat_longstrs = flatten(extracted_latlongstrs)

dataset_map_key = {}

for latlongstr in flattened_lat_longstrs[1420:]:
    random_lorem_ipsum_txt = lorem.sentence()
    text_for_speech = f'{random_lorem_ipsum_txt} {latlongstr}'
    tts = gTTS(text_for_speech)
    filename = hash(latlongstr)
    dataset_map_key[filename] = latlongstr
    tts.save(f"generated_audio/{filename}.mp3")

with open('fp_latlong_map.pk', 'wb+') as outfile:
    pk.dump(dataset_map_key, outfile)
