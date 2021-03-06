import MicroModal from 'micromodal';
import WaveSurfer from 'wavesurfer.js';
// import MicrophonePlugin from './wavemic';
import MicrophonePlugin from 'wavesurfer.js/src/plugin/microphone';
import { CognitoIdentityClient } from '@aws-sdk/client-cognito-identity';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { fromCognitoIdentityPool } from '@aws-sdk/credential-provider-cognito-identity';
import mime from 'mime';
import Swal from 'sweetalert2';
import { RecorderService } from './RecorderService';

class RecordingToggle {
  constructor(audioNodes) {
    this.audioNodes = audioNodes;
    this.isOpen = false;
    this.isRecording = false;
    this.lat = '';
    this.lng = '';
    this.REGION = 'us-east-1';
    this.BUCKET = 'hear-before-nyc';
    this.em = document.createDocumentFragment();
    this.s3 = new S3Client({
      region: this.REGION,
      credentials: fromCognitoIdentityPool({
        client: new CognitoIdentityClient({ region: this.REGION }),
        identityPoolId: 'us-east-1:e0492f61-36b6-4f08-822d-b122d0947a16', // IDENTITY_POOL_ID
      }),
    });
    this.wavesurfer = WaveSurfer.create({
      container: '#waveform',
      waveColor: '#bd6868',
      progressColor: '#8f4c4c',
      barWidth: 3,
      barRadius: 3,
      barGap: 3,
      interact: false,
      cursorWidth: 0,
      plugins: [
        // MicrophonePlugin.create(),
      ],
    });
  }

  download() {
    const link = document.createElement('a');
    link.href = this.blobUrl;
    link.download = name;
    document.body.appendChild(link);
    link.dispatchEvent(
      new MouseEvent('click', {
        bubbles: true,
        cancelable: true,
        view: window,
      }),
    );
    document.body.removeChild(link);
  }

  async uploadFile(blob, meta) {
    const file = new File([blob], new Date().valueOf(), { type: this.mime });
    const Toast = Swal.mixin({
      toast: true,
      position: 'top-end',
      showConfirmButton: false,
      timer: 1000,
    });

    const uploadParams = {
      Bucket: this.BUCKET,
      Key: `uploads/${file.name}.${this.ext}`,
      Body: blob,
      Metadata: meta,
    };

    try {
      await this.s3.send(new PutObjectCommand(uploadParams));
      console.log('success');
      Toast.fire({
        icon: 'success',
        title: 'File Uploaded!',
      });
      this.wavesurfer.empty();
      this.play.disabled = true;
      this.upload.disabled = true;
      this.textarea.style.display = 'none';
      this.textarea.value = '';
    } catch (err) {
      console.log('There was an error uploading file: ', err.message);
      Toast.fire({
        icon: 'error',
        title: 'Error Uploading',
      });
    }
  }

  _recordingComplete(e) {
    console.log('recording complete');
    this.play.disabled = false;
    this.upload.disabled = false;
    this.ext = mime.extension(e.detail.recording.mimeType);
    this.mime = e.detail.recording.mimeType;
    this.blobUrl = e.detail.recording.blobUrl;
    this.blobFile = e.detail.recording.blobFile;
    this.wavesurfer.load(this.blobUrl);
    this.textarea.style.display = 'block';
  }

  _startRecording() {
    if (!this.recorderSrvc) {
      this.recorderSrvc = new RecorderService();
      this.recorderSrvc.em.addEventListener('recording', (e) => {
        this._recordingComplete(e);
      });
    }
    this.recorderSrvc.startRecording();
    this.isRecording = true;
    this.record.classList.add('clicked');
    this.record.innerText = 'Stop Recording';
    this.play.disabled = true;
    // this.wavesurfer.microphone.start();
  }

  _stopRecording() {
    if (this.recorderSrvc && this.isRecording) {
      this.recorderSrvc.stopRecording();
      this.isRecording = false;
      this.record.classList.remove('clicked');
      // this.wavesurfer.microphone.stop();
      this.record.innerText = 'Record';
    }
  }

  onAdd(map) {
    const _this = this;
    this._btn = document.createElement('button');
    this._btn.className = 'mapboxgl-ctrl-icon mapboxgl-ctrl-rec';
    this._btn.type = 'button';
    this._btn['aria-label'] = 'Toggle Recording';

    this.record = document.getElementById('record');
    this.play = document.getElementById('play');
    this.localInput = document.getElementById('file');
    this.upload = document.getElementById('upload');
    this.textarea = document.getElementById('textarea');
    this.record.onclick = () => {
      if (!this.isRecording) {
        console.log('start');

        this._startRecording();
      } else {
        console.log('stop');
        this._stopRecording();
      }
    };

    this.play.onclick = () => {
      this.wavesurfer.play();
      this.play.classList.add('clicked');
      this.wavesurfer.on('finish', () => this.play.classList.remove('clicked'));
    };

    this.localInput.onchange = (e) => {
      if (this.localInput.files.length > 0) {
        const file = this.localInput.files[0];
        this.type = mime.extension(file.type);
        console.log(this.type);
        const reader = new FileReader();
        reader.onloadend = () => {
          const data = reader.result;
          this.wavesurfer.load(data);
          this.play.disabled = false;
          this.upload.disabled = false;
          document.querySelector('#modal-1 > div > div > footer > textarea').style.display = 'block';
        };
        reader.readAsDataURL(file);
      }
    };

    this.upload.onclick = () => {
      this.uploadFile(this.blobFile, { lat: this.lat, lng: this.lng, comments: this.textarea.value });
    };

    this._btn.onclick = () => {
      if (!_this.isOpen) {
        _this.isOpen = true;
        _this._btn.classList.add('recording');
        document.querySelector('#fake-close').click();
        this.em.dispatchEvent(new Event('opened'));
        MicroModal.show('modal-1', {
          onClose: () => {
            _this._btn.classList.remove('recording');
            _this.isOpen = false;
            this.em.dispatchEvent(new Event('closed'));
          },
        });
        navigator.geolocation.getCurrentPosition((position) => {
          console.log('recording got position');
          _this.lat = position.coords.latitude.toString();
          _this.lng = position.coords.longitude.toString();
        });
      } else {
        this.isOpen = false;
        _this._btn.classList.remove('recording');
        MicroModal.close('modal-1');
        _this.em.dispatchEvent(new Event('closed'));
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
