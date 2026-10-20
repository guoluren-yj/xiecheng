import getDefaultBrowser from '../utils/getDefaultBrowser';
import hookMethodDangerously from '../utils/hookMethodDangerously';
import isSensitiveHeader from '../utils/isSensitiveHeader';

const FETCH_SUBJECT_NAME = 'fetch_0';

function mergeHeaders(Headers, ...newHeaders) {
  try {
    return newHeaders.reduce((headers, header) => {
      new Headers(header || {}).forEach((e, t) => {
        if (!isSensitiveHeader(t, e)) {
          headers[t] = e;
        }
      });
      return headers;
    }, {});
  } catch (e) {
    return {};
  }
}

function hookFetch(fetch, o) {
  return (input, init = {}) => {
    const hook = o([input, init]);
    const promise = fetch(input, init);

    promise.then((e) => {
      const headers = mergeHeaders(window.Headers, e.headers);
      e._headers = headers;
      hook(e);
    }, () => {
      hook(undefined);
    });

    return promise;
  };
}

function observeFetch(subscribe, unsubscribe) {
  const win = getDefaultBrowser();
  if (win && fetch) {
    const subjects = [];
    subjects.push(hookMethodDangerously(win, 'fetch', hookFetch)(subscribe));

    unsubscribe(() => {
      subjects.forEach((e) => e());
    });
  }
}

const fetchSubject = [FETCH_SUBJECT_NAME, observeFetch];

export default fetchSubject;
