import MicroModal from 'micromodal';
import WaveSurfer from 'wavesurfer.js';
import MicrophonePlugin from 'wavesurfer.js/src/plugin/microphone';

// TODO add ability to upload an audio file;
// TODO mute all audionodes before recording/showing modal


const downloadAudio = (url) => {
  const a = document.createElement('a');
  document.body.appendChild(a);
  a.style = 'display: none';
  a.href = url;
  a.download = 'audio.ogg';
  a.click();
};

const setupAudio = (start, play, download, wave) => {
  play.disabled = true;
  download.disabled = true;
  let audio;

  if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
    console.log('getUserMedia supported.');
    navigator.mediaDevices.getUserMedia({ audio: true })
      .then((stream) => {
        let chunks = [];
        const mediaRecorder = new MediaRecorder(stream);
        start.onclick = () => {
          if (start.classList.contains('clicked')) {
            console.log('stop recording');
            mediaRecorder.stop();
            start.classList.remove('clicked');
            wave.microphone.stop();
            start.innerText = 'Record Again';
            start.classList.remove('clicked');
            play.disabled = false;
          } else {
            console.log('begin recording');
            mediaRecorder.start();
            start.classList.add('clicked');
            start.innerText = 'Stop Recording';
            play.disabled = true;
            wave.microphone.start();
          }
        };

        mediaRecorder.ondataavailable = (e) => {
          chunks.push(e.data);
        };

        mediaRecorder.onstop = () => {
          const blob = new Blob(chunks, { type: 'audio/ogg; codecs=opus' });
          chunks = [];
          const url = URL.createObjectURL(blob);
          download.onclick = () => downloadAudio(url);
          download.disabled = false;
          audio = new Audio(url);
          wave.load(audio);
          play.onclick = () => {
            wave.play();
          };
        };
      })
      .catch((err) => {
        console.log(`The following getUserMedia error occurred: ${err}`);
      });
  } else {
    console.log('getUserMedia not supported on your browser!');
  }
};

class RecordingToggle {
  onAdd(map) {
    const _this = this;
    const record = document.querySelector('#modal-1 > div > div > footer > button:nth-child(1)');
    const play = document.querySelector('#modal-1 > div > div > footer > button:nth-child(2)');
    const download = document.querySelector('#modal-1 > div > div > footer > button:nth-child(3)');
    let wavesurfer;
    this._btn = document.createElement('button');
    this._btn.className = 'mapboxgl-ctrl-icon mapboxgl-ctrl-rec';
    this._btn.type = 'button';
    this._btn['aria-label'] = 'Toggle Recording';
    MicroModal.init();
    this._btn.onclick = () => {
      if (!_this._btn.classList.contains('recording')) {
        _this._btn.classList.toggle('recording');
        console.log('recording');
        MicroModal.show('modal-1', {
          onClose() {
            _this._btn.classList.toggle('recording');
            wavesurfer.destroy();
          },
        });
        wavesurfer = WaveSurfer.create({
          container: '#waveform',
          waveColor: '#bd6868',
          progressColor: '#8f4c4c',
          barWidth: 3,
          barRadius: 3,
          barGap: 3,
          interact: false,
          cursorWidth: 0,
          plugins: [
            MicrophonePlugin.create(),
          ],
        });
        setupAudio(record, play, download, wavesurfer);
        // record.onclick = () => wavesurfer.microphone.start();
        // stop.onclick = () => wavesurfer.microphone.stop();
      } else {
        MicroModal.close('modal-1');
      }
    };

    this._container = document.createElement('div');
    this._container.className = 'mapboxgl-ctrl-group mapboxgl-ctrl';
    this._container.appendChild(this._btn);

    return this._container;
  }

  onRemove() {
    this._container.parentNode.removeChild(this._container);
    this._map = undefined;
  }
}

export {
  RecordingToggle,
};
