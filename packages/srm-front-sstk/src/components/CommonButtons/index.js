import React from 'react';
import { observer } from 'mobx-react-lite';
import { debounce } from 'lodash';
import { Popconfirm } from 'choerodon-ui';
import classNames from 'classnames';
import { Icon, Button, Dropdown, Menu } from 'choerodon-ui/pro';
// import intl from 'utils/intl';
// import { filterNullValueObject } from 'utils/utils';
// import ExcelExport from 'components/ExcelExport';
import { Button as PermissionButton } from 'components/Permission';

import styles from './index.less';

const ObserverBtn = observer(
  ({
    dataSet,
    btnComp,
    text,
    permission,
    className = '',
    isHeadButton = true,
    getText = (e) => e,
    getLoading,
    getDisable = () => false,
    ...btnProps
  }) => {
    const disabled = dataSet
      ? btnProps.disabled || getDisable(dataSet.selected)
      : btnProps.disabled;

    const loading = getLoading ? btnProps.loading || getLoading(dataSet) : btnProps.loading;
    const ButtonRef = permission ? PermissionButton : Button;
    if (btnComp) {
      return btnComp;
    }
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

const DropdownBtns = ({ children, menus = [], width = 100, style = {}, placement = 'right' }) => {
  const overlay = menus
    .filter((f) => f.show !== false)
    .map((m) => {
      const {
        text,
        color,
        dataSet,
        childRef,
        style: _style = {},
        permission,
        permissionList,
        disabled = false,
        loading = false,
        event = (e) => e,
        getText = (e) => e,
        getLoading = () => false,
        getDisable = () => false,
      } = m;
      const btnProps = {
        color,
        loading,
        disabled,
        onClick: event,
        funcType: 'flat',
        style: {
          width: '100%',
          textAlign: 'left',
          marginLeft: 0,
          paddingLeft: 20,
          height: 40,
          whiteSpace: 'nowrap',
          ..._style,
        },
      };
      const defaultRef = dataSet ? (
        <ObserverBtn
          text={text}
          dataSet={dataSet}
          getText={getText}
          isHeadButton={false}
          // getDisable={getDisable}
          permission={permission}
          permissionList={permissionList}
          {...btnProps}
          getLoading={getLoading}
          getDisable={getDisable}
        />
      ) : (
        <Button {...btnProps}>{text}</Button>
      );
      // const _childRef = (
      //   <p className='child-ref'>{childRef}</p>
      // );
      return childRef || defaultRef;
    });
  const positionStyle = placement === 'right' ? { right: 0 } : { left: 0 };
  return (
    <div className={styles['btn-list-container']} style={style}>
      {children}
      <div className="btn-list-content" style={{ minWidth: width, ...positionStyle }}>
        {overlay}
      </div>
    </div>
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
      // style={{ display: 'flex', alignItems: 'center' }}
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

// 可绑定loading的按钮
const HeadButton = observer(
  ({
    children,
    dataSet,
    name,
    bindBtn = [],
    permission,
    onClick,
    delay = 0,
    confirmProps,
    ...btnProps
  }) => {
    const loading = dataSet
      ? btnProps.loading || dataSet.getState(`${name}_loading`)
      : btnProps.loading;
    const disabled = dataSet ? btnProps.disabled || dataSet.status !== 'ready' : btnProps.disabled;
    const clickFn = debounce(async () => {
      if (dataSet) {
        dataSet.setState(`${name}_loading`, true);
        if (bindBtn.length > 0) {
          bindBtn.forEach((b) => {
            dataSet.setState(`${b}_loading`, true);
          });
        }
      }
      await onClick();
      if (dataSet) {
        dataSet.setState(`${name}_loading`, false);
        if (bindBtn.length > 0) {
          bindBtn.forEach((b) => {
            dataSet.setState(`${b}_loading`, false);
          });
        }
      }
    }, delay);

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
        loading={loading}
        onClick={clickFn}
        disabled={disabled}
        type="c7n-pro"
      >
        {children}
      </ButtonRef>
    );
  }
);

const DropdownMenuBtns = ({ children, title = '', menus = [], width = 160, placement = 'left' }) => {
  const overlay = menus
    .filter((f) => f.show !== false)
    .map((m) => {
      const {
        text,
        color,
        dataSet,
        btnComp,
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
          btnComp={btnComp}
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
      return getChildRef(dataSet) || childRef || defaultRef;
    });
  const position = placement === 'right' ? 'bottomRight' : 'bottomLeft';
  return (
    <Dropdown
      placement={position}
      overlay={() => (
        <Menu className={styles['btn-list-content1']} style={{ minWidth: width }}>
          {overlay}
        </Menu>
      )}
    >
      {children || title}
    </Dropdown>
  );
};

const MenuItemLinkBtn = ({ btnComp, style, ...btnProps }) => {
  const BtnComp = btnComp || ObserverBtn;
  return (
    <div className="drop-down-import-btn-wrapper" style={style}>
      <BtnComp {...btnProps} isHeadButton={false} />
    </div>
  );
};

export { ObserverBtn, DropdownBtns, DropdownBtn, MenuItemBtn, HeadButton, DropdownMenuBtns, MenuItemLinkBtn };
