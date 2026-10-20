import type { FunctionComponent } from 'react';
import React from 'react';
import C7NDivider from 'choerodon-ui/lib/divider';
import type { DividerProps } from 'choerodon-ui/lib/divider';

export type {
  DividerProps,
};

const Divider: FunctionComponent<DividerProps> = function Divider(props) {
  return <C7NDivider prefixCls="ant-divider" {...props} />;
};

Divider.displayName = 'Divider<hzeroWithC7n>';

export default Divider;
