import { isString } from 'lodash';

export default function safeStringify(e) {
  try {
    return isString(e) ? e : JSON.stringify(e);
  } catch (e) {
    return '[FAILED_TO_STRINGIFY]:' + String(e);
  }
}
