import getPluginConfig from '../utils/getPluginConfig';
import getDefaultPerformance from '../utils/getDefaultPerformance';
import getRegexp from '../utils/getRegexp';
import initSubjectInGlobal from '../utils/initSubjectInGlobal';
import applyPerformance from '../utils/applyPerformance';
import loadSubject from '../subjects/loadSubject';
import resourceSubject from '../subjects/resourceSubject';

const RESOURCE_EV_TYPE = 'resource';
const RESOURCE_PERFORMANCE_ENTRY_TYPE = 'resource';
const RESOURCE_IGNORE_TYPES = ['xmlhttprequest', 'fetch', 'beacon'];

function resourceGetterWithContext(report, subjects, [globalLoadSubject, getGlobalResourceSubject], pluginConfig) {
  const performance = getDefaultPerformance();
  if (performance) {
    const { slowSessionThreshold, ignoreTypes, ignoreUrls } = pluginConfig;
    const regExp = getRegexp(ignoreUrls);
    const send = (entries, reportSample = false) => {

      if (!(ignoreTypes || RESOURCE_IGNORE_TYPES).includes(entries.initiatorType) && !(regExp && regExp.test(entries.name))) {
        const data = {
          eventType: RESOURCE_EV_TYPE,
          payload: entries,
        };
        if (reportSample) {
          data.extra = { sample_rate: 1 };
        }

        report(data);
      }
    };

    subjects.push(
      globalLoadSubject[0](() => {
        const [timing, , getEntriesByType] = applyPerformance(performance);
        const reportSample = (() => {
          if (!timing) {
            return false;
          }
          return slowSessionThreshold < (timing.loadEventEnd - timing.navigationStart);
        })();
        getEntriesByType(RESOURCE_PERFORMANCE_ENTRY_TYPE).forEach((entries) => send(entries, reportSample));
        subjects.push(
          getGlobalResourceSubject()[0]((entries) => {
            send(entries);
          }),
        );
      }),
    );

  }
}

const RESOURCE_MONITOR_PLUGIN_NAME = 'resource';
const defaultConfig$2 = { ignoreUrls: [], slowSessionThreshold: 4e3 };

export default function ResourceMonitorPlugin(client) {
  client.on('init', () => {
    const pluginConfig = getPluginConfig(client, RESOURCE_MONITOR_PLUGIN_NAME, defaultConfig$2);
    if (pluginConfig) {
      const subjects = [];
      resourceGetterWithContext(
        client.report.bind(client),
        subjects,
        [
          initSubjectInGlobal(client, loadSubject),
          () => initSubjectInGlobal(client, resourceSubject),
        ],
        pluginConfig,
      );

      client.on('beforeDestroy', () => {
        subjects.forEach((dispose) => dispose());
      });
    }
  });
}
