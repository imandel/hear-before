from pydub import AudioSegment
import os
import random
from pathlib import Path

#UGH HATE TO DO THIS BUT:

def chunk_audio_book(file_dir, audiobook_name):
    audiobook_sounds = Path(f'./audiobook_sounds/{audiobook_name}/')
    audiobook_sounds.mkdir(parents=True, exist_ok=True)

    audio_files = sorted(os.listdir(file_dir))

    for i,fp in enumerate(audio_files):
        segment = AudioSegment.from_mp3(file_dir+fp)

        file_len = len(segment)
        current_microsecond_count = 0
        len_min = 30
        len_max = 90
        j = 1
        while(current_microsecond_count < file_len):
            #get sample lengths
            sample_len = random.randint(len_min, len_max)
            sample_len_microseconds = sample_len * 1000
            #get upper bound
            next_microsecond_count = current_microsecond_count + sample_len_microseconds
            #get sample segment
            sample_segment = segment[current_microsecond_count: next_microsecond_count]
            # update guard var
            current_microsecond_count = next_microsecond_count
            #save file
            sample_segment_filename = f'{audiobook_name}_chpt_{i}_segment_{j}.mp3'
            write_path = audiobook_sounds / sample_segment_filename
            sample_segment.export(write_path, format="mp3")
            j+=1

chunk_audio_book('audiobook_sound_gen/oscar_wilde__apostle_NY_soc_raw/','oscar_wilde_first_appearence_of_apostle')
chunk_audio_book('audiobook_sound_gen/witchesnewyork_raw/','witches_of_new_york')
