import type { FunctionComponent } from 'react';
import React from 'react';
import C7NAlert from 'choerodon-ui/lib/alert';
import type { AlertProps } from 'choerodon-ui/lib/alert';

export type {
  AlertProps,
};

const Alert: FunctionComponent<AlertProps> = function Alert(props) {
  const { description } = props;
  return <C7NAlert prefixCls="ant-alert" iconOutline={!!description} {...props} />;
};

Alert.displayName = 'Alert<hzeroWithC7n>';

export default Alert;
