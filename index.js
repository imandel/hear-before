import mapboxgl from 'mapbox-gl';
import { point } from '@turf/helpers';
import distance from '@turf/distance';
import { RecordingToggle } from './recording';
import {Howl, Howler} from 'howler';


// prototype to update the SRC for the audio in a howl
Howl.prototype.changeSrc = function (newSrc) {
  let self = this;
  self.unload();
  self._src = newSrc;
  self.load();
}

const numAudioNodes = 10;
const audioNodes = [];
let gps;

// maybe we don't need this anymore
for (let i = 0; i < numAudioNodes; i++) {
  const node = new Howl({
    src: ['https://hear-before-nyc.s3.amazonaws.com/sounds/1sSilent.mp3'],
    autoplay: true,
    loop: false,
    volume: 0,
  }
  );
  audioNodes.push(node);
}

console.log('version 1.2 attempt to switch to howler')

// const audio = new Audio();
// audio.src = './benett_test.m4a';
// audio.currentTime = 40;
// // audio.volume = 0;
// window.audio = audio;
const testpoint = point([-73.95630, 40.75617]);
let pos_increment = 0.00001;

// testing easeinCirc
const scaleAudio = (vol) => 1.0 - (1 - vol ** 2)**0.5;

// dist to audio source
// audioStart is distance you start hearing anything
const dist2volume = (dist, audioStart) => scaleAudio((Math.min(dist, audioStart) - audioStart) / -audioStart);

const steps = [];
const stepmillis = 700;
// A range of steps within 1000 meters each about 2 meters
for (let i = -0.1; i < 0.1; i += 0.002) {
  steps.push(Math.abs(i));
}

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

const rankAudios = (pt) => {
  const features = map.queryRenderedFeatures({ layers: ['audio-samples'] });

  features.sort((a, b) => {
    const dist1 = distance(point([a.properties.lng, a.properties.lat]), pt);
    const dist2 = distance(point([b.properties.lng, b.properties.lat]), pt);
    return dist1 - dist2;
  });
  return features;
};

let update_audio = (pt) => {
  const closeTen = rankAudios(pt).slice(0, 10);

  // for making the closest node slightly louder
  let closest_node = null;
  let closeset_distance = null;

  audioNodes.forEach((node, idx) => {

    const rankSrc = `https://hear-before-nyc.s3.amazonaws.com/${closeTen[idx].properties.filename}`

    if(node._src !== rankSrc && node._volume===0){

        // get distance for volumen adjustments 
        const dist = distance(pt, point([closeTen[idx].properties.lng, closeTen[idx].properties.lat]));

        // define the new howl
        node = new Howl({
          src: [rankSrc],
          autoplay: true,
          loop: false,
          volume: dist2volume(dist, 0.07),
          onend: function() {
            setTimeout(() => { node.play(); }, 2000); 
          }
        });

        // update the closest node pointer w closest distance
        if (closest_node === null || dist < closeset_distance) {
          closeset_distance = dist;
          closest_node = node;
        }

        // update audioNodes to use the new howl obj
        audioNodes[idx] = node;
    }
    
    if (closest_node != null){
      closest_node.volume(dist2volume(closeset_distance, 0.07) + 0.1); // bump the closest node to be a bit louder
    }
  });
}

geolocate.on('geolocate', (e) => {
  const { latitude, longitude } = e.coords;
  gps = point([longitude, latitude]);
  update_audio(gps)
});

map.addControl(geolocate);
map.addControl(new RecordingToggle(), 'top-right');

map.on('load', () => {
  
  // this was for testing the audio dropoff
  geolocate._geolocateButton.onclick = () => {
    audioNodes.forEach((audio) => audio.play());
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

// add WASD functionality
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
  
  const latitude = testpoint.geometry.coordinates[0];
  const longitude = testpoint.geometry.coordinates[1];

  let pt = point([longitude, latitude]);
  map.getSource('pointSource').setData(testpoint);
  update_audio(pt);
})
