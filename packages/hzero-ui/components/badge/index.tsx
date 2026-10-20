import type { FunctionComponent } from 'react';
import React from 'react';
import C7NBadge from 'choerodon-ui/lib/badge';
import type { BadgeProps } from 'choerodon-ui/lib/badge';
import type { ScrollNumberProps } from 'choerodon-ui/lib/badge/ScrollNumber';

export type { BadgeProps, ScrollNumberProps };

const Badge: FunctionComponent<BadgeProps> = function Badge(props) {
  return <C7NBadge prefixCls="ant-badge" scrollNumberPrefixCls="ant-scroll-number" {...props} />;
};

Badge.displayName = 'Badge<hzeroWithC7n>';

export default Badge;
