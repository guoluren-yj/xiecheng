import getDefaultBrowser from './getDefaultBrowser';
import getDefaultLocation from './getDefaultLocation';


export default function getLocationUrl() {
  return (getDefaultBrowser() && getDefaultLocation())?.href;
}
