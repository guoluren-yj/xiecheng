import reportSelfError from '../utils/reportSelfError';
import isHitBySampleRate from '../utils/isHitBySampleRate';

function id(e) {
  return e;
}

function withSampleRate(sample, sample_rate) {
  const common = sample.common || {};
  common.sample_rate = sample_rate;
  sample.common = common;
  return sample;
}

function hitFnWithRandom(isSession, t, n, r, o) {
  if (isSession) {
    const i = o(r, t);
    return () => i;
  }
  return () => n(t);
}

function matchFilter(t, e) {
  try {
    if (e.type === 'rule') {
      return checkFilter(t, e.field, e.op, e.values);
    }
    if (e.type === 'and') {
      return e.children.every((e) => matchFilter(t, e));
    }
    return e.children.some((e) => matchFilter(t, e));
  } catch (e) {
    reportSelfError(e);
    return false;
  }
}

function getHitMap(rules, i, a, u, c, s) {
  const f = {};
  Object.keys(rules).forEach((e) => {
    const rule = rules[e];
    const {
      enable,
      sample_rate,
      conditional_sample_rules,
    } = rule;
    if (enable) {
      f[e] = {
        enable,
        sample_rate,
        effectiveSampleRate: sample_rate * a,
        hit: hitFnWithRandom(i, sample_rate, u, c, s),
      };
      if (conditional_sample_rules) {
        f[e].conditional_hit_rules = conditional_sample_rules.map((conditional_sample_rule) => {
          const { sample_rate, filter } = conditional_sample_rule;
          return {
            sample_rate,
            hit: hitFnWithRandom(i, sample_rate, u, c, s),
            effectiveSampleRate: sample_rate * a,
            filter,
          };
        });
      }
    } else {
      f[e] = {
        enable,
        hit() {
          return false;
        },
        sample_rate: 0,
        effectiveSampleRate: 0,
      };
    }
  });
  return f;
}

function getSampler(userId, sample, n, random) {
  if (!sample) {
    return id;
  }
  const {
    sample_rate,
    include_users,
    sample_granularity,
    rules,
    r = Math.random(),
  } = sample;
  if (include_users.includes(userId)) {
    return (e) => withSampleRate(e, 1);
  }
  const isSession = 'session' === sample_granularity;
  const hitFn = hitFnWithRandom(isSession, sample_rate, n, r, random);
  const hitMap = getHitMap(rules, isSession, sample_rate, n, r, random);
  return (e) => {
    if (!hitFn()) {
      return false;
    }
    if (!(e.eventType in hitMap)) {
      return withSampleRate(e, sample_rate);
    }
    if (!hitMap[e.eventType].enable) {
      return false;
    }
    if (e.common?.sample_rate) {
      return e;
    }
    const evt = hitMap[e.eventType];
    const { conditional_hit_rules } = evt;
    if (conditional_hit_rules) {
      for (let r = 0, len = conditional_hit_rules.length; r < len; r++) {
        if (matchFilter(e, conditional_hit_rules[r].filter)) {
          return !!conditional_hit_rules[r].hit() && withSampleRate(e, conditional_hit_rules[r].effectiveSampleRate);
        }
      }
    }
    return !!evt.hit() && withSampleRate(e, evt.effectiveSampleRate);
  };
}

function isHitByRandom(random, t) {
  return random < Number(t);
}

export default function SamplePlugin(client) {
  client.on('start', () => {
    const config = client.config();
    const userId = config.userId;
    const sample = config.sample;
    if (sample && sample.sample_rate === 0) {
      client.destroy();
    }
    client.on('build', getSampler(userId, sample, isHitBySampleRate, isHitByRandom));
  });
}
