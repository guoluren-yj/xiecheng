import { isObject } from 'lodash';

export default function getConfig(e, t) {
  return isObject(e) ? {
    ...t,
    ...e,
  } : !!e && t;
}
