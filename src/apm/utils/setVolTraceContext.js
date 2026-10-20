import uuid4 from 'uuid/v4';
import getConfig from './getConfig';
import isHitBySampleRate from './isHitBySampleRate';

const SAMPLED = '01';
const DEFAULT_TRACE_CONFIG = { sampleRate: 1, origins: [] };

export default function setVolTraceContext(client, state) {
  const config = getConfig(client, DEFAULT_TRACE_CONFIG);
  if (config && isHitBySampleRate(config.sampleRate)) {
    return (e, t) => {
      const { origins } = config;
      if (origins.length && Boolean(e.match(new RegExp(origins.join('|'))))) {
        t('x-rum-traceparent', `00-${uuid4()}-${uuid4().substring(16)}-${SAMPLED}`);
        t('x-rum-tracestate', state);
      }
    };
  }
}
