import React from 'react';
import SupplierLov from 'srm-front-boot/lib/components/SupplierLov';
import { Tooltip } from 'choerodon-ui/pro';
import { observer } from 'mobx-react-lite';

// 给供应商组件类型的个性化按钮加气泡
const PackSupplierLov = observer((props) => {
  const {
    buttonTooltip, // 气泡name
    buttonTooltipShowFlag, // 是否显示气泡
    children,
    ...othersLovProps
  } = props;
  return buttonTooltipShowFlag && buttonTooltip ? (
    <Tooltip title={buttonTooltip}>
      <SupplierLov {...othersLovProps}>{children}</SupplierLov>
    </Tooltip>
  ) : (
    <SupplierLov {...props}>{children}</SupplierLov>
  );
});

export default PackSupplierLov;
