/**
 * NewWrapDropdown
 * @author Hugh <huazhen.wu01@going-link.com>
 * @date 2022/7/7
 * @copyright 2022 © ZHENYUN
 */

import React from 'react';
import { Divider, Icon, Menu } from 'choerodon-ui';
import { Dropdown } from 'choerodon-ui/pro';
import { isArray } from 'lodash';

const defaultTrigger = ['click'];

const dividerStyle = { margin: 0, height: '0.005rem' };

const NewWrapDropdown = function NewWrapDropdown(props) {
  const {
    host,
    items,
    disabled,
    getPopupContainer,
    placement,
    trigger = defaultTrigger,
    menuClassName,
    onHiddenChange,
    onItemClick,
    hidden = true,
  } = props;
  const renderOverlay = (menuItems = []) => {
    return menuItems.reduce((list, menuItem) => {
      if (menuItem) {
        if (isArray(menuItem)) {
          list.push([
            ...renderOverlay(menuItem),
            <Divider style={dividerStyle} />,
          ]);
        } else {
          const { ele, type, key, icon, className } = menuItem;
          if (ele && type === 'subItem') {
            list.push(
              <div className={className}>
                {icon && <Icon type={icon} />}
                {ele}
              </div>,
            );
          } else {
            list.push(
              <Menu.Item key={key} className={className}>
                {icon && <Icon type={icon} />}
                {ele}
              </Menu.Item>,
            );
          }
        }
      }
      return list;
    }, []);
  };

  return (
    <Dropdown
      trigger={trigger}
      disabled={disabled}
      getPopupContainer={getPopupContainer}
      placement={placement}
      hidden={hidden}
      onHiddenChange={onHiddenChange}
      overlay={
        <Menu selectedKeys={[]} onClick={onItemClick} className={menuClassName}>
          {renderOverlay(items)}
        </Menu>
      }
    >
      {host}
    </Dropdown>
  );
};

export default NewWrapDropdown;
