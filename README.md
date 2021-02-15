# Hear, Before

## Installation

clone the repo
run `npm install`

run `npm run dev` the site should be available on localhost:5000


For synethetic geom data, navigate to the directory and run `python generate_synthetic_sounds.py` and it will populate the `generated_audio`directory with mp3 files of latitudes and longitudes being spoken aloud with some lorem ipsum tacked onto the end to lengthen the recordings. The filenames are hashes of the latlong coordinates. The python script also saves a dictionary as a pickle file with the mapping from filename -> latlong coords.

ofc to `pip install -r requirements.txt` too.
### TODO
* How do we want to deal with multiple audio files in a location? play all at once? play closest until completion?

* 