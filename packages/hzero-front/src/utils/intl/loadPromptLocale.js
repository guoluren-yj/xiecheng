import { queryPromptLocale } from 'services/api';
import intl from '.';
import { queryPublicPromptLocale } from '../../services/api';

const cache = window.intlCache || (window.intlCache = new Map());

export default function loadPromptLocale(orgId, language, promptKey, needReturn) {
  let currentCacheLang;
  if (cache.has(language)) {
    currentCacheLang = cache.get(language);
  } else {
    currentCacheLang = new Map();
    cache.set(language, currentCacheLang);
  }
  let { fetchingCodes } = currentCacheLang;
  if (!fetchingCodes) {
    fetchingCodes = new Map();
    currentCacheLang.fetchingCodes = fetchingCodes;
  }
  if (currentCacheLang.has(promptKey)) {
    return Promise.resolve(currentCacheLang.get(promptKey));
  }
  fetchingCodes.set(promptKey, needReturn);
  let { fetchingPromise } = currentCacheLang;
  if (!fetchingPromise) {
    fetchingPromise = Promise.resolve().then(() => {
      currentCacheLang.fetchingPromise = undefined;
      const codes = [...fetchingCodes.keys()];
      const promise = orgId
        ? queryPromptLocale(orgId, language, codes.join(','))
        : queryPublicPromptLocale(language, codes.join(','));
      codes.forEach((code) => {
        const needReturn$ = fetchingCodes.get(code);
        currentCacheLang.set(
          code,
          promise
            .then((data) => {
              if (data) {
                const l = needReturn$ ? Object.entries(data).reduce((obj, [k, v]) => {
                  if (k.startsWith(code)) {
                    obj[k] = v;
                  }
                  return obj;
                }, {}) : {};
                currentCacheLang.set(code, l);
                return l;
              }
              currentCacheLang.delete(code);
            }),
        );
      });
      fetchingCodes.clear();

      return promise.then((data) => {
        if (data) {
          intl.load({
            [language]: data,
          });
        }
      });
    });
    currentCacheLang.fetchingPromise = fetchingPromise;
  }
  return fetchingPromise.then(() => {
    return currentCacheLang.get(promptKey);
  });
}
