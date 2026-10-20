const Interval = {
  delay: 60 * 1000,

  timer: null,

  callback: [],

  add(func) {
    if (!this.callback.includes(func)) {
      this.callback.push(func);
    }
    return this;
  },

  delete(func) {
    const index = this.callback.findIndex((_func) => _func === func);
    if (index !== -1) {
      this.callback.splice(index, 1);
    }
    return this;
  },

  start() {
    this.destory();
    this.timer = setInterval(() => {
      this.callback.forEach((func) => func());
    }, this.delay);
    return this;
  },

  destory() {
    clearInterval(this.timer);
    return this;
  },
};

export default Interval;
