import type { FunctionComponent } from 'react';
import React from 'react';
import C7NMenu from 'choerodon-ui/lib/menu';
import type { ClickParam, MenuMode, MenuProps, MenuState, MenuTheme, SelectParam } from 'choerodon-ui/lib/menu';
import Item from './MenuItem';
import C7NMenuProps from './overwriteProps';

const { Divider, ItemGroup, SubMenu } = C7NMenu;

export { Divider, ItemGroup, SubMenu };

export type {
  SelectParam, ClickParam, MenuMode, MenuProps, MenuState, MenuTheme,
};

const Menu: FunctionComponent<MenuProps> = function Menu(props) {
  return <C7NMenu {...C7NMenuProps} {...props} />;
};

type MenuType = typeof Menu & {
  Divider: typeof Divider;
  Item: typeof Item;
  SubMenu: typeof SubMenu;
  ItemGroup: typeof ItemGroup;
}
(Menu as MenuType).Divider = Divider;
(Menu as MenuType).Item = Item;
(Menu as MenuType).SubMenu = SubMenu;
(Menu as MenuType).ItemGroup = ItemGroup;

export default Menu as MenuType;
