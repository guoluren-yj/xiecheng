/* eslint-disable */
const observeEvent: any = {
  breakOff: false,
  clientList: [],
  listen: function (key, fn) {
    if (!this.clientList[key]) {
      this.clientList[key] = [];
    }
    this.clientList[key].push(fn);
  },
  trigger: function () {
    return new Promise((re) => {
      var key = Array.prototype.shift.call(arguments);
      var cb = Array.prototype.shift.call(arguments);
      var fns = this.clientList[key];
      if (!fns || fns.length === 0) {
        console.log('file: util.ts ~ line 16 ~ arguments', arguments);
        return false;
      }
      const promiseArray = [] as any;
      for (var i = 0; i < fns.length; i++) {
        const fn = fns[i];
        promiseArray.push(
          new Promise((resolve, reject) => {
            fn.apply(this, [resolve, reject]);
          })
        );
      }
      return Promise.all(promiseArray)
        .then((val) => {
          if (cb) {
            cb();
          }
          re('success');
        })
        .catch((e) => {
          // 执行回调
          re('err');
        });
    });
  },
  remove: function (key, fn) {
    if (!this.clientList[key]) {
      return false;
    }
    if (!fn) {
      this.clientList[key] && (this.clientList[key] = []);
    } else {
      for (var l = this.clientList[key].length - 1; l >= 0; l--) {
        var _fn = this.clientList[key][l];
        if (_fn === fn) {
          this.clientList[key].splice(l, 1); // 删除订阅者的回调函数
        }
      }
    }
  },
};

const installEvent = function (obj) {
  for (const i in observeEvent) {
    obj[i] = observeEvent[i];
  }
};

export { observeEvent, installEvent };
