import { isObject } from 'lodash';

export default function getDefaultBrowser() {
  if ('object' == typeof window && isObject(window)) {
    return window;
  }
}
