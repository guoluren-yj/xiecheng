// 用于管理一些业务规则配置
import { useState, useEffect } from 'react';
import { getResponse } from 'utils/utils';
import ruleConfig from './ruleConfigService';

export default function useRuleConfig({ code, params, defaultValue = false }) {
  const { value, api, isInit } = ruleConfig[code] || {};
  const [{ init, loading }, setStatus] = useState({
    init: isInit,
    loading: false,
  });
  const [ruleConfigRes, setRuleConfigRes] = useState(defaultValue);
  useEffect(() => {
    if (value !== undefined) {
      setRuleConfigRes(value);
    } else {
      initConfig();
    }
  }, []);

  async function initConfig() {
    try {
      await fetchRuleConfig();
    } finally {
      ruleConfig[code].isInit = true;
      setStatus(prev => ({ ...prev, init: true }));
    }
  }

  async function fetchRuleConfig() {
    if (typeof api === 'function') {
      try {
        setStatus(prev => ({ ...prev, loading: true }));
        const res = getResponse(await api(params));
        if (res !== undefined) {
          ruleConfig[code].value = res;
          setRuleConfigRes(res);
        }
      } finally {
        setStatus(prev => ({ ...prev, loading: false }));
      }
    }
  }

  return [ruleConfigRes, fetchRuleConfig, { init, loading }];
}
