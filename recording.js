import MicroModal from 'micromodal';
import WaveSurfer from 'wavesurfer.js';
import MicrophonePlugin from 'wavesurfer.js/src/plugin/microphone';
import { CognitoIdentityClient } from '@aws-sdk/client-cognito-identity';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { fromCognitoIdentityPool } from '@aws-sdk/credential-provider-cognito-identity';
import mime from 'mime';
import { v4 as uuid } from 'uuid';
import Swal from 'sweetalert2';
import { Howl, Howler } from 'howler';


    const REGION = 'us-east-1';
    const BUCKET = 'hear-before-nyc';
    let streamID;
    let audioURI;
    let audioBlob;
    let type;
// TODO mute all audionodes before recording/showing modal

// for testing
// const downloadAudio = (url) => {
//   const a = document.createElement('a');
//   document.body.appendChild(a);
//   a.style = 'display: none';
//   a.href = url;
//   a.download = 'audio.mp4';
//   a.click();
// };

const setupAudio = (start, play, upload, wave) => {
  play.disabled = true;

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

        mediaRecorder.onstop = () => {
          type = mime.extension(mediaRecorder.mimeType);
          audioBlob = new Blob(chunks);

          chunks = [];
          upload.disabled = false;
          const reader = new FileReader();
          reader.readAsDataURL(audioBlob);
          reader.onloadend = () => {
            audioURI = reader.result;
            wave.load(audioURI);
            document.querySelector('#modal-1 > div > div > footer > textarea').style.display = 'block';
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
  constructor(audioNodes) {
    this.audioNodes = audioNodes;
  }
  onAdd(map) {
    const _this = this;
    const record = document.querySelector('#modal-1 > div > div > footer > button:nth-child(1)');
    const play = document.querySelector('#modal-1 > div > div > footer > button:nth-child(2)');
    const localInput = document.querySelector('#file-input');
    const upload = document.querySelector('#modal-1 > div > div > footer > button:nth-child(3)');
    const textarea = document.querySelector('#modal-1 > div > div > footer > textarea');
    let wavesurfer;
    let lat='';
    let lng='';
    upload.onclick = () => {
      console.log('clicked');
      console.log({ lat, lng, comments: textarea.value });
      uploadFile(audioBlob, `${uuid()}.${type}`, { lat: lat.toString(), lng: lng.toString(), comments: textarea.value });
      wavesurfer.empty();
      upload.disabled = true;
      play.disabled = true;
    };
    const Toast = Swal.mixin({
      toast: true,
      position: 'top-end',
      showConfirmButton: false,
      timer: 1000,
    });

    const s3 = new S3Client({
      region: REGION,
      credentials: fromCognitoIdentityPool({
        client: new CognitoIdentityClient({ region: REGION }),
        identityPoolId: 'us-east-1:e0492f61-36b6-4f08-822d-b122d0947a16', // IDENTITY_POOL_ID
      }),
    });
    const uploadFile = async (blob, name, meta) => {
      const uploadParams = {
        Bucket: BUCKET,
        Key: `uploads/${name}`,
        Body: blob,
        Metadata: meta,
      };

      try {
        await s3.send(new PutObjectCommand(uploadParams));
        console.log('success');
        Toast.fire({
          icon: 'success',
          title: 'File Uploaded!',
        });
      } catch (err) {
        console.log('There was an error uploading file: ', err.message);
      }
    };
    localInput.onchange = (e) => {
      if (localInput.files.length > 0) {
        audioBlob = localInput.files[0];
        type = mime.extension(audioBlob.type);
        const reader = new FileReader();
        reader.readAsDataURL(audioBlob);
        reader.onloadend = () => {
          audioURI = reader.result;
          wavesurfer.load(audioURI);
          play.disabled = false;
          upload.disabled = false;
          document.querySelector('#modal-1 > div > div > footer > textarea').style.display = 'block';
        };
      }
    };

    this._btn = document.createElement('button');
    this._btn.className = 'mapboxgl-ctrl-icon mapboxgl-ctrl-rec';
    this._btn.type = 'button';
    this._btn['aria-label'] = 'Toggle Recording';
    this._btn.onclick = () => {
      if (!_this._btn.classList.contains('recording')) {
        _this._btn.classList.toggle('recording');
        this.audioNodes.forEach(node => node.mute(true));
        // this is super delayed and I'm not sure why
        navigator.geolocation.getCurrentPosition((position) => {
          console.log('recording got position');
          lat = position.coords.latitude;
          lng = position.coords.longitude;
        });
        MicroModal.show('modal-1', {
          onClose: () => {
            _this._btn.classList.toggle('recording');
            wavesurfer.destroy();
            streamID.getTracks().forEach((track) => {
              track.stop();
            });
            upload.disabled = true;
            this.audioNodes.forEach(node => node.mute(false));
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
        setupAudio(record, play, upload, wavesurfer);
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
