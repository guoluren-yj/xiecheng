import React from 'react';
import { observer } from 'mobx-react-lite';
import classNames from 'classnames';
import { Button, Dropdown, Menu } from 'choerodon-ui/pro';
// import intl from 'utils/intl';
// import { filterNullValueObject } from 'utils/utils';
import { Button as PermissionButton } from 'components/Permission';
// import c7nModal from '@/utils/c7nModal';

import styles from './index.less';

const ObserverBtn = observer(
  ({
    dataSet,
    children,
    text,
    permission,
    className = '',
    getText = (e) => e,
    getLoading,
    getDisabled = () => false,
    ...btnProps
  }) => {
    const disabled = dataSet
      ? btnProps.disabled || getDisabled(dataSet.selected)
      : btnProps.disabled;

    const loading = getLoading ? btnProps.loading || getLoading(dataSet) : btnProps.loading;
    const ButtonRef = permission ? PermissionButton : Button;
    // 注意顺序
    return (
      <ButtonRef
        {...btnProps}
        type="c7n-pro"
        funcType="flat"
        className={classNames({ [className]: true })}
        disabled={disabled}
        loading={loading}
      >
        {children || getText() || text}
      </ButtonRef>
    );
  }
);

const DropdownMenuBtns = ({ children, menus = [], width = 120, placement = 'left' }) => {
  const overlay = menus
    .filter((f) => f.show !== false)
    .map((m) => {
      const {
        text,
        color,
        dataSet,
        childRef,
        permission,
        permissionList,
        disabled = false,
        loading = false,
        event = (e) => e,
        getText = (e) => e,
        getLoading = () => false,
        getDisabled = () => false,
        getChildRef = () => false,
        ...others
      } = m;
      const btnProps = {
        color,
        loading,
        disabled,
        onClick: event,
        funcType: 'flat',
        style: {
          width: 'fit-content',
          textAlign: 'left',
          whiteSpace: 'nowrap',
        },
        ...others,
      };

      const defaultRef = dataSet ? (
        <ObserverBtn
          text={text}
          dataSet={dataSet}
          getText={getText}
          isHeadButton={false}
          getLoading={getLoading}
          getDisabled={getDisabled}
          permission={permission}
          permissionList={permissionList}
          {...btnProps}
        />
      ) : (
        <Button {...btnProps}>{text}</Button>
      );
      return getChildRef(dataSet) || childRef || defaultRef;
    });
  const position = placement === 'right' ? 'bottomRight' : 'bottomLeft';
  return (
    <Dropdown
      placement={position}
      overlay={() => (
        <Menu className={styles['btn-list-content']} style={{ minWidth: width }}>
          {overlay}
        </Menu>
      )}
    >
      {children}
    </Dropdown>
  );
};

export { ObserverBtn, DropdownMenuBtns };
