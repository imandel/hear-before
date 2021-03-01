import MicroModal from 'micromodal';
import WaveSurfer from 'wavesurfer.js';
import MicrophonePlugin from 'wavesurfer.js/src/plugin/microphone';
import { CognitoIdentityClient } from '@aws-sdk/client-cognito-identity';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { fromCognitoIdentityPool } from '@aws-sdk/credential-provider-cognito-identity';
import { Howl, Howler } from 'howler';

const REGION = 'us-east-1';
const BUCKET = 'hear-before-nyc';
let streamID;

const s3 = new S3Client({
  region: REGION,
  credentials: fromCognitoIdentityPool({
    client: new CognitoIdentityClient({ region: REGION }),
    identityPoolId: 'us-east-1:e0492f61-36b6-4f08-822d-b122d0947a16', // IDENTITY_POOL_ID
  }),
});

const uploadFile = async () => {
  const uploadParams = {
    Bucket: BUCKET,
    Key: 'uploads/test.txt',
    Body: 'this is a test pls',
  };

  try {
    const data = await s3.send(new PutObjectCommand(uploadParams));
    alert('that worked');
  } catch (err) {
    return alert('There was an error uploading file: ', err.message);
  }
};

// TODO mute all audionodes before recording/showing modal

const downloadAudio = (url) => {
  const a = document.createElement('a');
  document.body.appendChild(a);
  a.style = 'display: none';
  a.href = url;
  a.download = 'audio.mp4';
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
        streamID = stream;
        let chunks = [];
        const mediaRecorder = new MediaRecorder(stream);
        start.onclick = () => {
          console.log('clicked');
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

        mediaRecorder.onstart = (e) => console.log('started mr');

        mediaRecorder.onstop = () => {
          console.log('stopped');
          const blob = new Blob(chunks);
          // {
          //   type: 'audio/mp4',
          // });
          chunks = [];
          const url = URL.createObjectURL(blob);

          download.onclick = () => downloadAudio(url);
          download.disabled = false;
          // audio = new Audio(url);
          console.log(url);
          const reader = new FileReader();
          reader.readAsDataURL(blob);
          reader.onloadend = () => {
            const base64data = reader.result;
            audio = new Howl({
              src: [base64data],
            });

            wave.load(base64data);
          };
        };
      })
      .catch((err) => {
        console.log(`The following getUserMedia error occurred: ${err}`);
      });
  } else {
    alert('You may need to update to the latest version of your browser!');
  }
};

class RecordingToggle {
  onAdd(map) {
    const _this = this;
    const record = document.querySelector('#modal-1 > div > div > footer > button:nth-child(1)');
    const play = document.querySelector('#modal-1 > div > div > footer > button:nth-child(2)');
    const localInput = document.querySelector('#file-input');
    const download = document.querySelector('#modal-1 > div > div > footer > button:nth-child(3)');
    let wavesurfer;
    this._btn = document.createElement('button');
    this._btn.className = 'mapboxgl-ctrl-icon mapboxgl-ctrl-rec';
    this._btn.type = 'button';
    this._btn['aria-label'] = 'Toggle Recording';
    MicroModal.init();
    this._btn.onclick = () => {
      // console.log('trying upload');
      // uploadFile();
      if (!_this._btn.classList.contains('recording')) {
        _this._btn.classList.toggle('recording');
        console.log('recording');
        MicroModal.show('modal-1', {
          onClose() {
            _this._btn.classList.toggle('recording');
            wavesurfer.destroy();
            streamID.getTracks().forEach((track) => {
              track.stop();
            });
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
        play.onclick = () => {
            console.log('playing');
            wavesurfer.play();
          };
        setupAudio(record, play, download, wavesurfer);
        localInput.onchange = (e) => {
          if (localInput.files > 0) {
            console.log('selected file')
            const file = localInput.files[0];

            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onloadend = () => {
              const data = reader.result;
              wavesurfer.load(data);
              play.disabled = false;
            };
          }
        };
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
