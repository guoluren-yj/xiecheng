import React, { useEffect } from 'react';
import { isEmpty } from 'lodash';
import useRuleConfig from '@/hooks/useRuleConfig';
import { registerCustDimFields } from './funcs';

let isRegister = false;

// 高阶组件注入维度配置信息
export default function withCustomDimensions(suspendLoad) {
  return Component => {
    return props => {
      const [config, , { init }] = useRuleConfig({
        code: 'custDimensions',
        defaultValue: [],
      });
      useEffect(() => {
        // 预加载动态值集
        if (!isEmpty(config) && !isRegister) {
          registerCustDimFields(config);
          isRegister = true;
        }
      }, [config]);

      if (init || !suspendLoad) {
        return React.createElement(Component, { ...props, custDimensions: config });
      } else {
        return null;
      }
    };
  };
}
