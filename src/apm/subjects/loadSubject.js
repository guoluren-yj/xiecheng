import getDefaultBrowser from '../utils/getDefaultBrowser';
import getDefaultDocument from '../utils/getDefaultDocument';
import applyRequestIdleCallback from '../utils/applyRequestIdleCallback';

const LOAD_SUBJECT_NAME = 'load_0';

function observeLoad(subscribe, unsubscribe) {
  const win = getDefaultBrowser();
  const doc = getDefaultDocument();
  if (win && doc) {
    const handleLoad = function () {
      setTimeout(function () {
        subscribe();
      }, 0);
    };
    win.addEventListener('load', handleLoad, false);

    const requestIdleCallback = applyRequestIdleCallback(win);

    unsubscribe(
      () => {
        win.removeEventListener('load', handleLoad, false);
      },
      (e) => {
        if ('complete' === doc.readyState) {
          requestIdleCallback(() => {
            e();
          });
        }
      },
    );
  }
}

const loadSubject = [LOAD_SUBJECT_NAME, observeLoad];

export default loadSubject;
