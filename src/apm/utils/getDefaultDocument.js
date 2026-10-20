import { isObject } from 'lodash';

export default function getDefaultDocument() {
  if ('object' == typeof document && isObject(document)) {
    return document;
  }
}
