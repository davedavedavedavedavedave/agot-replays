define(['src/utils'],
  (utils) => 
  class Controls {
    constructor(c, media, labels) {
      this._c = c;
      this._c.setAttribute('data-playState', 'pause');
      this._media = media;
      this._els = {
        playStateButton: document.createElement('div'),
        progress: document.createElement('input'),
        toggleVolumeControls: document.createElement('div'),
        volumes: document.createElement('div')
      }
      // setup controls
      this._els.playStateButton.className = 'playState';
      this._els.playStateButton.addEventListener('click', e => {
        if (this._c.getAttribute('data-playState') === 'pause') {
          this._media[0].play();
        } else {
          this._media[0].pause();
        }
      });
      this._media[0].addEventListener('pause', () => this._c.setAttribute('data-playState', 'pause'));
      this._media[0].addEventListener('playing', () => this._c.setAttribute('data-playState', 'play'));

      this._els.progress.className = 'progress';
      this._els.progress.type = 'range';
      this._els.progress.min = 0;
      this._els.progress.max = 1;
      this._els.progress.value = 0;
      this._els.progress.step = 'any';
      this._els.progress.addEventListener('change', e => this._media[0].currentTime = this._media[0].duration * e.target.value);
      this._media[0].addEventListener('timeupdate', () => this._els.progress.value = (1 / this._media[0].duration * this._media[0].currentTime) || 0);

      this._els.toggleVolumeControls.className = 'toggleVolumeControls';
      this._els.toggleVolumeControls.addEventListener('click', () => utils.toggleClass(this._c, 'hideVolumeControls'));
      this._els.volumes.className = 'volumes';
      for (let i = 0; i < this._media.length; i++) {
        let volumeLabel = document.createElement('label');
        volumeLabel.innerHTML = labels[i];

        let volumeControl = document.createElement('input');
        volumeControl.type = 'range';
        volumeControl.min = 0;
        volumeControl.max = 1;
        volumeControl.value = this._media[i].volume || 0;
        volumeControl.step = 'any';
        volumeControl.addEventListener('change', e => this._media[i].volume = e.target.value);
        this._media[i].addEventListener('volumechange', () => volumeControl.value = this._media[i].volume);

        volumeLabel.appendChild(volumeControl);
        this._els.volumes.appendChild(volumeLabel);
      }

      // append elements to container
      this._c.appendChild(this._els.playStateButton);
      this._c.appendChild(this._els.progress);
      this._c.appendChild(this._els.toggleVolumeControls);
      this._c.appendChild(this._els.volumes);
    }
  }
);