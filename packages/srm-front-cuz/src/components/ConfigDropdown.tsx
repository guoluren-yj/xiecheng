import React, { ReactNode } from "react";
import type { DropDownProps } from 'choerodon-ui/lib/dropdown';
import { Dropdown, Menu } from 'choerodon-ui/pro';
export interface ConfigDropdownProps extends DropDownProps {
  name: string;
  overlay: any[];
  children: ReactNode;
}
const noop = () => {};
export default function ConfigDropdown(props: ConfigDropdownProps) {
  const { name, children, trigger, overlay = [], ...others } = props;
  return (
    <Dropdown
      {...(others as any)}
      key={name}
      trigger={trigger as any}
      overlay={
        <Menu style={{ minWidth: '100px' }} onClick={noop}>
          {overlay.map(item => (
            <Menu.Item {...item} />
          ))}
        </Menu>
      }
    >
      {children}
    </Dropdown>
  );
}
ConfigDropdown.displayName = 'ConfigDropdown';