import React from 'react';
import { Dropdown, Menu } from 'choerodon-ui/pro';

export default ({ children, menus, ...dropProps }) => {
  const overlay = (
    <Menu>
      {menus.map((m) => {
        const { text, event = (e) => e } = m;
        const menuProps = {
          key: text,
          onClick: event,
          style: { width: 120, paddingLeft: 20 },
        };
        return <Menu.Item {...menuProps}>{text}</Menu.Item>;
      })}
    </Menu>
  );
  return (
    <Dropdown overlay={overlay} {...dropProps}>
      {children}
    </Dropdown>
  );
};
