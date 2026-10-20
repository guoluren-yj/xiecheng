import React from 'react';
import { Button } from 'hzero-ui';
import { Tooltip } from 'choerodon-ui';
import { observer } from 'mobx-react';
import { Button as C7NButton } from 'choerodon-ui/pro';

// h0
const TooltipButton = props => {
  const { children, tooltip, disabled, visible, ...otherProps } = props;
  const btnProps = { disabled, ...otherProps };
  return (
    <Tooltip title={disabled || visible ? tooltip : null}>
      <Button {...btnProps}>{children}</Button>
    </Tooltip>
  );
};

// c7n
/**
 * @param {Object} props - 组件props { tooltipProps, visible, visible, help, ... }
 */
const TooltipButtonPro = observer(props => {
  const { children, tooltip, visible, disabled, ...otherProps } = props || {};
  const show = disabled || visible;
  const btnProps = { disabled, ...otherProps };
  return (
    <Tooltip title={show ? tooltip : null}>
      <C7NButton {...btnProps}>{children}</C7NButton>
    </Tooltip>
  );
});

export { TooltipButton, TooltipButtonPro };
