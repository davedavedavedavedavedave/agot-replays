define(['src/EventEmitter'],
  (EventEmitter) => 
  class FnPlayer extends EventEmitter {
    // initialize values
    constructor(log) {
      super();
      // make sure log is ordered by offset
      this._log = log.sort((a, b) => {
        if (a.offset > b.offset) {
          return 1;
        } else if (a.offset < b.offset) {
          return -1;
        }
        return 0;
      });
      // initially, playback is stopped at a playtime of 0 seconds
      this._playPosition = 0;
      this._playState = 'stop';
      this._lastAnimationFrame = performance.now();
      this._nextLogStep = 0;
      this._listeners = {};
    }

    // public method to init values and start playback
    play() {
      this._playState = 'play';
      this._lastAnimationFrame = performance.now();
      this._play(this._lastAnimationFrame);
    }
    // private method, handles actual playback
    _play(now) {
      this._playPosition += now - this._lastAnimationFrame;
      this._lastAnimationFrame = now;
      // find steps to execute
      let fns = [];
      for (var i = this._nextLogStep, l = this._log.length; i < l && this._log[i].offset <= this._playPosition; i++) {
        fns.push(this._log[i].do);
      }
      // remember where we left off
      this._nextLogStep = i;

      // wait for all steps to be executed
      let p = fns
        .reduce((prev, cur) => prev.then(cur), Promise.resolve())
        .then(() => {
          // if playstate is still 'play' and we aren't at the end of our log, request the next animation frame
          if (this._playState === 'play' && this._nextLogStep < this._log.length) {
            window.requestAnimationFrame(now => this._play(now));
          } else {
            this._playState = 'pause';
          }
        });
      return p;
    }
    // pause playback
    pause() {
      this._playState = 'pause';
    }
    // lots of getters and setters, to get as close to HTMLMediaElement API as possible (and necessary)
    get currentTime() {
      return this._playPosition / 1000;
    }
    // essentially handles seeking
    set currentTime(seekToInSeconds) {
      // set new position in playback
      let oldPlayPosition = this._playPosition;
      this._playPosition = seekToInSeconds * 1000;

      // if we are jumping backwards, find steps that need to be reverted
      if (oldPlayPosition > this._playPosition) {
        // find steps to execute
        let fns = [];
        for (var i = this._nextLogStep - 1; i >= 0 && this._log[i].offset > this._playPosition; i--) {
          fns.push(this._log[i].undo);
        }
        // remember where we left off
        this._nextLogStep = i + 1;

        // wait for all steps to be executed
        fns
          .reduce((prev, cur) => prev.then(cur), Promise.resolve())
          .then(() => {
            // dispatch seeked event
            this.dispatchEvent({ type: 'seeked', target: this });
          });
      } else {
        // else, if playback isn't running, call _play one time
        if (this.paused) {
          this._play(this._lastAnimationFrame).then(() => {
            // dispatch seeked event
            this.dispatchEvent({ type: 'seeked', target: this });
          });
        }
      }
    }
    get duration() {
      return this._log[this._log.length - 1].offset / 1000;
    }
    get ended() {
      return this.currentTime >= this.duration;
    }
    get paused() {
      return this._playState !== 'play';
    }
    get readyState() {
      // we always HAVE_ENOUGH_DATA
      return 4;
    }
  }
);