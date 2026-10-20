import React from 'react';
import { Tooltip } from 'hzero-ui';

export default ({ comp: Comp, ...others }) => {
  return (
    <Tooltip title={others.value} placement="topLeft" overlayStyle={others?.overlayStyle}>
      <Comp {...others} />
    </Tooltip>
  );
};
