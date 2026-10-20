import type { ForwardRefExoticComponent } from 'react';
import React, { forwardRef } from 'react';
import C7NTooltip from 'choerodon-ui/lib/tooltip';
import type {
  AbstractTooltipProps,
  AdjustOverflow,
  PlacementsConfig,
  RenderFunction,
  TooltipPlacement,
  TooltipProps,
  TooltipTheme,
  TooltipTrigger,
} from 'choerodon-ui/lib/tooltip';

export type { PlacementsConfig, AdjustOverflow, AbstractTooltipProps, RenderFunction, TooltipPlacement, TooltipProps, TooltipTheme, TooltipTrigger };

const Tooltip: ForwardRefExoticComponent<TooltipProps> = forwardRef<C7NTooltip, TooltipProps>((props, ref) => {
  return <C7NTooltip prefixCls="ant-tooltip" {...props} ref={ref} />;
});
Tooltip.displayName = 'Tooltip<hzeroWithTooltip>';

export default Tooltip;
