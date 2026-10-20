import React from 'react';
import { Popconfirm } from 'choerodon-ui';
import { Button } from 'choerodon-ui/pro';
import { observer } from 'mobx-react-lite';
import { Button as PermissionButton } from 'components/Permission';

const HeadButton = observer(
  ({
    children,
    dataSet,
    name,
    getDisabled = (e) => e,
    bindBtns = [],
    onClick,
    confirmProps,
    permission,
    ...btnProps
  }) => {
    const bindBtnLoading = dataSet ? bindBtns.some((s) => dataSet.getState(`${s}_loading`)) : false;
    const loading = dataSet
      ? btnProps.loading || dataSet.getState(`${name}_loading`)
      : btnProps.loading;
    const disabled = dataSet
      ? getDisabled(dataSet) || btnProps.disabled || dataSet.status !== 'ready'
      : btnProps.disabled;
    const clickFn = async () => {
      if (dataSet) dataSet.setState(`${name}_loading`, true);
      await onClick();
      if (dataSet) dataSet.setState(`${name}_loading`, false);
    };
    if (confirmProps) {
      return (
        <Popconfirm onConfirm={clickFn} {...confirmProps}>
          <Button {...btnProps} loading={loading} disabled={disabled}>
            {children}
          </Button>
        </Popconfirm>
      );
    }
    const ButtonRef = permission ? PermissionButton : Button;
    return (
      <ButtonRef
        {...btnProps}
        loading={loading || bindBtnLoading}
        onClick={clickFn}
        disabled={disabled}
      >
        {children}
      </ButtonRef>
    );
  }
);

export default HeadButton;
