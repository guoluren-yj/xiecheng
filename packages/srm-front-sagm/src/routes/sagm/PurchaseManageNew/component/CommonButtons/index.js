import React from 'react';
import { observer } from 'mobx-react-lite';
import { Popconfirm } from 'choerodon-ui';
import classNames from 'classnames';
import { Icon, Button, Dropdown, Menu } from 'choerodon-ui/pro';
// import intl from 'utils/intl';
// import { filterNullValueObject } from 'utils/utils';
// import ExcelExport from 'components/ExcelExport';
import { Button as PermissionButton } from 'components/Permission';
// import c7nModal from '@/utils/c7nModal';

import styles from './index.less';

const ObserverBtn = observer(
  ({
    dataSet,
    text,
    permission,
    className = '',
    isHeadButton = true,
    getText = (e) => e,
    getLoading,
    getDisable = () => false,
    ...btnProps
  }) => {
    const disabled = dataSet ? btnProps.disabled || getDisable(dataSet) : btnProps.disabled;

    const loading = getLoading ? btnProps.loading || getLoading(dataSet) : btnProps.loading;
    const ButtonRef = permission ? PermissionButton : Button;
    // 注意顺序
    return (
      <ButtonRef
        {...btnProps}
        type="c7n-pro"
        funcType="flat"
        className={classNames({ [className]: true, [styles['weight-head-btn']]: isHeadButton })}
        disabled={disabled}
        loading={loading}
      >
        {getText() || text}
      </ButtonRef>
    );
  }
);

const DropdownBtns = ({ children, menus, width = 100, placement = 'right' }) => {
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
        getDisable = () => false,
        getChildRef = () => false,
      } = m;
      const btnProps = {
        color,
        loading,
        disabled,
        onClick: event,
        funcType: 'flat',
        style: {
          // width: '100%',
          textAlign: 'left',
          marginLeft: 0,
          whiteSpace: 'nowrap',
        },
      };

      const defaultRef = dataSet ? (
        <ObserverBtn
          text={text}
          dataSet={dataSet}
          getText={getText}
          isHeadButton={false}
          getLoading={getLoading}
          getDisable={getDisable}
          permission={permission}
          permissionList={permissionList}
          {...btnProps}
        />
      ) : (
        <Button {...btnProps}>{text}</Button>
      );
      return (
        <div className="dropdown-btn-wrapper">{getChildRef(dataSet) || childRef || defaultRef}</div>
      );
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

const DropdownBtn = ({ text, primary, color, icon, permission, hiddenIcon, ...props }) => {
  const forceClass = primary ? styles['primary-head-btn'] : styles['drop-head-btn'];
  const ButtonRef = permission ? PermissionButton : Button;
  return (
    <ButtonRef
      type="c7n-pro"
      className={forceClass}
      icon={icon}
      color={color}
      style={{ display: 'flex', alignItems: 'center' }}
      {...props}
    >
      {text}
      <Icon
        type="expand_more"
        style={{
          marginLeft: 4,
          marginTop: -2,
          fontSize: '16px',
          display: hiddenIcon ? 'none' : undefined,
        }}
      />
    </ButtonRef>
  );
};

const MenuItemBtn = ({ btnComp, ...btnProps }) => {
  const BtnComp = btnComp || ObserverBtn;
  return (
    <div className={styles['menu-item-btn']}>
      <BtnComp {...btnProps} funcType="flat" isHeadButton={false} />
    </div>
  );
};

const HeadButton = observer(
  ({
    children,
    dataSet,
    name, // btnText = '',
    getDisable = () => false,
    getBtnText = () => '',
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
      ? getDisable(dataSet) || btnProps.disabled || dataSet.status !== 'ready'
      : btnProps.disabled;
    const text = dataSet ? getBtnText(dataSet) : '';
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
        {text || children}
      </ButtonRef>
    );
  }
);

export { ObserverBtn, DropdownBtns, DropdownBtn, MenuItemBtn, HeadButton };
