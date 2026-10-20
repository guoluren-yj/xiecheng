import React from 'react';
import { Tooltip } from 'choerodon-ui/pro';

export default function TooltipBtnWrap(props) {
  const { visible = false, title = '', children } = props || {};

  return <Tooltip title={visible ? title : null}>{children}</Tooltip>;
}
