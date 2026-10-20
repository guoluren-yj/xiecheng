import React from 'react';
import { Icon } from 'choerodon-ui';
import { Button, Menu, Dropdown, Modal } from 'choerodon-ui/pro';
import { isEmpty } from 'lodash';

import intl from 'utils/intl';
import { getResponse } from 'utils/utils';
import notification from 'utils/notification';
import { revokeApproveService } from '@/routes/sstk/StockWorkbench/api';

const DropdownMenus = ({ children, menus, ...dropProps }) => {
  const overlay = (
    <Menu>
      {menus.map(m => {
        const { text, event = e => e } = m;
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
const getOptions = (actions = [], maxLength = 4) => {
  const filterActions = actions.filter(f => {
    const { show = true } = f;
    return show;
  });
  const viewActions =
    filterActions.length > maxLength ? filterActions.slice(0, maxLength - 1) : filterActions;
  const menuActions = filterActions.slice(maxLength - 1, filterActions.length);
  const command = viewActions.map(m => {
    const { text, iconSpace, disabled, event = e => e, items = [], style } = m;
    if (items && items.length > 0) {
      return (
        <DropdownMenus menus={items} placement="bottomLeft">
          <Button funcType="link" color="primary" style={style}>
            {text}
            <Icon type="expand_more" style={{ fontSize: 14, marginLeft: 4, marginTop: -2 }} />
          </Button>
        </DropdownMenus>
      );
    }
    return (
      <Button disabled={disabled} onClick={event} funcType="link">
        {text}
        {iconSpace && (
          <Icon
            type="expand_more"
            style={{ fontSize: 14, marginLeft: 4, marginTop: -2, visibility: 'hidden' }}
          />
        )}
      </Button>
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
};

/**
 * 撤销审批
 */
export async function handleRevokeApprove(businessKey, callback = e => e) {
  Modal.confirm({
    title: intl.get('hzero.common.message.confirm').d('提示'),
    children: intl
      .get('hzero.common.view.revokeApproval.tip')
      .d('您确定要撤销审批吗？您可以在撤销后再次提交审批（注意：仅工作流审批发起人可执行撤销）'),
    onOk: async () => {
      const res = getResponse(await revokeApproveService(businessKey));
      if (isEmpty(res)) {
        notification.success();
        if (callback) {
          callback();
        }
      } else {
        notification.error({
          message: intl.get('hzero.common.status.mistake').d('错误'),
          description: res,
        });
      }
    },
  });
}

export { getOptions };
