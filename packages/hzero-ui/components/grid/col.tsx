import type { FunctionComponent} from 'react';
import React, { memo } from 'react';
import C7NCol from 'choerodon-ui/lib/col';
import type { ColProps, ColSize } from 'choerodon-ui/lib/col';

export type {
  ColSize, ColProps,
};

const Col: FunctionComponent<ColProps> = function Col(props) {
  return <C7NCol prefixCls="ant-col" {...props} />;
};

Col.displayName = 'Col<hzeroWithC7n>';

export default memo(Col);
