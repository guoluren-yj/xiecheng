/*
 * @Date: 2023-04-20 11:15:01
 * @Author: LXM <xiaomei.lv@going-link.com>
 * @Version: 0.0.1
 * @Copyright: Copyright (c) 2021, Hand
 */
import React, { Fragment, cloneElement, isValidElement } from 'react';
import { drop, slice, isEmpty } from 'lodash';
import { Button, Dropdown, Menu, Icon } from 'choerodon-ui/pro';

import intl from 'utils/intl';

import styles from './index.less';

const Index = ({ buttons }) => {
  // 总按钮个数超过3个时，才需下拉展示
  // 平铺按钮
  const tiledBtns = buttons.length > 3 ? slice(buttons, 0, 2) : buttons;
  // 下拉按钮
  const dropDownBtns = buttons.length > 3 ? drop(buttons, 2) : [];

  // 渲染下拉菜单
  const renderMenus = () => {
    // 更多中的按钮本身也是个菜单
    const menuList = dropDownBtns.filter(n => n.isMenu);
    const notMenuList = dropDownBtns.filter(n => !n.isMenu);
    return (
      <Fragment>
        <Menu>
          {notMenuList.map(({ child, name, btnComp = null, ...props }) => {
            const commonProps = {
              ...props,
              waitType: 'throttle',
              wait: 300,
              funcType: 'text',
            };
            let newBtnComp = <Button>{child}</Button>;
            if (isValidElement(btnComp)) {
              newBtnComp = btnComp;
            }
            return (
              <Menu.Item style={{ padding: 0 }} key={name}>
                {cloneElement(newBtnComp, commonProps)}
              </Menu.Item>
            );
          })}
        </Menu>
        {menuList.map(n => {
          const { child, ...porops } = n;
          return cloneElement(child, porops);
        })}
      </Fragment>
    );
  };

  return (
    <div className={styles['more-btn-wrap']}>
      {tiledBtns.map(({ child, label, isMenu, name, btnComp = null, ...props }) => {
        if (isMenu) {
          return (
            <Dropdown overlay={child} key={name}>
              <Button funcType="link">
                <span>{label}</span>
                <Icon type="expand_more" style={{ fontSize: 16, marginRight: 0 }} />
              </Button>
            </Dropdown>
          );
        } else {
          const commonProps = {
            ...props,
            key: name,
            waitType: 'throttle',
            wait: 300,
            funcType: 'link',
          };
          if (isValidElement(btnComp)) {
            return cloneElement(btnComp, commonProps);
          }
          return <Button {...commonProps}>{child}</Button>;
        }
      })}
      {!isEmpty(dropDownBtns) && (
        <Dropdown overlay={() => renderMenus()}>
          <Button funcType="link">
            <span>{intl.get('hzero.common.button.more').d('更多')}</span>
            <Icon type="expand_more" style={{ fontSize: 16, marginRight: 0 }} />
          </Button>
        </Dropdown>
      )}
    </div>
  );
};

export default Index;
