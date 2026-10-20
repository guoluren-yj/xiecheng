import type { FunctionComponent } from 'react';
import React from 'react';
import C7NRate from 'choerodon-ui/lib/rate';
import type { RateProps } from 'choerodon-ui/lib/rate';

export type {
  RateProps,
};

const Rate: FunctionComponent<RateProps> = function Rate(props) {
  return <C7NRate {...props} prefixCls="ant-rate" />;
};

Rate.displayName = 'Rate<hzeroWithC7n>';


export default Rate;
