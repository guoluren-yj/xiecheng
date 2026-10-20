import React from 'react';
import { observer } from 'mobx-react-lite';
import classNames from 'classnames';
import { Button as PermissionButton } from 'components/Permission';
import { Button } from 'choerodon-ui/pro';
import styles from '../index.less';

const ObserverBtn = observer(
  ({
    dataSet,
    text,
    child,
    permissionList,
    className,
    isHeadButton = true,
    getText = (e) => e,
    getLoading,
    getDisable = (e) => e,
    ...btnProps
  }) => {
    const disabled = dataSet
      ? btnProps.disabled || getDisable(dataSet.selected)
      : btnProps.disabled;

    const loading = getLoading ? btnProps.loading || getLoading(dataSet) : btnProps.loading;
    const ButtonRef = permissionList ? PermissionButton : Button;
    return (
      <ButtonRef
        type="c7n-pro"
        {...btnProps}
        permissionList={permissionList || null}
        disabled={disabled}
        loading={loading}
        className={classNames({
          [className || '']: true,
          [styles['weight-head-btn']]: isHeadButton,
        })}
      >
        {getText() || text || child}
      </ButtonRef>
    );
  }
);

export const MenuItemBtn = ({ btnComp, ...btnProps }) => {
  const BtnComp = btnComp || ObserverBtn;
  return (
    <div className={styles['workbench-btn-wrapper']}>
      <BtnComp {...btnProps} funcType="flat" isHeadButton={false} />
    </div>
  );
};
