import { isNumber, isObject, isString } from 'lodash';
import safeStringify from '../utils/safeStringify';

const CUSTOM_EV_TYPE = 'custom';
const CUSTOM_EVENT_TYPE = 'event';
const CUSTOM_LOG_TYPE = 'log';

function normalizeCustomEventData(evt) {
  if (evt && isObject(evt) && evt.name && isString(evt.name)) {
    const eventData = {
      name: evt.name,
      type: CUSTOM_EVENT_TYPE,
    };
    if ('metrics' in evt && isObject(evt.metrics)) {
      const { metrics } = evt;
      const newMetrics = {};
      for (const key in metrics) {
        if (isNumber(metrics[key])) {
          newMetrics[key] = metrics[key];
        }
      }
      eventData.metrics = newMetrics;
    }
    if ('categories' in evt && isObject(evt.categories)) {
      const { categories } = evt;
      const newCategories = {};
      for (const key in categories) {
        newCategories[key] = safeStringify(categories[key]);
      }
      eventData.categories = newCategories;
    }
    return eventData;
  }
}

function normalizeCustomLogData(e) {
  if (e && isObject(e) && e.content && isString(e.content)) {
    const logData = {
      content: safeStringify(e.content),
      type: CUSTOM_LOG_TYPE,
      level: 'info',
    };
    if ('level' in e) {
      logData.level = e.level;
    }
    if ('extra' in e && isObject(e.extra)) {
      const { extra } = e;
      const metrics = {};
      const categories = {};
      for (const n in extra) {
        if (isNumber(extra[n])) {
          metrics[n] = extra[n];
        } else {
          categories[n] = safeStringify(extra[n]);
        }
      }
      logData.metrics = metrics, logData.categories = categories;
    }
    return logData;
  }
}

export default function CustomPlugin(client) {
  client.provide('sendEvent', (evt) => {
    const customEventData = normalizeCustomEventData(evt);
    if (customEventData) {
      client.report({
        eventType: CUSTOM_EV_TYPE,
        payload: customEventData,
        extra: { timestamp: Date.now() },
      });
    }
  });
  client.provide('sendLog', function (e) {
    const logData = normalizeCustomLogData(e);
    if (logData) {
      client.report({
        eventType: CUSTOM_EV_TYPE,
        payload: logData,
        extra: { timestamp: Date.now() },
      });
    }
  });
}
