import React from 'react';
import { observer } from 'mobx-react-lite';
// import { Form as HForm, Input, Tag, Tooltip } from 'choerodon-ui';
import classNames from 'classnames';
import {
  Button,
  // TextField,
  // Form,
  // Select,
  // Lov,
  // Row,
  // Col,
  Dropdown,
  Menu,
  Icon,
  Tooltip,
  // DateTimePicker,
} from 'choerodon-ui/pro';
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
    getText = () => '',
    getLoading,
    getDisable = () => false,
    icon,
    getIcon = () => '',
    children,
    getIsPrimary = () => false,
    funcType = 'flat',
    ...btnProps
  }) => {
    const getPrimaryProps = (props) => {
      if (!getIsPrimary(dataSet)) return { ...props, funcType };
      const _props = Object.assign(props);
      _props.color = 'primary';
      return _props;
    };
    const disabled = dataSet
      ? btnProps.disabled || getDisable(dataSet.selected, dataSet)
      : btnProps.disabled;
    const loading = getLoading ? btnProps.loading || getLoading(dataSet) : btnProps.loading;
    const ButtonRef = permission ? PermissionButton : Button;
    return (
      <ButtonRef
        {...getPrimaryProps(btnProps)} // 注意顺序
        icon={icon || getIcon(dataSet)}
        type="c7n-pro"
        className={classNames({ [className]: true, [styles['weight-head-btn']]: isHeadButton })}
        disabled={disabled}
        loading={loading}
      >
        {children || getText(dataSet) || text}
      </ButtonRef>
    );
  }
);

const DropdownBtns = ({ children, menus = [], width = 120, style = {}, placement = 'right' }) => {
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
          getLoading={getLoading}
          getDisable={getDisable}
          permission={permission}
          permissionList={permissionList}
          {...btnProps}
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

const DropdownBtn = ({ text, primary, permission, hiddenIcon, dataSet, btnHelp, ...props }) => {
  const forceClass = primary ? styles['primary-head-btn'] : styles['drop-head-btn'];
  const ButtonRef = permission ? PermissionButton : dataSet ? ObserverBtn : Button;
  return (
    <ButtonRef
      type="c7n-pro"
      className={forceClass}
      style={{ display: 'flex', alignItems: 'center' }}
      dataSet={dataSet}
      {...props}
    >
      {text}
      {btnHelp && (
        <Tooltip title={btnHelp}>
          <Icon type="help" style={{ marginLeft: 4, fontSize: 16, fontWeight: 400 }} />
        </Tooltip>
      )}
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
    <div>
      <BtnComp
        {...btnProps}
        funcType="flat"
        isHeadButton={false}
        style={{ fontWeight: 'normal' }}
      />
    </div>
  );
};

const DropdownMenuBtns = ({
  children,
  title = '',
  menus = [],
  width = 160,
  placement = 'right',
}) => {
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
        getText = () => '',
        getLoading = () => false,
        getDisable = () => false,
        getChildRef = () => false,
        ...others
      } = m;
      const btnProps = {
        ...others,
        color,
        loading,
        disabled,
        onClick: event,
        funcType: 'flat',
        style: {
          width: '100%',
          height: 40,
          // textAlign: 'left',
          marginLeft: 0,
          paddingLeft: 20,
          whiteSpace: 'nowrap',
          justifyContent: 'flex-start',
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
    <div className={styles['drop-down-link-btn-wrapper']} style={style}>
      <BtnComp {...btnProps} funcType="link" isHeadButton={false} />
    </div>
  );
};

export { ObserverBtn, DropdownBtns, DropdownBtn, MenuItemBtn, DropdownMenuBtns, MenuItemLinkBtn };
