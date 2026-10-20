import { isFunction, isString } from 'lodash';
import getDefaultBrowser from '../utils/getDefaultBrowser';
import getPluginConfig from '../utils/getPluginConfig';
import getDefaultPerformance from '../utils/getDefaultPerformance';
import getRegexp from '../utils/getRegexp';
import getFullUrl from '../utils/getFullUrl';
import initSubjectInGlobal from '../utils/initSubjectInGlobal';
import htmlTreeAsString from '../utils/htmlTreeAsString';
import applyPerformance from '../utils/applyPerformance';
import errorSubject from '../subjects/errorSubject';

const UNKNOWN_PATH = '<unknown>';

function isHTMLLinkElement(e) {
  return 'link' === e.tagName.toLowerCase();
}

function getElementAttr(e, t) {
  return isFunction(e.getAttribute) ? e.getAttribute(t) || '' : e[t] || '';
}

function getSrc(e) {
  return getElementAttr(e, isHTMLLinkElement(e) ? 'href' : 'src');
}

function getDataFromEvent(event) {
  const element = event.target || event.srcElement;
  if (element) {
    const { tagName } = element;
    if (tagName && isString(tagName)) {
      const src = getSrc(element);
      return { url: src, tagName: tagName, xpath: src ? undefined : htmlTreeAsString(element) };
    }
  }
}

function buildPayload(resource, getTiming) {
  const {
    url,
    tagName,
    xpath,
  } = resource;
  const fullUrl = getFullUrl(url);
  const timing = getTiming(fullUrl)[0];
  return { type: tagName.toLowerCase(), url: fullUrl, xpath, timing };
}

const RESOURCE_ERROR_EV_TYPE = 'resource_error';

function resourceErrorGetterWithContext(report, subjects, [globalErrorSubject], config) {
  const win = getDefaultBrowser();
  if (win) {
    function reportResourceError(e) {
      const href = location && location.href;
      if (
        href && e.url === href
        || includeRegexp && !includeRegexp.test(e.url)
        || ignoreRegexp && ignoreRegexp.test(e.url)
        || (e.url || e.xpath && e.xpath !== UNKNOWN_PATH)
      ) {
        if (!(dedupe && e.url === lastUrl)) {
          lastUrl = e.url;
          const payload = buildPayload(e, getEntriesByName);
          if (payload) {
            report({
              eventType: RESOURCE_ERROR_EV_TYPE,
              payload,
            });
          }
        }
      }
    }

    const { ignoreUrls, includeUrls, dedupe } = config;
    const includeRegexp = getRegexp(includeUrls);
    const ignoreRegexp = getRegexp(ignoreUrls);
    const [, , , , getEntriesByName] = applyPerformance(getDefaultPerformance());
    let lastUrl = undefined;

    subjects.push(globalErrorSubject[0]((event) => {
      event = event || win.event;
      if (event) {
        event = getDataFromEvent(event);
        if (event) {
          reportResourceError(event);
        }
      }
    }));

    return reportResourceError;
  }
}

const RESOURCE_ERROR_MONITOR_PLUGIN_NAME = 'resourceError';
const defaultConfig$1 = { includeUrls: [], ignoreUrls: [], dedupe: true };

export default function ResourceErrorMonitorPlugin(client) {
  client.on('init', () => {
    const pluginConfig = getPluginConfig(client, RESOURCE_ERROR_MONITOR_PLUGIN_NAME, defaultConfig$1);
    if (pluginConfig) {
      const subjects = [];
      const reportResourceError = resourceErrorGetterWithContext(
        client.report.bind(client),
        subjects,
        [initSubjectInGlobal(client, errorSubject)],
        pluginConfig,
      );
      client.on('beforeDestroy', function () {
        subjects.forEach((dispose) => dispose());
      });
      if (reportResourceError) {
        client.provide('reportResourceError', reportResourceError);
      }
    }
  });
}
