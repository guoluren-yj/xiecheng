import { isFunction } from 'lodash';

export default function getDefaultXMLHttpRequest() {
  if ('function' == typeof XMLHttpRequest && isFunction(XMLHttpRequest)) {
    return XMLHttpRequest;
  }
}
