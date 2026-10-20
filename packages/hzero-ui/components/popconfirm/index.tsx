import type { FunctionComponent } from 'react';
import React from 'react';
import C7NPopconfirm from 'choerodon-ui/lib/popconfirm';
import type { PopconfirmLocale, PopconfirmProps, PopconfirmState } from 'choerodon-ui/lib/popconfirm';
import C7NButtonProps from '../button/overwriteProps';

export type {
  PopconfirmProps, PopconfirmLocale, PopconfirmState,
};

export const C7NPopconfirmProps: PopconfirmProps = {
  title: undefined,
  prefixCls: 'ant-popover',
  iconType: 'info',
  okButtonProps: C7NButtonProps,
  cancelButtonProps: C7NButtonProps,
};

const Popconfirm: FunctionComponent<PopconfirmProps> = function Popconfirm(props) {
  return (
    <C7NPopconfirm
      {...C7NPopconfirmProps}
      {...props}
    />
  );
};
Popconfirm.displayName = 'hzeroWithC7n';

export default Popconfirm;
