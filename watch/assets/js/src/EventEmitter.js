// comments omitted intentionally
define(() => 
  class EventEmitter {
    constructor() {
      this._listeners = {};
    }
    addEventListener(type, cb) {
      if (!(type in this._listeners)) {
        this._listeners[type] = [];
      }
      this._listeners[type].push(cb);
    }
    removeEventListener(type, cb) {
      if (!(type in this._listeners)) {
        return;
      }
      let stack = this._listeners[type];
      for (let i = 0, l = stack.length; i < l; i++) {
        if (stack[i] === cb){
          stack.splice(i, 1);
          return;
        }
      }
    }
    dispatchEvent(event) {
      if (!(event.type in this._listeners)) {
        return true;
      }
      let stack = this._listeners[event.type];

      for (let i = 0, l = stack.length; i < l; i++) {
        stack[i].call(this, event);
      }
      return !event.defaultPrevented;
    }
  }
);
