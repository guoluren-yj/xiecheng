import type { FunctionComponent } from 'react';
import React from 'react';
import type { PopoverProps } from 'choerodon-ui/lib/popover';
import C7NPopover from 'choerodon-ui/lib/popover';

const Popover: FunctionComponent<PopoverProps> = function Popover(props) {
  return <C7NPopover prefixCls="ant-popover" {...props} />;
};

Popover.displayName = 'Popover<hzeroWithC7n>';

export default Popover;
