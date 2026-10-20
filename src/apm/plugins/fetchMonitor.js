import { isString, noop } from 'lodash';
import getPluginConfig from '../utils/getPluginConfig';
import getFullUrl from '../utils/getFullUrl';
import getCbHook from '../utils/getCbHook';
import initSubjectInGlobal from '../utils/initSubjectInGlobal';
import setVolTraceContext from '../utils/setVolTraceContext';
import checkIsIgnored from '../utils/checkIsIgnored';
import isRequest from '../utils/isRequest';
import getFetchMethod from '../utils/getFetchMethod';
import isSensitiveHeader from '../utils/isSensitiveHeader';
import resourceSubject from '../subjects/resourceSubject';
import fetchSubject from '../subjects/fetchSubject';

function isHttpURL(url) {
  if (!isString(url)) {
    return false;
  }
  const [protocol, uri] = url.split(':');
  return !uri || 'http' === protocol || 'https' === protocol;
}

function addHeader(key, value, request, requestInit, Request, Headers) {
  if (isRequest(request, Request)) {
    request.headers.set(key, value);
  } else if (requestInit.headers instanceof Headers) {
    requestInit.headers.set(key, value);
  } else {
    requestInit.headers = {
      ...requestInit.headers,
      [key]: value,
    };
  }
}

function applySendOnce(callback) {
  let send = false;
  return (e) => {
    if (!send) {
      send = true;
      callback(e);
    }
  };
}

const UserActionNEventTypes = ['keydown', 'click'];

function httpGetterWithFetchObserver(report, subjects, [observer, getGlobalResourceSubject], config) {
  const { Headers, Request } = window;
  if (Request && Headers) {
    const {
      setTraceHeader,
      ignoreUrls,
      hookCbAtReq,
    } = config;
    subjects.push(observer[0](([request, requestInit]) => {
      const fullUrl = getFullUrl(request instanceof Request ? request.url : request);
      if (!isHttpURL(fullUrl) || checkIsIgnored(ignoreUrls, fullUrl)) {
        return noop;
      }
      if (setTraceHeader) {
        setTraceHeader(fullUrl, (key, value) => addHeader(key, value, request, requestInit, Request, Headers));
      }
      const requestHook = hookCbAtReq(report);
      const time = Date.now();
      let timing = undefined;
      const unsubscribe = getGlobalResourceSubject()[0]((e) => {
        if (fullUrl === e.name && !timing) {
          timing = e;
        }
      });
      const { event } = window;
      const action = event && UserActionNEventTypes.includes(event.type) ? 'user' : 'native';
      return (response) => {
        const headers = response._headers;
        const params = getEventParams(request, requestInit, response, Request, Headers, config, time, headers);
        const send = applySendOnce((e) => {
          e.action = action;
          if (timing) {
            e.response.timing = timing;
          }
          if (requestHook) {
            requestHook({ eventType: 'http', payload: e });
          }
          unsubscribe();
        });
        setTimeout(() => {
          send(params);
        }, 1e3);
      };
    }));
  }
}

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

function getFetchBody(e, t, n) {
  return isRequest(e, n) ? e.body : t?.body;
}

function getEventParams(request, requestInit, response, Request, Headers, config, timestamp, headers) {
  const params = {
    api: 'fetch',
    request: {
      method: getFetchMethod(request, requestInit, Request),
      timestamp,
      url: getFullUrl(request instanceof Request ? request.url : request),
      headers: mergeHeaders(Headers, request.headers, requestInit.headers),
    },
    response: { status: response && response.status || 0, is_custom_error: false, timestamp: Date.now() },
    duration: Date.now() - timestamp,
  };

  const { collectBodyOnError, extraExtractor } = config;
  if (response) {
    try {
      params.response.headers = headers;
      try {
        if (extraExtractor) {
          response.clone().json().then((json) => {
            const extra = extraExtractor(json, params);
            if (extra) {
              params.extra = extra;
              params.response.is_custom_error = true;
            }
          }).catch(noop);
        }
      } catch (e) {
      }
      if (collectBodyOnError && response.status >= 400) {
        params.request.body = getFetchBody(request, requestInit, Request)?.toString();
      }
    } catch (e) {
    }
  } else if (collectBodyOnError) {
    params.request.body = getFetchBody(request, requestInit, Request)?.toString();
  }
  return params;
}

function id(e) {
  return e;
}

const FETCH_MONITOR_PLUGIN_NAME = 'fetch';
const defaultConfig$5 = { autoWrap: true, hookCbAtReq: id, ignoreUrls: [], collectBodyOnError: false };

export default function FetchMonitorVolPlugin(client) {
  client.on('init', () => {
    let pluginConfig = getPluginConfig(client, FETCH_MONITOR_PLUGIN_NAME, defaultConfig$5);
    if (pluginConfig) {
      const subjects = [];
      pluginConfig = {
        ...pluginConfig,
        hookCbAtReq: getCbHook(client),
        setTraceHeader: setVolTraceContext(
          pluginConfig.trace,
          `app_id=${client.config()?.aid},origin=web`,
        ),
      };
      if (pluginConfig.autoWrap) {
        httpGetterWithFetchObserver(
          client.report.bind(client),
          subjects,
          [
            initSubjectInGlobal(client, fetchSubject),
            () => initSubjectInGlobal(client, resourceSubject),
          ],
          pluginConfig,
        );
      }

      client.on('beforeDestroy', () => {
        subjects.forEach((dispose) => dispose());
      });
    }
  });
}
