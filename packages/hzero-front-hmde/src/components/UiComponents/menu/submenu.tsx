import React from 'react';
import { MenuContext } from './context';
import { MenuItemInner } from './item';

export const MenuSubMenu: React.SFC<any> = (props) => {
  const { hotkey, children, ...others } = props;
  return (
    <MenuContext.Consumer>
      {(context) => {
        const { prefixCls } = context;
        const wrapProps = (MenuItemInner as any).getProps(
          { context, ...props },
          `${prefixCls}-submenu`
        );
        return (
          <div {...wrapProps}>
            {(MenuItemInner as any).getContent(
              { context, ...others },
              null,
              <span className={`${prefixCls}-submenu-arrow`} />,
              <div className={`${prefixCls}-submenu-menu`}>{children}</div>
            )}
          </div>
        );
      }}
    </MenuContext.Consumer>
  );
};
