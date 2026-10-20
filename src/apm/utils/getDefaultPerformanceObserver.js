import { isFunction } from 'lodash';
import getDefaultBrowser from './getDefaultBrowser';

export default function getDefaultPerformanceObserver() {
  if (getDefaultBrowser() && isFunction(window.PerformanceObserver)) {
    return window.PerformanceObserver;
  }
}
