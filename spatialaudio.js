class SpatialAudioToggle {


  constructor(callback){
    this._callback =callback;
    this.SAOn=true;
  }
  onAdd(map) {

    this._map = map;
    this._btn = document.createElement('button');
    this._btn.className = 'mapboxgl-ctrl-icon mapboxgl-sa-on';
    this._btn.type = 'button';
    this._btn['aria-label'] = 'Toggle Spatial Audio';

    this._btn.onclick = () => {
      this.SAOn= !this.SAOn;
      this._callback(this.SAOn);
      this._btn.classList.toggle('mapboxgl-sa-off');
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
  SpatialAudioToggle,
};
