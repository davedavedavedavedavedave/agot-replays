define(['src/FnPlayer'],
  (FnPlayer) => 
  class MediaSyncer {
    constructor(cfg) {
      this._media = cfg.media;
      this._tolerance = cfg.tolerance;
      this._media[0].addEventListener('timeupdate', () => this._timeupdate())
      this._media[0].addEventListener('playing', () => this.getSlaveMedia().forEach(item => item.play()));
      this._media[0].addEventListener('pause', () => this._media.forEach(item => item.pause()));
      this._media.forEach((item, idx) => {
        if (idx > 0) {
          item.addEventListener('volumechange', () => {
            if (!this._media[0].paused) {
              if (item.volume === 0 && !item.paused) {
                item.pause();
              } else if (item.paused) {
                item.play();
              }
            }
          })
        }
      })
    }
    _timeupdate() {
      let currentTime = this._media[0].currentTime;
      let min = currentTime - this._tolerance;
      let max = currentTime + this._tolerance;
      this.getSlaveMedia().forEach(item => {
        if (item.duration > currentTime && (item.currentTime < min || item.currentTime > max)) {
          item.currentTime = this._media[0].currentTime;
        }
      });
    }
    getSlaveMedia() {
      return this._media.filter((item, idx) => idx > 0 && (item.volume > 0 || item instanceof FnPlayer));
    }
  }
);