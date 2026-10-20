import type { ForwardRefExoticComponent } from 'react';
import React, { forwardRef } from 'react';
import C7NBackTop from 'choerodon-ui/lib/back-top';
import type { BackTopProps } from 'choerodon-ui/lib/back-top';

export type {
  BackTopProps,
};

const BackTop: ForwardRefExoticComponent<BackTopProps> = forwardRef<C7NBackTop, BackTopProps>((props, ref) => {
  return <C7NBackTop prefixCls="ant-back-top" {...props} ref={ref} />;
});

BackTop.displayName = 'BackTop<hzeroWithC7n>';

export default BackTop;
