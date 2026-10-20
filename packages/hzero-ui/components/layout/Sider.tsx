import type { FunctionComponent } from 'react';
import React from 'react';
import type { CollapseType, SiderContext, SiderProps, SiderState, SiderTheme } from 'choerodon-ui/lib/layout/Sider';
import Layout from 'choerodon-ui/lib/layout';

const C7NSider = Layout.Sider;

export type {
  CollapseType, SiderContext, SiderProps, SiderState, SiderTheme,
};

const Sider: FunctionComponent<SiderProps> = function Sider(props) {
  return <C7NSider prefixCls="ant-layout-sider" {...props} />;
};

Sider.displayName = 'Sider<hzeroWithC7n>';

type SiderType = typeof Sider & { __ANT_LAYOUT_SIDER: boolean };

(Sider as SiderType).__ANT_LAYOUT_SIDER = true;

export default Sider as SiderType;
