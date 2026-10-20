import React, { useMemo } from 'react';
import useRuleConfig from '@/hooks/useRuleConfig';

// 给class组件注入配置信息
export default function withRuleConfig({ code, defaultValue }, { suspendLoad } = {}) {
  return (Component) => {
    return (props) => {
      const [config, fetchConfig, { init, loading }] = useRuleConfig({ code, defaultValue });
      const configProps = useMemo(
        () => ({
          config,
          fetchConfig,
          init,
          loading,
        }),
        [config, init, loading]
      );
      if (init || !suspendLoad) {
        return React.createElement(Component, { ...props, [code]: configProps });
      } else {
        return null;
      }
    };
  };
}
