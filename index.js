import mapboxgl from 'mapbox-gl';
import { point } from '@turf/helpers';
import distance from '@turf/distance';
import { RecordingToggle } from './recording.js';

const audio = new Audio();
const testpoint = point([-73.95630, 40.75617]);

// testing easeinCirc
const scaleAudio = (vol) => 1 - Math.sqrt(1 - vol ** 2);

// dist to audio source
// audioStart is distance you start hearing anything
// eslint-disable-next-line max-len
const dist2volume = (dist, audioStart) => scaleAudio((Math.min(dist, audioStart) - audioStart) / -audioStart);

const steps = [];
const stepmillis = 700;
// A range of steps within 1000 meters each about 2 meters
for (let i = -0.1; i < 0.1; i += 0.002) {
  steps.push(Math.abs(i));
}

// This would be mapped to distances but wanted to test the function of walking by an audio source

audio.onplay = () => {
  steps.forEach((step, stepIdx) => {
    setTimeout(() => {
      const vol = dist2volume(step, 0.07);
      console.log('dist: ', step, 'vol: ', vol);
      audio.volume = vol;
    }, stepmillis * stepIdx);
  });
};

mapboxgl.accessToken = 'pk.eyJ1IjoiaW1hbmRlbCIsImEiOiJjankxdjU4ODMwYTViM21teGFpenpsbmd1In0.IN9K9rp8-I5pTbYTmwRJ4Q';
const map = new mapboxgl.Map({
  container: 'map',
  style: 'mapbox://styles/imandel/ckl2jd7kg1hvc17rxxxiwtk97',
  center: [-73.946382, 40.724478],
  zoom: 12,
});

const geolocate = new mapboxgl.GeolocateControl({
  positionOptions: {
    enableHighAccuracy: true,
  },
  trackUserLocation: true,
  compact: true,
});

geolocate.on('geolocate', () => {
  // eslint-disable-next-line no-underscore-dangle
  const { latitude, longitude } = geolocate._lastKnownPosition.coords;

  console.log(distance(point([longitude, latitude]), testpoint));
});

map.addControl(geolocate);
map.addControl(new RecordingToggle(), "top-right");

map.on('load', () => {
  // eslint-disable-next-line no-underscore-dangle
  geolocate._geolocateButton.onclick = () => {
    audio.src = './benett_test.m4a';
    audio.currentTime = 40;
    audio.volume = 0;
    audio.play();
  };

  map.addSource('pointSource', {
    type: 'geojson',
    data: testpoint,
  });

  map.addLayer({
    id: 'testPoint',
    type: 'circle',
    source: 'pointSource',
    paint: {
      'circle-radius': 7,
      'circle-opacity': 1,
      'circle-color': '#333',
    },
  });
});
