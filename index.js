import mapboxgl from 'mapbox-gl';
import { point, feature } from '@turf/helpers';
import distance from '@turf/distance';
import { RecordingToggle } from './recording';

const numAudioNodes = 10;
const audioNodes = [];
let gps;
let pos_increment = .00001

for (let i = 0; i < numAudioNodes; i++) {
  const node = new Audio();
  node.volume = 0;
  node.onended = () => { setTimeout(() => { node.play(); }, 2000); };
  audioNodes.push(node);
}

setInterval(() => {
  audioNodes.forEach((node) => {
    if (node.volume!== 0) {
      console.log('src: ', node.src, ', vol:', node.volume);
    }
  });
}, 500);


const audio = new Audio();
audio.src = './benett_test.m4a';
audio.currentTime = 40;
// audio.volume = 0;
window.audio = audio;
const testpoint = point([-73.95630, 40.75617]);

// testing easeinCirc
const scaleAudio = (vol) => 1 - Math.sqrt(1 - vol ** 2);

// dist to audio source
// audioStart is distance you start hearing anything
const dist2volume = (dist, audioStart) => scaleAudio((Math.min(dist, audioStart) - audioStart) / -audioStart);

const steps = [];
const stepmillis = 700;
// A range of steps within 1000 meters each about 2 meters
for (let i = -0.1; i < 0.1; i += 0.002) {
  steps.push(Math.abs(i));
}

// This would be mapped to distances but wanted to test the function of walking by an audio source
// audio.onplay = () => {
//   steps.forEach((step, stepIdx) => {
//     setTimeout(() => {
//       const vol = dist2volume(step, 0.07);
//       console.log('dist: ', step, 'vol: ', vol);
//       audio.volume = vol;
//     }, stepmillis * stepIdx);
//   });
// };

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

const rankAudios = () => {
  const features = map.queryRenderedFeatures({ layers: ['audio-samples'] });
  features.sort((a, b) => {
    const dist1 = distance(point([a.properties.lng, a.properties.lat]), gps);
    const dist2 = distance(point([b.properties.lng, b.properties.lat]), gps);
    return dist1 - dist2;
  });
  return features;
};

geolocate.on('geolocate', (e) => {
  const { latitude, longitude } = e.coords;
  console.log(testpoint);
  gps = point([testpoint.geometry.coordinates[0], testpoint.geometry.coordinates[1]]);
  // gps = point([longitude, latitude]);

  const closeTen = rankAudios().slice(0, 10);
  audioNodes.forEach((node, idx) => {
    // const rankSrc = `./sounds/${closeTen[idx].properties.filename}`
    const rankSrc = `https://hear-before-nyc.s3.amazonaws.com/${closeTen[idx].properties.filename}`
    if(node.src !== rankSrc && node.volume===0){
      node.src = rankSrc;
      node.volume = 0;
      node.oncanplaythrough = () => node.play();
    }
    // audioNodes[idx].src = `./sounds/${soundFeatures.properties.filename}`;
    const dist = distance(gps, point([closeTen[idx].properties.lng, closeTen[idx].properties.lat]));
    node.volume = dist2volume(dist, 0.07);
  });
  console.log(closeTen);
});

map.addControl(geolocate);
map.addControl(new RecordingToggle(), 'top-right');

map.on('load', () => {
  // this was for testing the audio dropoff
  // geolocate._geolocateButton.onclick = () => {
  // audio.src = './benett_test.m4a';
  // audio.currentTime = 40;
  // audio.volume = 0;
  // audio.play();
  // };

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

document.addEventListener('keydown', function(event) {
  
  if(event.keyCode == 65) {
    testpoint.geometry.coordinates[0] -= pos_increment
  }
  else if(event.keyCode == 68) {
    testpoint.geometry.coordinates[0] += pos_increment
  }
  else if(event.keyCode == 87) {
    testpoint.geometry.coordinates[1] += pos_increment
  }
  else if(event.keyCode == 83) {
    testpoint.geometry.coordinates[1] -= pos_increment
  }
  else if(event.keyCode == 189) {
    pos_increment -= 0.00005;
    console.log(pos_increment)
  }
  else if(event.keyCode == 187) {
    pos_increment += 0.00005;
    console.log(pos_increment)
  }
  map.getSource('pointSource').setData(testpoint);
  update_audio();
})

function update_audio() {
  console.log(testpoint);
  gps = point([testpoint.geometry.coordinates[0], testpoint.geometry.coordinates[1]]);
  // gps = point([longitude, latitude]);

  const closeTen = rankAudios().slice(0, 10);
  audioNodes.forEach((node, idx) => {
    // const rankSrc = `./sounds/${closeTen[idx].properties.filename}`
    const rankSrc = `https://hear-before-nyc.s3.amazonaws.com/${closeTen[idx].properties.filename}`
    if(node.src !== rankSrc && node.volume===0){
      node.src = rankSrc;
      node.volume = 0;
      node.oncanplaythrough = () => node.play();
    }
    // audioNodes[idx].src = `./sounds/${soundFeatures.properties.filename}`;
    const dist = distance(gps, point([closeTen[idx].properties.lng, closeTen[idx].properties.lat]));
    node.volume = dist2volume(dist, 0.07);
  });
  console.log(closeTen);
};