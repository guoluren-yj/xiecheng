import React from 'react';
import { Tooltip, Button } from 'choerodon-ui/pro';

export default function TooltipBtnWrap(props) {
  const { visible = false, title = '', btnProps = {}, children } = props || {};

  return (
    <Tooltip title={visible ? title : null}>
      <Button {...btnProps}>{children}</Button>
    </Tooltip>
  );
}
