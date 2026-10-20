import type { FunctionComponent } from 'react';
import React from 'react';
import { Size } from 'choerodon-ui/lib/_util/enum';
import { ProgressType } from 'choerodon-ui/lib/progress/enum';
import type { ProgressProps } from 'choerodon-ui/lib/progress/progress';
import C7NProgress from 'choerodon-ui/lib/progress';

export {
  ProgressType,
  Size as ProgressSize,
};

export type {
  ProgressProps,
}

const Progress: FunctionComponent<ProgressProps> = function (props) {
  return <C7NProgress prefixCls="ant-progress" {...props} />;
};

Progress.displayName = 'Progress<hzeroWithC7n>';

type ProgressComponent = typeof Progress & {
  Line: any;
  Circle: any;
  Loading: any;
}

export default Progress as ProgressComponent;
