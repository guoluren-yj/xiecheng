import React from 'react';
import { Button } from 'hzero-ui';
import { Tooltip } from 'choerodon-ui';
import { observer } from 'mobx-react';
import { Button as C7NButton } from 'choerodon-ui/pro';
import SupplierLov from 'srm-front-boot/lib/components/SupplierLov';
// import QuotationDetailImport from '@/routes/components/QuotationDetailImport';
// import { useModal } from 'hzero-front/lib/components/Import';

// 处理组件 PS：新版导入组通过自带的 buttonTooltip 处理
const renderTooltipProps = (tooltip, props) => {
  const { btnType, visible, disabled, help } = tooltip || {};
  const show = disabled || visible;
  if (btnType === 'supplierLov') {
    return (
      <Tooltip title={show ? help : null}>
        <SupplierLov {...props} />
      </Tooltip>
    );
  }
};

// h0
const TooltipButton = (props) => {
  const { children, help, disabled, visible, tooltipProps = {}, ...otherProps } = props;
  const btnProps = { disabled, ...otherProps };
  // 非普通按钮组件 通过tooltipProps处理
  if (tooltipProps.btnType) {
    return renderTooltipProps(tooltipProps, props);
  }
  return (
    <Tooltip title={disabled || visible ? help : null}>
      <Button {...btnProps}>{children}</Button>
    </Tooltip>
  );
};

// c7n
/**
 * @param {Object} props - 组件props { tooltipProps, visible, visible, help, ... }
 */
const TooltipButtonPro = observer((props) => {
  const { children, help, visible, disabled, tooltipProps = {}, ...otherProps } = props || {};
  const show = disabled || visible;
  const btnProps = { disabled, ...otherProps };
  // 非普通按钮组件 通过tooltipProps处理
  if (tooltipProps.btnType) {
    return renderTooltipProps(tooltipProps, props);
  }
  return (
    <Tooltip title={show ? help : null}>
      <C7NButton {...btnProps}>{children}</C7NButton>
    </Tooltip>
  );
});

export { TooltipButton, TooltipButtonPro };
