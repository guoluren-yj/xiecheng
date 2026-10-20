import getGlobalRegistry from './getGlobalRegistry';
import getDefaultBrowser from './getDefaultBrowser';

export default function reportSelfError(...e) {
  const globalRegistry = getGlobalRegistry(getDefaultBrowser());
  if (globalRegistry) {
    if (!globalRegistry.errors) {
      globalRegistry.errors = [];
    }
    globalRegistry.errors.push(e);
  }
}
