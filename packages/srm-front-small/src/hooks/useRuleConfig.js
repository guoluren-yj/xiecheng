// 用于管理一些业务规则配置
import { useState, useEffect } from 'react';
import { getResponse } from 'utils/utils';
import ruleConfig from './ruleConfigService';

export default function useRuleConfig({ code, params, defaultValue = false }) {
  const [ruleConfigRes, setRuleConfigRes] = useState(defaultValue);
  useEffect(() => {
    const { value } = ruleConfig[code] || {};
    if (value !== undefined) {
      setRuleConfigRes(value);
    } else {
      fetchRuleConfig();
    }
  }, []);

  async function fetchRuleConfig() {
    const { api } = ruleConfig[code] || {};
    if (typeof api === 'function') {
      const res = getResponse(await api(params));
      if (res !== undefined) {
        ruleConfig[code].value = res;
        setRuleConfigRes(res);
      }
    }
  }

  return [ruleConfigRes, fetchRuleConfig];
}
