import React from "react";
import { observer } from "mobx-react-lite";
import { Button } from "choerodon-ui/pro";

export default observer<any>(({ visible, disabled, children, icon, ...props }) => {
  if (visible && !visible()) return null;
  return <Button {...props} disabled={disabled && disabled()} icon={typeof icon === "function" ? icon() : icon}>{typeof children === "function" ? children() : children}</Button>;
});