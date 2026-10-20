import getDefaultBrowser from '../utils/getDefaultBrowser';
import invokeCallbackOnce from '../utils/invokeCallbackOnce';

const UNLOAD_SUBJECT_NAME = 'unload_0';
const EVENTS = ['unload', 'beforeunload', 'pagehide'];

function observeUnload(subscribe, unsubscribe) {
  var r, win = getDefaultBrowser();
  if (win) {
    const [subscribeOnce] = invokeCallbackOnce(subscribe);
    const subscribeOnceHandle = () => subscribeOnce();

    EVENTS.forEach((eventName) => {
      win.addEventListener(eventName, subscribeOnceHandle);
    });

    unsubscribe(() => {
      EVENTS.forEach((eventName) => {
        win.removeEventListener(eventName, subscribeOnceHandle);
      });
    });
  }
}

const unloadSubject = [UNLOAD_SUBJECT_NAME, observeUnload];

export default unloadSubject;
