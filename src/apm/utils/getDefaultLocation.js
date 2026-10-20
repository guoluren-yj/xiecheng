import getDefaultBrowser from './getDefaultBrowser';

export default function getDefaultLocation() {
  return getDefaultBrowser() && window.location;
}
