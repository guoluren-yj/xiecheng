import React from 'react';
import { Menu, Dropdown } from 'choerodon-ui/pro';
import styles from './index.less';

export default function DropdownPro({
  children,
  buttons = [], // { show, btnComp, btnProps }
  width = 160,
  placement = 'bottomRight',
}) {
  const overlay = buttons
    .filter((f) => f.show !== false)
    .map((m) => {
      const { btnText, btnProps } = m;
      const defaultProps = {
        funcType: 'flat',
        style: {
          width: '100%',
          textAlign: 'left',
          marginLeft: 0,
          paddingLeft: 20,
          whiteSpace: 'nowrap',
        },
      };

      return (
        <m.btnComp {...defaultProps} {...btnProps}>
          {btnText}
        </m.btnComp>
      );
    });
  return (
    <Dropdown
      placement={placement}
      overlay={() => (
        <Menu className={styles['btn-list-content']} style={{ minWidth: width }}>
          {overlay}
        </Menu>
      )}
    >
      {children}
    </Dropdown>
  );
}
