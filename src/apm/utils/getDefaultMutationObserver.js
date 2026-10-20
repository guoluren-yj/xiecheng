import { isFunction } from 'lodash';
import getDefaultBrowser from './getDefaultBrowser';

export default function getDefaultMutationObserver() {
  if (getDefaultBrowser() && isFunction(window.MutationObserver)) {
    return window.MutationObserver;
  }
}
