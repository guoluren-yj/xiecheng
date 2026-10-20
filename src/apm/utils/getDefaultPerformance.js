import { isObject } from 'lodash';
import getDefaultBrowser from './getDefaultBrowser';

export default function getDefaultPerformance() {
  if (getDefaultBrowser() && isObject(window.performance)) {
    return window.performance;
  }
}
