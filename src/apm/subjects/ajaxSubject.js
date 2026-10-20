import hookMethodDangerously from '../utils/hookMethodDangerously';

const XHR_SUBJECT_NAME = 'xhr_0';

function hookOpen(ajax) {
  return function (...args) {
    const [_method, _url] = args;
    this._method = _method;
    this._url = _url;

    return ajax.apply(this, args);
  };
}

function hookSetHeader(ajax) {
  return function (...args) {
    this._reqHeaders = this._reqHeaders || {};
    const [r, n] = args;
    this._reqHeaders[r] = n;
    return ajax && ajax.apply(this, args);
  };
}

function hookOnreadystatechange(r, o) {
  return hookMethodDangerously(r, 'onreadystatechange', (n) => {
    return function (...e) {
      if (4 === this.readyState) {
        o(r);
      }
      return n && n.apply(this, e);
    };
  });
}

function hookSend(r, o) {
  return function (...e) {
    this._start = Date.now();
    this._data = e ? e[0] : undefined;
    const n = o([this._method, this._url, this._start, this]);
    hookOnreadystatechange(this, n)();
    return r.apply(this, e);
  };
}

function applyXHR(ajax) {
  return (subscribe, unsubscribe) => {
    if (ajax) {
      const n = [];
      n.push(hookMethodDangerously(ajax, 'open', hookOpen)());
      n.push(hookMethodDangerously(ajax, 'setRequestHeader', hookSetHeader)());
      n.push(hookMethodDangerously(ajax, 'send', hookSend)(subscribe));
      unsubscribe(() => {
        n.forEach((e) => e());
      });
    }
  };
}

const ajaxSubject = [XHR_SUBJECT_NAME, applyXHR(XMLHttpRequest && XMLHttpRequest.prototype)];

export default ajaxSubject;
