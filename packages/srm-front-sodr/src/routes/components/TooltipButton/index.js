import React from 'react';
import { Tooltip } from 'choerodon-ui/pro';

import { Button } from 'components/Permission';

export default function TooltipButton({ tipTitle, buttonText, btnProps = {} }) {
  return (
    <Tooltip title={tipTitle}>
      <Button {...btnProps}>{buttonText}</Button>
    </Tooltip>
  );
}
