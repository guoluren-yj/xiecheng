import React from 'react';
import { Popconfirm } from 'choerodon-ui';
import { Button } from 'choerodon-ui/pro';
import { observer } from 'mobx-react-lite';

/**
 * 通用button 可配置显隐、统一loading、事件func
 */
const C7nButtonWrapper = observer(
  ({ children, dataSet, name, onClick, confirmProps, ...btnProps }) => {
    const loading = dataSet
      ? btnProps.loading || dataSet.getState(`${name}_loading`)
      : btnProps.loading;
    const disabled = dataSet ? btnProps.disabled || dataSet.status !== 'ready' : btnProps.disabled;
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
    return (
      <Button {...btnProps} loading={loading} onClick={clickFn} disabled={disabled}>
        {children}
      </Button>
    );
  }
);

export default C7nButtonWrapper;
