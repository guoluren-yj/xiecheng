import { isFunction, isString, noop } from 'lodash';
import getPluginConfig from '../utils/getPluginConfig';
import getFullUrl from '../utils/getFullUrl';
import getCbHook from '../utils/getCbHook';
import initSubjectInGlobal from '../utils/initSubjectInGlobal';
import checkIsIgnored from '../utils/checkIsIgnored';
import isSensitiveHeader from '../utils/isSensitiveHeader';
import setVolTraceContext from '../utils/setVolTraceContext';
import resourceSubject from '../subjects/resourceSubject';
import ajaxSubject from '../subjects/ajaxSubject';

function id(e) {
  return e;
}

const AJAX_MONITOR_PLUGIN_NAME = 'ajax';
const defaultConfig$7 = {
  autoWrap: true,
  hookCbAtReq: id,
  ignoreUrls: [],
  collectBodyOnError: false,
};

function formatRequestHeaders(n) {
  return Object.keys(n).reduce((headers, t) => {
    if (!isSensitiveHeader(t, n[t])) {
      headers[t.toLowerCase()] = n[t];
    }
    return headers;
  }, {});
}

function formatXHRAllResponseHeaders(e) {
  if (isString(e) && e) {
    return e.split('\r\n').reduce((headers, str) => {
      var n;
      if (isString(str)) {
        const [t, n] = str.split(': ');
        if (!isSensitiveHeader(t, n)) {
          headers[t.toLowerCase()] = n;
        }
      }
      return headers;
    }, {});
  }
  return {};
}

function getEventParams$1(e, t) {
  const {
    _method,
    _reqHeaders,
    _url,
    _start,
    _data,
  } = e;
  const params = {
    api: 'xhr',
    request: {
      url: getFullUrl(_url),
      method: (_method || '').toLowerCase(),
      headers: _reqHeaders && formatRequestHeaders(_reqHeaders),
      timestamp: _start,
    },
    response: {
      status: e.status || 0,
      is_custom_error: false,
      timestamp: Date.now(),
    },
    duration: Date.now() - _start,
  };
  if (isFunction(e.getAllResponseHeaders)) {
    params.response.headers = formatXHRAllResponseHeaders(e.getAllResponseHeaders());
  }
  const { status } = params.response;
  const { collectBodyOnError, extraExtractor } = t;
  try {
    const u = extraExtractor && extraExtractor(e.response, params);
    if (u) {
      params.extra = u;
      params.response.is_custom_error = true;
    }
    if (collectBodyOnError && 400 <= status) {
      params.request.body = _data ? `${_data}` : undefined;
      params.response.body = e.response ? `${e.response}` : undefined;
    }
  } catch (e) {
  }
  return params;
}

const UserActionNEventTypes = ['keydown', 'click'];

function httpGetterWithXhrObserver(report, subjects, [observer, getObserver], options) {
  const {
    setTraceHeader,
    ignoreUrls,
    hookCbAtReq,
  } = options;

  subjects.push(observer[0]((args) => {
    const [, e, , n] = args;
    if (checkIsIgnored(ignoreUrls, e)) {
      return noop;
    }
    if (setTraceHeader) {
      setTraceHeader(e, (e, t) => n.setRequestHeader(e, t));
    }
    const request = hookCbAtReq(report);
    const fullUrl = getFullUrl(e);
    let timing = undefined;
    const a = getObserver()[0]((e) => {
      if (fullUrl === e.name && !timing) {
        timing = e;
      }
    });
    const { event } = window;
    const action = event && UserActionNEventTypes.includes(event.type) ? 'user' : 'native';
    return (e) => {
      const params = getEventParams$1(e, options);
      setTimeout(() => {
        params.action = action;
        if (timing) {
          params.response.timing = timing;
        }
        if (request) {
          request({ eventType: 'http', payload: params });
        }
        a();
      }, 100);
    };
  }));
}

export default function AjaxMonitorVolPlugin(clinet) {
  clinet.on('init', () => {
    let pluginConfig = getPluginConfig(clinet, AJAX_MONITOR_PLUGIN_NAME, defaultConfig$7);
    if (pluginConfig) {
      const subjects = [];

      pluginConfig = {
        ...pluginConfig,
        hookCbAtReq: getCbHook(clinet),
        setTraceHeader: setVolTraceContext(
          pluginConfig.trace,
          `app_id=${clinet.config()?.aid},origin=web`,
        ),
      };
      if (pluginConfig.autoWrap) {
        httpGetterWithXhrObserver(
          clinet.report.bind(clinet),
          subjects,
          [
            initSubjectInGlobal(clinet, ajaxSubject),
            () => initSubjectInGlobal(clinet, resourceSubject),
          ],
          pluginConfig,
        );
      }

      clinet.on('beforeDestroy', function () {
        subjects.forEach((dispose) => dispose());
      });
    }
  });
}
