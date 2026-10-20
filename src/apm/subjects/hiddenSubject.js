import getDefaultBrowser from '../utils/getDefaultBrowser';
import getDefaultDocument from '../utils/getDefaultDocument';
import applyRequestIdleCallback from '../utils/applyRequestIdleCallback';

const HIDDEN_SUBJECT_NAME = 'hidden_0';

function observeHidden(subscribe, unsubscribe) {
  const win = getDefaultBrowser();
  const doc = getDefaultDocument();
  if (win && doc) {
    const handleVisibilityChange = () => {
      if ('hidden' === doc.visibilityState) {
        subscribe();
      }
    };

    addEventListener('visibilitychange', handleVisibilityChange, true);

    const requestIdleCallback = applyRequestIdleCallback(win);

    unsubscribe(
      () => {
        removeEventListener('visibilitychange', handleVisibilityChange, true);
      },
      (e) => {
        if ('hidden' === doc.visibilityState) {
          requestIdleCallback(() => {
            e();
          });
        }
      },
    );
  }
}

const hiddenSubject = [HIDDEN_SUBJECT_NAME, observeHidden];

export default hiddenSubject;
