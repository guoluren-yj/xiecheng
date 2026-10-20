import { isFunction, noop } from 'lodash';

export default function hookMethodDangerously(target, property, getHookMethod) {
  return (...e) => {
    if (!target) {
      return noop;
    }
    const originHook = target[property];
    let hookMethod = getHookMethod(originHook, ...e);
    let wrappedHookMethod = hookMethod;

    if (isFunction(wrappedHookMethod)) {
      wrappedHookMethod = function (...e) {
        return hookMethod.apply(this, e);
      };
    }
    target[property] = wrappedHookMethod;

    return () => {
      if (wrappedHookMethod === target[property]) {
        target[property] = originHook;
      } else {
        hookMethod = originHook;
      }
    };
  };
}
