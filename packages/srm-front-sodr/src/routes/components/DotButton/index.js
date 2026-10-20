import React from 'react';
import { Menu } from 'choerodon-ui/pro';

import { Button } from 'components/Permission';

import styles from './index.less';

export default (props) => {
  const { inMenuItem, children, onClick, notificationDot = false } = props;
  if (inMenuItem) {
    return (
      <Menu.Item onClick={onClick}>
        {children}
        <span className={notificationDot && styles['menu-item-notification-dot']} />
      </Menu.Item>
    );
  }
  return (
    <Button
      {...props}
      className={notificationDot ? styles['button-notification-dot'] : undefined}
    />
  );
};
