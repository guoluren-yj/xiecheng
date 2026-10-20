import React from 'react';
import { Button, Icon } from 'choerodon-ui/pro';

import intl from 'utils/intl';
import { Button as PermissionButton } from 'components/Permission';

import DropdownMenus from '../ProtocolWorkbench/component/DropdownMenus';

export default function getOptions(actions = [], maxLength = 4) {
  const filterActions = actions.filter((f) => {
    const { _show = true } = f;
    return _show;
  });
  const viewActions =
    filterActions.length > maxLength ? filterActions.slice(0, maxLength - 1) : filterActions;
  // 更多操作
  const menuActions = filterActions.slice(maxLength - 1, filterActions.length);
  const command = viewActions.map((m) => {
    const { text, disabled, permission = false, event = (e) => e, ...others } = m;
    const ButtonRef = permission ? PermissionButton : Button;
    return (
      <ButtonRef disabled={disabled} onClick={event} funcType="link" type="c7n-pro" {...others}>
        {text}
      </ButtonRef>
    );
  });
  if (filterActions.length > maxLength) {
    command.push(
      <DropdownMenus menus={menuActions} placement="bottomLeft">
        <Button funcType="link" color="primary">
          {intl.get('hzero.common.button.more').d('更多')}
          <Icon type="expand_more" style={{ fontSize: 14, marginLeft: 4, marginTop: -2 }} />
        </Button>
      </DropdownMenus>
    );
  }
  return command;
}
