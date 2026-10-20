import { isFunction, noop } from 'lodash';

export default function hookObjectProperty(i, a, u, c = true) {
  return (...e) => {
    if (!i) {
      return noop;
    }
    const n = i[a];
    let r = u(n, ...e);
    let o = r;
    if (isFunction(o) && c) {
      o = function (...t) {
        try {
          return r.apply(this, t);
        } catch (e) {
          return isFunction(n) && n.apply(this, t);
        }
      };
    }
    i[a] = o;

    return (e) => {
      if (!e) {
        if (o === i[a]) {
          i[a] = n;
        } else {
          r = n;
        }
      }
    };
  };
}
