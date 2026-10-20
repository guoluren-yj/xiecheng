import type { FunctionComponent } from 'react';
import React from 'react';
import { Breakpoint } from 'choerodon-ui/lib/responsive/enum';
import type { BreakpointMap } from 'choerodon-ui/lib/responsive/Responsive';
import C7NRow from 'choerodon-ui/lib/row';
import type { RowProps } from 'choerodon-ui/lib/row';

export {
  Breakpoint,
}

export type {
  BreakpointMap,
  RowProps,
};

const Row: FunctionComponent<RowProps> = function Row(props) {
  return <C7NRow prefixCls="ant-row" {...props} />;
};

Row.displayName = 'Row<hzeroWithC7n>';

export default Row;
