import React from 'react';
import { Dropdown, Icon } from 'choerodon-ui/pro';
import { Button as PermissionButton } from 'components/Permission';

import Content from './Content';

export default ({ children, contentProps = {}, ...props }) => (
  <Dropdown overlay={<Content {...contentProps} />}>
    <PermissionButton {...props}>
      {children}
      <Icon type="expand_more" style={{ marginTop: -2 }} />
    </PermissionButton>
  </Dropdown>
);
