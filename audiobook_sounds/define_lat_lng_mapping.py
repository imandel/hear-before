import csv
import os

directories = [_dir for _dir in os.listdir() if "." not in _dir] # I hate myself
file_paths = []

for _dir in directories:
    file_paths += os.listdir(_dir)

latlngs = []

with open('tts.txt', 'r') as inf:
    reader = csv.reader(inf, delimiter=',')
    next(reader)
    for row in reader:
        latlngs.append([row[0], row[1]])

multiplier = int(len(latlngs) / len(file_paths))
extended_filepaths = (file_paths * (multiplier + 1))[:len(latlngs)]

latlngs_updated_mappings = [[r[0], r[1], extended_filepaths[i]] for i, r in enumerate(latlngs)]

with open('latlng_mapping_update.csv', 'w+', newline='') as csvfile:
    writer = csv.writer(csvfile, delimiter=',')
    for row in latlngs_updated_mappings:
        writer.writerow(row)
