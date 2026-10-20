import type { FunctionComponent } from 'react';
import React from 'react';
import Menu from 'choerodon-ui/lib/menu';

const C7NMenuItem = Menu.Item;

const MenuItem: FunctionComponent<any> = function MenuItem(props) {
  return <C7NMenuItem checkable={false} rippleDisabled tooltipPrefixCls="ant-tooltip" {...props} />;
};

MenuItem.displayName = 'MenuItem<hzeroWithC7n>';

type MenuItemType = typeof MenuItem & { isMenuItem: number }

(MenuItem as MenuItemType).isMenuItem = 1;

export default MenuItem as MenuItemType;
