import getDefaultBrowser from './getDefaultBrowser';

export default function getDefaultHistory() {
  return getDefaultBrowser() && window.history;
}
